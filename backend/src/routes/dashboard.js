import express from 'express';
import { dbGet, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get aggregated student dashboard metrics & activities
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Profile Completion calculation
    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [userId]);
    let profileCompletion = 0;
    if (profile) {
      if (profile.full_name) profileCompletion += 20;
      if (profile.target_job_role) profileCompletion += 20;
      if (profile.education) profileCompletion += 20;
      if (profile.skills) profileCompletion += 20;
      if (profile.interests) profileCompletion += 20;
    }

    // 2. Readiness scores
    let readiness = await dbGet('SELECT * FROM ReadinessScores WHERE user_id = ?', [userId]);
    if (!readiness) {
      readiness = {
        resume_score: 0,
        interview_score: 0,
        skills_score: 0,
        assessment_score: 0,
        readiness_percentage: 0,
        readiness_level: 'Beginner'
      };
    }

    // 3. Career Twin latest summary
    const latestTwin = await dbGet(
      'SELECT id, career_goal, scenario_a, scenario_b, scenario_c, created_at FROM CareerTwinPredictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    let careerTwinReport = null;
    if (latestTwin) {
      careerTwinReport = {
        id: latestTwin.id,
        careerGoal: latestTwin.career_goal,
        createdAt: latestTwin.created_at,
        scenarioA: JSON.parse(latestTwin.scenario_a),
        scenarioB: JSON.parse(latestTwin.scenario_b),
        scenarioC: JSON.parse(latestTwin.scenario_c),
      };
    }

    // 4. Compile recent activities chronology
    const activities = [];

    // Fetch assessments
    const assessments = await dbAll(
      'SELECT id, score, created_at FROM CareerAssessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    assessments.forEach(item => {
      activities.push({
        id: `assessment-${item.id}`,
        type: 'assessment',
        title: 'Career Assessment',
        description: `Completed career quiz. Score: ${item.score}%`,
        date: item.created_at
      });
    });

    // Fetch resumes
    const resumes = await dbAll(
      `SELECT r.id, r.file_name, r.uploaded_at, a.ats_score 
       FROM Resumes r 
       LEFT JOIN ResumeAnalysis a ON r.id = a.resume_id 
       WHERE r.user_id = ? 
       ORDER BY r.uploaded_at DESC LIMIT 3`,
      [userId]
    );
    resumes.forEach(item => {
      activities.push({
        id: `resume-${item.id}`,
        type: 'resume',
        title: 'Resume Analyzed',
        description: `Uploaded "${item.file_name}" (ATS Score: ${item.ats_score}%)`,
        date: item.uploaded_at
      });
    });

    // Fetch interviews
    const interviews = await dbAll(
      'SELECT id, job_role, overall_score, created_at FROM Interviews WHERE user_id = ? AND overall_score > 0 ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    interviews.forEach(item => {
      activities.push({
        id: `interview-${item.id}`,
        type: 'interview',
        title: 'Mock Interview',
        description: `Conducted mock interview for "${item.job_role}". Score: ${item.overall_score}%`,
        date: item.created_at
      });
    });

    // Fetch skill gaps
    const skillgaps = await dbAll(
      'SELECT id, target_role, skills_score, created_at FROM SkillGapReports WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );
    skillgaps.forEach(item => {
      activities.push({
        id: `skillgap-${item.id}`,
        type: 'skillgap',
        title: 'Skill Gap Report',
        description: `Generated roadmap for "${item.target_role}". Match Score: ${item.skills_score}%`,
        date: item.created_at
      });
    });

    // Sort activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      profileCompletion,
      readinessScores: {
        resume: readiness.resume_score,
        interview: readiness.interview_score,
        skills: readiness.skills_score,
        assessment: readiness.assessment_score,
        percentage: readiness.readiness_percentage,
        level: readiness.readiness_level
      },
      careerTwinReport,
      recentActivities: activities.slice(0, 5) // return top 5
    });
  } catch (error) {
    console.error('Fetch dashboard summary error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard summary.' });
  }
});

export default router;
