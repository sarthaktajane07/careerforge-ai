import express from 'express';
import { dbGet, dbAll } from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { seedDatabase } from '../scripts/seedQuestions.js';

const router = express.Router();

// @route   GET /api/admin/analytics
// @desc    Get system-wide analytics & administrative metrics
router.get('/analytics', verifyToken, requireAdmin, async (req, res) => {
  try {
    // 1. Fetch total counts
    const usersCountObj = await dbGet("SELECT COUNT(*) as count FROM Users WHERE role = 'student'");
    const assessmentsCountObj = await dbGet("SELECT COUNT(*) as count FROM CareerAssessments");
    const interviewsCountObj = await dbGet("SELECT COUNT(*) as count FROM Interviews");
    const resumesCountObj = await dbGet("SELECT COUNT(*) as count FROM Resumes");

    const totalUsers = usersCountObj ? usersCountObj.count : 0;
    const totalAssessments = assessmentsCountObj ? assessmentsCountObj.count : 0;
    const totalInterviews = interviewsCountObj ? interviewsCountObj.count : 0;
    const totalResumes = resumesCountObj ? resumesCountObj.count : 0;

    // 2. Fetch all student profiles for reports
    const studentUsers = await dbAll(`
      SELECT u.id, u.email, u.created_at, p.full_name, p.target_job_role, r.readiness_percentage, r.readiness_level
      FROM Users u
      LEFT JOIN Profiles p ON u.id = p.user_id
      LEFT JOIN ReadinessScores r ON u.id = r.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    // 3. Fetch averages for scores (For Charts)
    const avgScoresObj = await dbGet(`
      SELECT 
        AVG(resume_score) as avgResume, 
        AVG(interview_score) as avgInterview, 
        AVG(skills_score) as avgSkills, 
        AVG(assessment_score) as avgAssessment,
        AVG(readiness_percentage) as avgReadiness
      FROM ReadinessScores
    `);

    const averages = {
      resume: avgScoresObj && avgScoresObj.avgResume ? Math.round(avgScoresObj.avgResume * 10) / 10 : 0,
      interview: avgScoresObj && avgScoresObj.avgInterview ? Math.round(avgScoresObj.avgInterview * 10) / 10 : 0,
      skills: avgScoresObj && avgScoresObj.avgSkills ? Math.round(avgScoresObj.avgSkills * 10) / 10 : 0,
      assessment: avgScoresObj && avgScoresObj.avgAssessment ? Math.round(avgScoresObj.avgAssessment * 10) / 10 : 0,
      readiness: avgScoresObj && avgScoresObj.avgReadiness ? Math.round(avgScoresObj.avgReadiness * 10) / 10 : 0,
    };

    // 4. Readiness Level distribution (For Charts)
    const levelsDistribution = await dbAll(`
      SELECT readiness_level, COUNT(*) as count 
      FROM ReadinessScores 
      GROUP BY readiness_level
    `);

    const distribution = {
      Beginner: 0,
      Developing: 0,
      'Job Ready': 0,
      'Industry Ready': 0
    };
    levelsDistribution.forEach(item => {
      if (item.readiness_level in distribution) {
        distribution[item.readiness_level] = item.count;
      }
    });

    // 5. Recent activity logs (system-wide)
    const recentAssessments = await dbAll(`
      SELECT c.created_at, c.score, p.full_name, 'Assessment' as type
      FROM CareerAssessments c
      INNER JOIN Profiles p ON c.user_id = p.user_id
      ORDER BY c.created_at DESC LIMIT 5
    `);

    const recentInterviews = await dbAll(`
      SELECT i.created_at, i.overall_score as score, p.full_name, 'Interview' as type
      FROM Interviews i
      INNER JOIN Profiles p ON i.user_id = p.user_id
      ORDER BY i.created_at DESC LIMIT 5
    `);

    const recentResumes = await dbAll(`
      SELECT r.uploaded_at as created_at, a.ats_score as score, p.full_name, 'Resume Upload' as type
      FROM Resumes r
      INNER JOIN ResumeAnalysis a ON r.id = a.resume_id
      INNER JOIN Profiles p ON r.user_id = p.user_id
      ORDER BY r.uploaded_at DESC LIMIT 5
    `);

    const systemActivities = [
      ...recentAssessments,
      ...recentInterviews,
      ...recentResumes
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    res.json({
      metrics: {
        totalUsers,
        totalAssessments,
        totalInterviews,
        totalResumes
      },
      charts: {
        averages,
        readinessDistribution: distribution
      },
      studentReports: studentUsers,
      recentActivities: systemActivities
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving administration analytics.' });
  }
});

// @route   POST /api/admin/seed-question-bank
// @desc    Admin utility to generate and insert the initial question bank
router.post('/seed-question-bank', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (error) {
    console.error('Seed database error:', error);
    res.status(500).json({ message: 'Server error generating question bank.' });
  }
});

export default router;
