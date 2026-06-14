import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions to use async/await
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Database schema initialization
export const initDb = async () => {
  try {
    // Enable Foreign Keys in SQLite
    await dbRun('PRAGMA foreign_keys = ON');

    // 1. Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('student', 'admin')) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `.replace('AUTO_INCREMENT', 'AUTOINCREMENT')); // SQLite uses AUTOINCREMENT instead of AUTO_INCREMENT

    // 2. Profiles Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        education TEXT,
        skills TEXT,
        interests TEXT,
        career_goals TEXT,
        target_job_role TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 3. CareerAssessments Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS CareerAssessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        answers TEXT NOT NULL,
        recommended_paths TEXT NOT NULL,
        strengths TEXT NOT NULL,
        weaknesses TEXT NOT NULL,
        improvement_areas TEXT NOT NULL,
        career_suggestions TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 4. Resumes Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 5. ResumeAnalysis Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ResumeAnalysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER NOT NULL UNIQUE,
        ats_score INTEGER NOT NULL,
        resume_score INTEGER NOT NULL,
        missing_skills TEXT NOT NULL,
        formatting_issues TEXT NOT NULL,
        suggested_improvements TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resume_id) REFERENCES Resumes(id) ON DELETE CASCADE
      )
    `);

    // 6. Interviews Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        job_role TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        improvement_suggestions TEXT NOT NULL,
        mode TEXT DEFAULT 'text',
        video_metrics TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 7. InterviewQuestions Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS InterviewQuestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        interview_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT CHECK(question_type IN ('hr', 'technical')) NOT NULL,
        FOREIGN KEY (interview_id) REFERENCES Interviews(id) ON DELETE CASCADE
      )
    `);

    // 8. InterviewResponses Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS InterviewResponses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        interview_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        user_answer TEXT NOT NULL,
        score INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (interview_id) REFERENCES Interviews(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES InterviewQuestions(id) ON DELETE CASCADE
      )
    `);

    // 9. Skills Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL UNIQUE
      )
    `);

    // 10. SkillGapReports Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS SkillGapReports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_role TEXT NOT NULL,
        current_skills TEXT NOT NULL,
        missing_skills TEXT NOT NULL,
        recommended_tech TEXT NOT NULL,
        learning_roadmap TEXT NOT NULL,
        certifications TEXT NOT NULL,
        skills_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 11. CareerTwinPredictions Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS CareerTwinPredictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        education TEXT NOT NULL,
        current_skills TEXT NOT NULL,
        career_goal TEXT NOT NULL,
        scenario_a TEXT NOT NULL,
        scenario_b TEXT NOT NULL,
        scenario_c TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 12. ReadinessScores Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ReadinessScores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        resume_score REAL DEFAULT 0.0,
        interview_score REAL DEFAULT 0.0,
        skills_score REAL DEFAULT 0.0,
        assessment_score REAL DEFAULT 0.0,
        readiness_percentage REAL DEFAULT 0.0,
        readiness_level TEXT DEFAULT 'Beginner',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    // 13. AdminAnalytics Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS AdminAnalytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_users INTEGER DEFAULT 0,
        total_assessments INTEGER DEFAULT 0,
        total_interviews INTEGER DEFAULT 0,
        total_resumes INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Run DB Migrations for existing databases
    try {
      await dbRun("ALTER TABLE Interviews ADD COLUMN mode TEXT DEFAULT 'text'");
    } catch (e) {
      // Column already exists
    }
    try {
      await dbRun("ALTER TABLE Interviews ADD COLUMN video_metrics TEXT");
    } catch (e) {
      // Column already exists
    }

    // Seed Data
    await seedData();

    console.log('Database schema successfully initialized.');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const seedData = async () => {
  // Check if Users table is empty
  const userCount = await dbGet('SELECT COUNT(*) as count FROM Users');
  if (userCount.count > 0) return;

  console.log('Seeding initial database content...');

  // Create hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('adminpassword', salt);
  const studentHash = await bcrypt.hash('studentpassword', salt);

  // 1. Seed Users
  const adminResult = await dbRun('INSERT INTO Users (email, password, role) VALUES (?, ?, ?)', [
    'admin@careerforge.ai',
    adminHash,
    'admin'
  ]);
  const studentResult = await dbRun('INSERT INTO Users (email, password, role) VALUES (?, ?, ?)', [
    'student@careerforge.ai',
    studentHash,
    'student'
  ]);

  // 2. Seed Student Profile
  await dbRun(`
    INSERT INTO Profiles (user_id, full_name, education, skills, interests, career_goals, target_job_role) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    studentResult.id,
    'Alex Mercer',
    'B.S. in Computer Science (Senior Year)',
    'JavaScript, HTML, CSS, React, Python',
    'Web Development, Artificial Intelligence, Product Design',
    'To become a Senior Full Stack Engineer at a leading tech startup',
    'Software Engineer'
  ]);

  // 3. Seed Skills Library
  const skillList = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Express', 'SQL', 'MongoDB', 
    'Git', 'HTML', 'CSS', 'TypeScript', 'Docker', 'AWS', 'Data Structures', 
    'System Design', 'Communication', 'Project Management', 'Problem Solving'
  ];
  for (const skill of skillList) {
    await dbRun('INSERT OR IGNORE INTO Skills (skill_name) VALUES (?)', [skill]);
  }

  // 4. Seed Career Readiness Score for student
  await dbRun(`
    INSERT INTO ReadinessScores (user_id, resume_score, interview_score, skills_score, assessment_score, readiness_percentage, readiness_level)
    VALUES (?, 75.0, 68.0, 60.0, 80.0, 70.9, 'Developing')
  `, [studentResult.id]);

  // 5. Seed Career Twin Simulation for Student
  await dbRun(`
    INSERT INTO CareerTwinPredictions (user_id, education, current_skills, career_goal, scenario_a, scenario_b, scenario_c)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    studentResult.id,
    'B.S. in Computer Science',
    'JavaScript, React, Python',
    'Software Engineer',
    JSON.stringify({
      role: 'Junior Frontend Developer',
      timeline: '1 - 2 Years',
      salary: '$65,000 - $80,000',
      description: 'Focusing solely on current skills leads to standard client-side roles with steady, moderate growth.'
    }),
    JSON.stringify({
      skillsToLearn: ['Node.js', 'Express', 'PostgreSQL'],
      certifications: ['AWS Certified Developer', 'React Advanced Certificate'],
      role: 'Full Stack Software Engineer',
      timeline: '2 - 3 Years',
      salary: '$90,000 - $115,000',
      description: 'Learning backend databases and cloud deployment unlocks higher-paying full-stack and cloud positions.'
    }),
    JSON.stringify({
      advancedSkills: ['System Design', 'Kubernetes', 'Go/Rust', 'AI/ML Engineering'],
      role: 'Lead AI Engineer / Solutions Architect',
      timeline: '4 - 5 Years',
      salary: '$140,000 - $185,000',
      description: 'Combining core engineering with scalable system design and artificial intelligence unlocks executive and principal titles.'
    })
  ]);

  // 6. Seed Career Assessment
  await dbRun(`
    INSERT INTO CareerAssessments (user_id, answers, recommended_paths, strengths, weaknesses, improvement_areas, career_suggestions, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    studentResult.id,
    JSON.stringify({ q1: 'Highly technical', q2: 'Prefer teamwork', q3: 'Love building interfaces' }),
    JSON.stringify(['Frontend Engineer', 'Full Stack Developer', 'Product Engineer']),
    JSON.stringify(['Visual design', 'React workflow', 'Problem solving']),
    JSON.stringify(['SQL databases', 'Cloud architectures']),
    JSON.stringify(['Backend database design', 'Deployment workflows']),
    JSON.stringify(['Learn Node.js/PostgreSQL', 'Build end-to-end projects']),
    80
  ]);

  // 7. Seed Resume
  const resumeResult = await dbRun(`
    INSERT INTO Resumes (user_id, file_name, file_path)
    VALUES (?, 'alex_mercer_resume.pdf', '/uploads/alex_mercer_resume.pdf')
  `, [studentResult.id]);

  // 8. Seed Resume Analysis
  await dbRun(`
    INSERT INTO ResumeAnalysis (resume_id, ats_score, resume_score, missing_skills, formatting_issues, suggested_improvements)
    VALUES (?, 78, 75, ?, ?, ?)
  `, [
    resumeResult.id,
    JSON.stringify(['TypeScript', 'Node.js', 'Docker', 'Testing (Jest)']),
    JSON.stringify(['Missing contact phone number', 'Skill section too wordy']),
    JSON.stringify(['Add modern stack words like Node and Docker', 'Shorten profile statement to 3 lines', 'Quantify bullet points with percentages'])
  ]);

  // 9. Seed Interview
  const interviewResult = await dbRun(`
    INSERT INTO Interviews (user_id, job_role, overall_score, feedback, improvement_suggestions)
    VALUES (?, 'Software Engineer', 68, 'Good technical knowledge but struggled on explaining algorithm complexities and HR scenarios.', 'Focus on Big-O notation, practice mock STAR questions for behavioral.')
  `, [studentResult.id]);

  // 10. Seed Interview Questions & Responses
  const q1 = await dbRun(`
    INSERT INTO InterviewQuestions (interview_id, question_text, question_type)
    VALUES (?, 'Tell me about yourself.', 'hr')
  `, [interviewResult.id]);

  await dbRun(`
    INSERT INTO InterviewResponses (interview_id, question_id, user_answer, score, feedback)
    VALUES (?, ?, 'I am a CS student in my senior year. I like JavaScript and React and want to build cool software.', 75, 'Solid summary but could highlight past project impact and why you are interested in this specific role.')
  `, [interviewResult.id, q1.id]);

  const q2 = await dbRun(`
    INSERT INTO InterviewQuestions (interview_id, question_text, question_type)
    VALUES (?, 'Explain the difference between synchronous and asynchronous execution in JavaScript.', 'technical')
  `, [interviewResult.id]);

  await dbRun(`
    INSERT INTO InterviewResponses (interview_id, question_id, user_answer, score, feedback)
    VALUES (?, ?, 'Sync stops everything until it finishes, async lets code continue running while task executes in background.', 85, 'Good explanation! Mentioning the event loop and call stack would make this a 10/10.')
  `, [interviewResult.id, q2.id]);

  // 11. Seed Skill Gap Report
  await dbRun(`
    INSERT INTO SkillGapReports (user_id, target_role, current_skills, missing_skills, recommended_tech, learning_roadmap, certifications, skills_score)
    VALUES (?, 'Software Engineer', ?, ?, ?, ?, ?, 60)
  `, [
    studentResult.id,
    'JavaScript, React, Python',
    JSON.stringify(['Node.js', 'SQL', 'Docker', 'TypeScript']),
    JSON.stringify(['Node.js/Express', 'PostgreSQL', 'Docker basics']),
    JSON.stringify([
      { step: 'Backend Basics', topic: 'Node.js & Express API building', timeline: 'Week 1-3' },
      { step: 'Database Design', topic: 'SQL querying & PostgreSQL storage', timeline: 'Week 4-6' },
      { step: 'DevOps & Tooling', topic: 'Docker containers and CI/CD pipelines', timeline: 'Week 7-9' }
    ]),
    JSON.stringify(['AWS Certified Cloud Practitioner', 'MongoDB Associate Developer']),
  ]);

  // 12. Seed Admin Analytics
  await dbRun(`
    INSERT INTO AdminAnalytics (total_users, total_assessments, total_interviews, total_resumes)
    VALUES (150, 89, 45, 62)
  `);

  console.log('Seeding complete.');
};
export default db;
export { db };
