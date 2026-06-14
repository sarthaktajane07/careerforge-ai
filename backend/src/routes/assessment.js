import express from 'express';
import { dbRun, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { generateCareerAssessment } from '../services/ai.js';
import { updateReadinessScore } from '../utils/readiness.js';

const router = express.Router();

// @route   POST /api/assessment
// @desc    Submit career assessment questionnaire
router.post('/', verifyToken, async (req, res) => {
  const { interest, workStyle, codingExp, designPref } = req.body;

  if (!interest || !workStyle || !codingExp) {
    return res.status(400).json({ message: 'Please answer all required questions.' });
  }

  try {
    const assessmentResult = generateCareerAssessment({ interest, workStyle, codingExp, designPref });

    const {
      recommendedPaths,
      strengths,
      weaknesses,
      improvementAreas,
      careerSuggestions,
      score
    } = assessmentResult;

    // Save assessment to DB
    const insertResult = await dbRun(
      `INSERT INTO CareerAssessments (user_id, answers, recommended_paths, strengths, weaknesses, improvement_areas, career_suggestions, score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        JSON.stringify({ interest, workStyle, codingExp, designPref }),
        JSON.stringify(recommendedPaths),
        JSON.stringify(strengths),
        JSON.stringify(weaknesses),
        JSON.stringify(improvementAreas),
        JSON.stringify(careerSuggestions),
        score
      ]
    );

    // Update readiness score (Assessment weight is 20%)
    await updateReadinessScore(req.user.id, 'assessment', score);

    res.status(201).json({
      id: insertResult.id,
      ...assessmentResult
    });
  } catch (error) {
    console.error('Assessment submit error:', error);
    res.status(500).json({ message: 'Server error processing assessment.' });
  }
});

// @route   GET /api/assessment/history
// @desc    Get assessment history for the current user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const assessments = await dbAll(
      'SELECT * FROM CareerAssessments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Parse JSON fields
    const parsedAssessments = assessments.map(item => ({
      ...item,
      answers: JSON.parse(item.answers),
      recommended_paths: JSON.parse(item.recommended_paths),
      strengths: JSON.parse(item.strengths),
      weaknesses: JSON.parse(item.weaknesses),
      improvement_areas: JSON.parse(item.improvement_areas),
      career_suggestions: JSON.parse(item.career_suggestions)
    }));

    res.json(parsedAssessments);
  } catch (error) {
    console.error('Assessment fetch error:', error);
    res.status(500).json({ message: 'Server error fetching assessment history.' });
  }
});

export default router;
