import express from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { updateReadinessScore } from '../utils/readiness.js';
import { generateSkillAssessmentReport } from '../services/ai.js';

const router = express.Router();

// @route   GET /api/skillassessment/list
// @desc    Get all categories, skills, and the user's top scores & badges
router.get('/list', verifyToken, async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM SkillCategories');
    const skills = await dbAll('SELECT * FROM HubSkills');
    const userScores = await dbAll(
      'SELECT skill_id, highest_score FROM Leaderboard WHERE user_id = ?',
      [req.user.id]
    );
    const badges = await dbAll(
      'SELECT skill_id, badge_name FROM UserBadges WHERE user_id = ?',
      [req.user.id]
    );

    // Group skills by category
    const formattedCategories = categories.map(cat => {
      const catSkills = skills.filter(s => s.category_id === cat.id).map(skill => {
        const scoreRecord = userScores.find(us => us.skill_id === skill.id);
        const badgeRecord = badges.find(b => b.skill_id === skill.id);
        return {
          ...skill,
          highest_score: scoreRecord ? scoreRecord.highest_score : 0,
          badge: badgeRecord ? badgeRecord.badge_name : null
        };
      });
      return { ...cat, skills: catSkills };
    });

    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching skill list:', error);
    res.status(500).json({ message: 'Server error fetching skills.' });
  }
});

// @route   POST /api/skillassessment/start
// @desc    Start a test: Generates 20 questions (8 beg, 8 int, 4 adv)
router.post('/start', verifyToken, async (req, res) => {
  const { skillId } = req.body;
  if (!skillId) return res.status(400).json({ message: 'skillId is required' });

  try {
    const skill = await dbGet('SELECT * FROM HubSkills WHERE id = ?', [skillId]);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    // Fetch questions: 8 beginner, 8 intermediate, 4 advanced
    // Random ordering
    const getQuestions = async (diff, limit) => {
      return await dbAll(
        `SELECT id, question_text, difficulty FROM HubQuestions WHERE skill_id = ? AND difficulty = ? ORDER BY RAND() LIMIT ?`,
        [skillId, diff, limit]
      );
    };

    let beg = await getQuestions('beginner', 8);
    let int = await getQuestions('intermediate', 8);
    let adv = await getQuestions('advanced', 4);

    const questions = [...beg, ...int, ...adv];
    
    // Fallback if not enough questions in DB
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions available for this skill yet. Please seed the DB.' });
    }

    // Create an attempt
    const attemptRes = await dbRun(
      'INSERT INTO SkillTestAttempts (user_id, skill_id, total_questions) VALUES (?, ?, ?)',
      [req.user.id, skillId, questions.length]
    );
    const attemptId = attemptRes.id;

    // Attach options (hiding is_correct)
    const questionsWithOptions = [];
    for (let q of questions) {
      const options = await dbAll('SELECT id, option_text FROM HubOptions WHERE question_id = ? ORDER BY RAND()', [q.id]);
      questionsWithOptions.push({ ...q, options });
    }

    res.json({
      attemptId,
      skillName: skill.skill_name,
      questions: questionsWithOptions
    });

  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ message: 'Server error starting assessment.' });
  }
});

