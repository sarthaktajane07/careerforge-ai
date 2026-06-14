import { dbGet, dbRun } from '../db.js';
import { calculateReadinessScore } from '../services/ai.js';

export const updateReadinessScore = async (userId, scoreType, newScore) => {
  try {
    // Get current scores or create entry if missing
    let scores = await dbGet('SELECT * FROM ReadinessScores WHERE user_id = ?', [userId]);
    
    if (!scores) {
      await dbRun(
        `INSERT INTO ReadinessScores (user_id, resume_score, interview_score, skills_score, assessment_score, readiness_percentage, readiness_level)
         VALUES (?, 0.0, 0.0, 0.0, 0.0, 0.0, 'Beginner')`,
        [userId]
      );
      scores = {
        resume_score: 0.0,
        interview_score: 0.0,
        skills_score: 0.0,
        assessment_score: 0.0
      };
    }

    // Map fields
    let resume = scores.resume_score;
    let interview = scores.interview_score;
    let skills = scores.skills_score;
    let assessment = scores.assessment_score;

    if (scoreType === 'resume') resume = newScore;
    else if (scoreType === 'interview') interview = newScore;
    else if (scoreType === 'skills') skills = newScore;
    else if (scoreType === 'assessment') assessment = newScore;

    // Recalculate readiness
    const { percentage, level } = calculateReadinessScore(resume, interview, skills, assessment);

    // Update DB
    await dbRun(
      `UPDATE ReadinessScores 
       SET resume_score = ?, interview_score = ?, skills_score = ?, assessment_score = ?, readiness_percentage = ?, readiness_level = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [resume, interview, skills, assessment, percentage, level, userId]
    );

    console.log(`Updated readiness scores for user ${userId}. Score: ${percentage}%, Level: ${level}`);
    return { percentage, level };
  } catch (error) {
    console.error('Error updating readiness score:', error);
    throw error;
  }
};
