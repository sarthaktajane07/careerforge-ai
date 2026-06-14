import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'careerforge_secret_key';

// @route   POST /api/auth/register
// @desc    Register a new user (student or admin)
router.post('/register', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'Please provide email, password, and full name.' });
  }

  try {
    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine role (default to student, allow admin if specified)
    const userRole = role === 'admin' ? 'admin' : 'student';

    // Insert user
    const userResult = await dbRun(
      'INSERT INTO Users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, userRole]
    );
    const userId = userResult.id;

    // Create user profile
    await dbRun(
      `INSERT INTO Profiles (user_id, full_name, education, skills, interests, career_goals, target_job_role) 
       VALUES (?, ?, '', '', '', '', '')`,
      [userId, fullName]
    );

    // Initialize Readiness Score for student
    if (userRole === 'student') {
      await dbRun(
        `INSERT INTO ReadinessScores (user_id, resume_score, interview_score, skills_score, assessment_score, readiness_percentage, readiness_level)
         VALUES (?, 0.0, 0.0, 0.0, 0.0, 0.0, 'Beginner')`,
        [userId]
      );
    }

    // Generate JWT
    const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // Get user
    const user = await dbGet('SELECT * FROM Users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Get user profile details
    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [user.id]);
    const fullName = profile ? profile.full_name : 'User';

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile details
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, role, created_at FROM Users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [req.user.id]);
    const readiness = await dbGet('SELECT * FROM ReadinessScores WHERE user_id = ?', [req.user.id]);

    res.json({
      user,
      profile: profile || null,
      readiness: readiness || null
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', verifyToken, async (req, res) => {
  const { fullName, education, skills, interests, careerGoals, targetJobRole } = req.body;

  try {
    // Verify user profile exists
    const profile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [req.user.id]);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Update profile fields
    await dbRun(
      `UPDATE Profiles 
       SET full_name = ?, education = ?, skills = ?, interests = ?, career_goals = ?, target_job_role = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        fullName !== undefined ? fullName : profile.full_name,
        education !== undefined ? education : profile.education,
        skills !== undefined ? skills : profile.skills,
        interests !== undefined ? interests : profile.interests,
        careerGoals !== undefined ? careerGoals : profile.career_goals,
        targetJobRole !== undefined ? targetJobRole : profile.target_job_role,
        req.user.id
      ]
    );

    // If targetJobRole or skills changed, we might want to recalculate the skill gap score in the future
    // Retrieve and return updated profile
    const updatedProfile = await dbGet('SELECT * FROM Profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

export default router;
