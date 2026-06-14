import express from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { generateInterviewQuestions, gradeInterviewResponse, gradeVoiceVideoSession } from '../services/ai.js';
import { updateReadinessScore } from '../utils/readiness.js';

const router = express.Router();

// @route   POST /api/interview/start
// @desc    Start a mock interview session and generate questions
router.post('/start', verifyToken, async (req, res) => {
  const { jobRole, mode } = req.body;

  try {
    // Determine job role, fallback to profile target job role
    let selectedRole = jobRole;
    if (!selectedRole) {
      const profile = await dbGet('SELECT target_job_role FROM Profiles WHERE user_id = ?', [req.user.id]);
      selectedRole = profile && profile.target_job_role ? profile.target_job_role : 'Software Engineer';
    }

    // Generate questions
    let questions = generateInterviewQuestions(selectedRole);
    if (mode === 'voice-video') {
      // Keep only 3 questions to prevent fatigue during speaking: 1 HR + 2 Technical
      const hr = questions.filter(q => q.type === 'hr').slice(0, 1);
      const tech = questions.filter(q => q.type === 'technical').slice(0, 2);
      questions = [...hr, ...tech];
    }

    // Save Interview session
    const interviewResult = await dbRun(
      'INSERT INTO Interviews (user_id, job_role, overall_score, feedback, improvement_suggestions, mode) VALUES (?, ?, 0, "", "", ?)',
      [req.user.id, selectedRole, mode || 'text']
    );
    const interviewId = interviewResult.id;

    // Save Questions list linked to session
    const savedQuestions = [];
    for (const q of questions) {
      const qResult = await dbRun(
        'INSERT INTO InterviewQuestions (interview_id, question_text, question_type) VALUES (?, ?, ?)',
        [interviewId, q.question, q.type]
      );
      savedQuestions.push({
        id: qResult.id,
        questionText: q.question,
        questionType: q.type
      });
    }

    res.status(201).json({
      interviewId,
      jobRole: selectedRole,
      questions: savedQuestions
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Server error starting mock interview.' });
  }
});

// @route   POST /api/interview/submit
// @desc    Submit answers for a mock interview session and grade them
router.post('/submit', verifyToken, async (req, res) => {
  const { interviewId, responses, videoMetrics } = req.body; // responses: [{ questionId, answer }]

  if (!interviewId || !responses || !Array.isArray(responses)) {
    return res.status(400).json({ message: 'Please submit responses and interview ID.' });
  }

  try {
    // Validate interview session ownership
    const interview = await dbGet('SELECT * FROM Interviews WHERE id = ? AND user_id = ?', [interviewId, req.user.id]);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found or access denied.' });
    }

    let overallFeedback = '';
    let suggestions = '';
    let averageScore = 0;
    const gradedResponses = [];
    let evalResult = null;

    if (interview.mode === 'voice-video') {
      const qaList = [];
      for (const resp of responses) {
        const { questionId, answer } = resp;

        // Get original question text
        const question = await dbGet('SELECT * FROM InterviewQuestions WHERE id = ? AND interview_id = ?', [questionId, interviewId]);
        if (!question) continue;

        // Grade response
        const grading = gradeInterviewResponse(question.question_text, answer);
        
        // Insert response
        await dbRun(
          `INSERT INTO InterviewResponses (interview_id, question_id, user_answer, score, feedback)
           VALUES (?, ?, ?, ?, ?)`,
          [interviewId, questionId, answer || '', grading.score, grading.feedback]
        );

        gradedResponses.push({
          questionId,
          questionText: question.question_text,
          questionType: question.question_type,
          userAnswer: answer || '',
          score: grading.score,
          feedback: grading.feedback
        });

        qaList.push({
          questionText: question.question_text,
          userAnswer: answer || ''
        });
      }

      // Grade voice-video aggregates
      evalResult = gradeVoiceVideoSession(qaList, videoMetrics || {});
      averageScore = evalResult.overallScore;
      overallFeedback = `Voice & Video Evaluation Summary: ${evalResult.suggestions.split(' | ')[0] || 'Good response and delivery.'}`;
      suggestions = evalResult.suggestions;

      // Update Interview table
      await dbRun(
        `UPDATE Interviews 
         SET overall_score = ?, feedback = ?, improvement_suggestions = ?, video_metrics = ? 
         WHERE id = ?`,
        [averageScore, overallFeedback, suggestions, JSON.stringify(evalResult), interviewId]
      );
    } else {
      let totalScore = 0;

      // Loop through answers, grade them, and save
      for (const resp of responses) {
        const { questionId, answer } = resp;

        // Get original question text
        const question = await dbGet('SELECT * FROM InterviewQuestions WHERE id = ? AND interview_id = ?', [questionId, interviewId]);
        if (!question) continue;

        // Grade response
        const grading = gradeInterviewResponse(question.question_text, answer);
        totalScore += grading.score;

        // Insert response
        await dbRun(
          `INSERT INTO InterviewResponses (interview_id, question_id, user_answer, score, feedback)
           VALUES (?, ?, ?, ?, ?)`,
          [interviewId, questionId, answer || '', grading.score, grading.feedback]
        );

        gradedResponses.push({
          questionId,
          questionText: question.question_text,
          questionType: question.question_type,
          userAnswer: answer || '',
          score: grading.score,
          feedback: grading.feedback
        });
      }

      averageScore = gradedResponses.length > 0 ? Math.round(totalScore / gradedResponses.length) : 0;

      // Create high-level constructive feedback
      if (averageScore >= 85) {
        overallFeedback = 'Superb performance! You answered technical concepts accurately and structured your behavioral descriptions using the STAR format.';
        suggestions = 'Keep practicing niche system design components and advanced mock scenarios to polish speech delivery.';
      } else if (averageScore >= 70) {
        overallFeedback = 'Competent response quality. You show a good fundamental grasp of developer principles, though some answers were slightly generic.';
        suggestions = 'Elaborate more on specific personal tasks, explain execution complexities, and quantify achievements in details.';
      } else {
        overallFeedback = 'Needs improvement. Many responses were brief or lacked technical explanations. Technical topics were only brushed upon superficially.';
        suggestions = 'Revise key technical topics (databases, web protocols, asynchronous coding) and practice drafting longer STAR answers.';
      }

      // Update Interview main table
      await dbRun(
        `UPDATE Interviews 
         SET overall_score = ?, feedback = ?, improvement_suggestions = ? 
         WHERE id = ?`,
        [averageScore, overallFeedback, suggestions, interviewId]
      );
    }

    // Update aggregate Readiness Score (Interview weight is 30%)
    await updateReadinessScore(req.user.id, 'interview', averageScore);

    res.json({
      interviewId,
      overallScore: averageScore,
      feedback: overallFeedback,
      improvementSuggestions: suggestions,
      responses: gradedResponses,
      videoMetrics: interview.mode === 'voice-video' ? evalResult : undefined
    });
  } catch (error) {
    console.error('Submit interview error:', error);
    res.status(500).json({ message: 'Server error grading interview responses.' });
  }
});

// @route   GET /api/interview/history
// @desc    Get mock interview history & results
router.get('/history', verifyToken, async (req, res) => {
  try {
    const interviews = await dbAll(
      'SELECT * FROM Interviews WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const fullHistory = [];
    for (const interview of interviews) {
      const responses = await dbAll(
        `SELECT ir.id as response_id, ir.user_answer, ir.score, ir.feedback, ir.created_at,
                iq.question_text, iq.question_type
         FROM InterviewResponses ir
         INNER JOIN InterviewQuestions iq ON ir.question_id = iq.id
         WHERE ir.interview_id = ?`,
        [interview.id]
      );
      fullHistory.push({
        ...interview,
        video_metrics: interview.video_metrics ? JSON.parse(interview.video_metrics) : null,
        responses
      });
    }

    res.json(fullHistory);
  } catch (error) {
    console.error('Fetch interview history error:', error);
    res.status(500).json({ message: 'Server error retrieving mock interview history.' });
  }
});

export default router;
