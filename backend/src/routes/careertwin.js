import express from 'express';
import { dbRun, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { simulateCareerTwin } from '../services/ai.js';

const router = express.Router();

// @route   POST /api/careertwin
// @desc    Generate Career Twin simulation scenarios
router.post('/', verifyToken, async (req, res) => {
  const { education, currentSkills, careerGoal } = req.body;

  if (!education || !currentSkills || !careerGoal) {
    return res.status(400).json({ message: 'Please provide education, current skills, and career goal.' });
  }

  try {
    const simulations = simulateCareerTwin(education, currentSkills, careerGoal);

    const { scenarioA, scenarioB, scenarioC } = simulations;

    // Save simulation in DB
    const insertResult = await dbRun(
      `INSERT INTO CareerTwinPredictions (user_id, education, current_skills, career_goal, scenario_a, scenario_b, scenario_c)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        education,
        currentSkills,
        careerGoal,
        JSON.stringify(scenarioA),
        JSON.stringify(scenarioB),
        JSON.stringify(scenarioC)
      ]
    );

    res.status(201).json({
      id: insertResult.id,
      education,
      currentSkills,
      careerGoal,
      ...simulations
    });
  } catch (error) {
    console.error('Career Twin simulation error:', error);
    res.status(500).json({ message: 'Server error generating career twin simulations.' });
  }
});

// @route   GET /api/careertwin/history
// @desc    Get previous simulations for the current user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const predictions = await dbAll(
      'SELECT * FROM CareerTwinPredictions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const parsedPredictions = predictions.map(item => ({
      ...item,
      scenario_a: JSON.parse(item.scenario_a),
      scenario_b: JSON.parse(item.scenario_b),
      scenario_c: JSON.parse(item.scenario_c)
    }));

    res.json(parsedPredictions);
  } catch (error) {
    console.error('Fetch career twin history error:', error);
    res.status(500).json({ message: 'Server error fetching simulation history.' });
  }
});

export default router;
