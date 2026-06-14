import express from 'express';
import { dbRun, dbAll, dbGet } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { generateSkillGapAnalysis } from '../services/ai.js';
import { updateReadinessScore } from '../utils/readiness.js';

const router = express.Router();

// @route   POST /api/skillgap
// @desc    Perform skill gap analysis based on current skills and desired role
router.post('/', verifyToken, async (req, res) => {
  const { currentSkills, targetRole } = req.body;

  if (!currentSkills || !targetRole) {
    return res.status(400).json({ message: 'Please provide current skills and desired job role.' });
  }

  try {
    const analysis = generateSkillGapAnalysis(currentSkills, targetRole);

    const {
      missingSkills,
      recommendedTech,
      learningRoadmap,
      certifications,
      skillsScore
    } = analysis;

    // Save report to DB
    const insertResult = await dbRun(
      `INSERT INTO SkillGapReports (user_id, target_role, current_skills, missing_skills, recommended_tech, learning_roadmap, certifications, skills_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        targetRole,
        currentSkills,
        JSON.stringify(missingSkills),
        JSON.stringify(recommendedTech),
        JSON.stringify(learningRoadmap),
        JSON.stringify(certifications),
        skillsScore
      ]
    );

    // Update user profile automatically (link modules)
    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [req.user.id]);
    if (profile) {
      // Add missing skills to profile in a nice way or update target role
      await dbRun(
        `UPDATE Profiles 
         SET target_job_role = ?, skills = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [targetRole, currentSkills, req.user.id]
      );
    }

    // Update readiness skills score (Skills weight is 20%)
    await updateReadinessScore(req.user.id, 'skills', skillsScore);

    res.status(201).json({
      id: insertResult.id,
      targetRole,
      currentSkills,
      ...analysis
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ message: 'Server error generating skill gap report.' });
  }
});

// @route   GET /api/skillgap/history
// @desc    Get previous skill gap reports for current user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const reports = await dbAll(
      'SELECT * FROM SkillGapReports WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const parsedReports = reports.map(item => ({
      ...item,
      missing_skills: JSON.parse(item.missing_skills),
      recommended_tech: JSON.parse(item.recommended_tech),
      learning_roadmap: JSON.parse(item.learning_roadmap),
      certifications: JSON.parse(item.certifications)
    }));

    res.json(parsedReports);
  } catch (error) {
    console.error('Fetch skill gap reports error:', error);
    res.status(500).json({ message: 'Server error fetching skill gap history.' });
  }
});

export default router;