// @route   POST /api/skillassessment/submit
// @desc    Submit answers, grade test, update AI formulas
router.post('/submit', verifyToken, async (req, res) => {
  const { attemptId, answers } = req.body; // answers = [{questionId, selectedOptionId}]
  
  if (!attemptId || !answers) return res.status(400).json({ message: 'attemptId and answers required' });

  try {
    const attempt = await dbGet('SELECT * FROM SkillTestAttempts WHERE id = ? AND user_id = ?', [attemptId, req.user.id]);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found or access denied' });

    let correctCount = 0;
    let wrongCount = 0;

    // Grade each question
    for (const ans of answers) {
      const { questionId, selectedOptionId } = ans;
      
      let isCorrect = false;
      if (selectedOptionId) {
        const opt = await dbGet('SELECT is_correct FROM HubOptions WHERE id = ? AND question_id = ?', [selectedOptionId, questionId]);
        if (opt && opt.is_correct === 1) {
          isCorrect = true;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else {
        wrongCount++;
      }

      await dbRun(
        'INSERT INTO SkillTestResults (attempt_id, question_id, selected_option_id, is_correct) VALUES (?, ?, ?, ?)',
        [attemptId, questionId, selectedOptionId || null, isCorrect]
      );
    }

    const percentage = (correctCount / attempt.total_questions) * 100;
    let level = 'Beginner';
    if (percentage > 70) level = 'Advanced';
    else if (percentage > 40) level = 'Intermediate';

    // Update attempt
    await dbRun(
      'UPDATE SkillTestAttempts SET correct_answers = ?, wrong_answers = ?, percentage_score = ?, skill_level = ? WHERE id = ?',
      [correctCount, wrongCount, percentage, level, attemptId]
    );

    // AI Analysis Report
    const skill = await dbGet('SELECT skill_name FROM HubSkills WHERE id = ?', [attempt.skill_id]);
    const aiReport = generateSkillAssessmentReport(skill.skill_name, percentage, level);

    await dbRun(
      `INSERT INTO SkillReports (attempt_id, strengths, weaknesses, topics_to_improve, recommended_courses, recommended_certifications, learning_plan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [attemptId, aiReport.strengths, aiReport.weaknesses, aiReport.topicsToImprove, aiReport.recommendedCourses, aiReport.recommendedCertifications, aiReport.learningPlan]
    );

    // Gamification - Badges
    let newlyEarnedBadge = null;
    if (percentage >= 80) {
      let badgeName = '';
      if (skill.skill_name.toLowerCase().includes('java') || skill.skill_name.toLowerCase().includes('python')) {
        badgeName = `${skill.skill_name} Master`;
      } else if (skill.skill_name.toLowerCase().includes('aws') || skill.skill_name.toLowerCase().includes('cloud')) {
        badgeName = `${skill.skill_name} Explorer`;
      } else if (percentage >= 95) {
        badgeName = `${skill.skill_name} Expert`;
      } else {
        badgeName = `${skill.skill_name} Specialist`;
      }

      // Check if already earned
      const existingBadge = await dbGet('SELECT * FROM UserBadges WHERE user_id = ? AND skill_id = ? AND badge_name = ?', [req.user.id, attempt.skill_id, badgeName]);
      if (!existingBadge) {
        await dbRun('INSERT INTO UserBadges (user_id, skill_id, badge_name) VALUES (?, ?, ?)', [req.user.id, attempt.skill_id, badgeName]);
        newlyEarnedBadge = badgeName;
      }
    }

    // Leaderboard update
    const existingLB = await dbGet('SELECT highest_score FROM Leaderboard WHERE user_id = ? AND skill_id = ?', [req.user.id, attempt.skill_id]);
    if (!existingLB) {
      await dbRun('INSERT INTO Leaderboard (user_id, skill_id, highest_score) VALUES (?, ?, ?)', [req.user.id, attempt.skill_id, percentage]);
    } else if (percentage > existingLB.highest_score) {
      await dbRun('UPDATE Leaderboard SET highest_score = ? WHERE user_id = ? AND skill_id = ?', [percentage, req.user.id, attempt.skill_id]);
    }

    // Trigger update of Career Readiness Score (now factoring Skill Assessment as 30%)
    await updateReadinessScore(req.user.id);

    res.json({
      correct: correctCount,
      wrong: wrongCount,
      percentage,
      level,
      report: aiReport,
      newBadge: newlyEarnedBadge
    });

  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Server error grading assessment.' });
  }
});

// @route   GET /api/skillassessment/leaderboard
// @desc    Get top users overall
router.get('/leaderboard', async (req, res) => {
  try {
    const topScores = await dbAll(`
      SELECT l.highest_score, s.skill_name, u.email as username, p.full_name
      FROM Leaderboard l
      JOIN HubSkills s ON l.skill_id = s.id
      JOIN Users u ON l.user_id = u.id
      JOIN Profiles p ON u.id = p.user_id
      ORDER BY l.highest_score DESC
      LIMIT 20
    `);
    
    // Anonymize/Format
    const formatted = topScores.map(score => ({
      ...score,
      student_name: score.full_name || score.username.split('@')[0]
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;
