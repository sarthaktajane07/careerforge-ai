import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbRun, dbGet, dbAll } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { analyzeResume } from '../services/ai.js';
import { updateReadinessScore } from '../utils/readiness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/resume/analyze
// @desc    Upload resume and perform ATS analysis
router.post('/analyze', verifyToken, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a resume file.' });
  }

  try {
    // Get user profile skills and target role
    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [req.user.id]);
    const fullName = profile ? profile.full_name : 'User';
    const skills = profile ? profile.skills : '';
    const education = profile ? profile.education : '';

    // Insert Resume record
    const relativePath = `/uploads/${req.file.filename}`;
    const resumeResult = await dbRun(
      'INSERT INTO Resumes (user_id, file_name, file_path) VALUES (?, ?, ?)',
      [req.user.id, req.file.originalname, relativePath]
    );
    const resumeId = resumeResult.id;

    // Run ATS Analyzer (simulate based on profile + filename)
    // In a production app, we would parse the PDF/Docx text content here
    const simulatedTextContent = `
      Name: ${fullName}
      Education: ${education}
      Skills: ${skills}
      Target Role: ${profile ? profile.target_job_role : ''}
      Experience with projects. Built applications.
    `;

    const analysis = analyzeResume(fullName, skills, education, simulatedTextContent);

    // Save Resume Analysis
    await dbRun(
      `INSERT INTO ResumeAnalysis (resume_id, ats_score, resume_score, missing_skills, formatting_issues, suggested_improvements)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        resumeId,
        analysis.atsScore,
        analysis.resumeScore,
        JSON.stringify(analysis.missingSkills),
        JSON.stringify(analysis.formattingIssues),
        JSON.stringify(analysis.suggestedImprovements)
      ]
    );

    // Update readiness score (Resume weight is 30%)
    await updateReadinessScore(req.user.id, 'resume', analysis.resumeScore);

    res.status(201).json({
      resumeId,
      fileName: req.file.originalname,
      filePath: relativePath,
      ...analysis
    });
  } catch (error) {
    console.error('Resume upload/analyze error:', error);
    res.status(500).json({ message: error.message || 'Server error processing resume.' });
  }
});

// @route   GET /api/resume/history
// @desc    Get analysis history for current user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const history = await dbAll(
      `SELECT r.id as resume_id, r.file_name, r.file_path, r.uploaded_at,
              a.ats_score, a.resume_score, a.missing_skills, a.formatting_issues, a.suggested_improvements
       FROM Resumes r
       INNER JOIN ResumeAnalysis a ON r.id = a.resume_id
       WHERE r.user_id = ?
       ORDER BY r.uploaded_at DESC`,
      [req.user.id]
    );

    const parsedHistory = history.map(item => ({
      ...item,
      missing_skills: JSON.parse(item.missing_skills),
      formatting_issues: JSON.parse(item.formatting_issues),
      suggested_improvements: JSON.parse(item.suggested_improvements)
    }));

    res.json(parsedHistory);
  } catch (error) {
    console.error('Fetch resume history error:', error);
    res.status(500).json({ message: 'Server error retrieving resume analysis history.' });
  }
});

export default router;
