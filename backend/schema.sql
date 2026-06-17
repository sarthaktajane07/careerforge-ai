-- CareerForge AI - Normalized MySQL Database Schema
-- Designed for Entrepreneurship and Innovation Competition

CREATE DATABASE IF NOT EXISTS careerforge_db;
USE careerforge_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS Profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    education TEXT NULL,
    skills TEXT NULL, -- Comma-separated or JSON list of skills
    interests TEXT NULL,
    career_goals TEXT NULL,
    target_job_role VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CareerAssessments Table
CREATE TABLE IF NOT EXISTS CareerAssessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    answers JSON NOT NULL, -- Detailed answer history
    recommended_paths TEXT NOT NULL, -- JSON formatted array
    strengths TEXT NOT NULL, -- JSON formatted array
    weaknesses TEXT NOT NULL, -- JSON formatted array
    improvement_areas TEXT NOT NULL, -- JSON formatted array
    career_suggestions TEXT NOT NULL, -- JSON formatted array
    score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_assessment_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Resumes Table
CREATE TABLE IF NOT EXISTS Resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_resume_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ResumeAnalysis Table
CREATE TABLE IF NOT EXISTS ResumeAnalysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL UNIQUE,
    ats_score INT NOT NULL,
    resume_score INT NOT NULL,
    missing_skills TEXT NOT NULL, -- JSON array of missing skills
    formatting_issues TEXT NOT NULL, -- JSON array of issues
    suggested_improvements TEXT NOT NULL, -- JSON array of improvements
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES Resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Interviews Table
CREATE TABLE IF NOT EXISTS Interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    overall_score INT NOT NULL,
    feedback TEXT NOT NULL,
    improvement_suggestions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_interview_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. InterviewQuestions Table
CREATE TABLE IF NOT EXISTS InterviewQuestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('hr', 'technical') NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES Interviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. InterviewResponses Table
CREATE TABLE IF NOT EXISTS InterviewResponses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT NOT NULL,
    score INT NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES Interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES InterviewQuestions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Skills Table (Standardized Skills Reference Library)
CREATE TABLE IF NOT EXISTS Skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SkillGapReports Table
CREATE TABLE IF NOT EXISTS SkillGapReports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    current_skills TEXT NOT NULL, -- JSON array
    missing_skills TEXT NOT NULL, -- JSON array
    recommended_tech TEXT NOT NULL, -- JSON array
    learning_roadmap TEXT NOT NULL, -- JSON containing milestones, tools, and timelines
    certifications TEXT NOT NULL, -- JSON array of recommended certifications
    skills_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_skillgap_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CareerTwinPredictions Table
CREATE TABLE IF NOT EXISTS CareerTwinPredictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    education TEXT NOT NULL,
    current_skills TEXT NOT NULL,
    career_goal TEXT NOT NULL,
    scenario_a JSON NOT NULL, -- Current Path simulation details
    scenario_b JSON NOT NULL, -- Recommended Path simulation details
    scenario_c JSON NOT NULL, -- Best Possible Growth simulation details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_careertwin_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ReadinessScores Table
CREATE TABLE IF NOT EXISTS ReadinessScores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    resume_score FLOAT NOT NULL DEFAULT 0.0,
    interview_score FLOAT NOT NULL DEFAULT 0.0,
    skills_score FLOAT NOT NULL DEFAULT 0.0,
    assessment_score FLOAT NOT NULL DEFAULT 0.0,
    readiness_percentage FLOAT NOT NULL DEFAULT 0.0,
    readiness_level VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AdminAnalytics Table
CREATE TABLE IF NOT EXISTS AdminAnalytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_users INT NOT NULL DEFAULT 0,
    total_assessments INT NOT NULL DEFAULT 0,
    total_interviews INT NOT NULL DEFAULT 0,
    total_resumes INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- AI SKILL ASSESSMENT HUB TABLES
-- ==============================================================================

-- 14. SkillCategories Table
CREATE TABLE IF NOT EXISTS SkillCategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. HubSkills Table (Replaces/extends basic Skills table for the Hub)
CREATE TABLE IF NOT EXISTS HubSkills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    FOREIGN KEY (category_id) REFERENCES SkillCategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. HubQuestions Table
CREATE TABLE IF NOT EXISTS HubQuestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    FOREIGN KEY (skill_id) REFERENCES HubSkills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. HubOptions Table
CREATE TABLE IF NOT EXISTS HubOptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES HubQuestions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. SkillTestAttempts Table
CREATE TABLE IF NOT EXISTS SkillTestAttempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    total_questions INT NOT NULL DEFAULT 20,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    percentage_score FLOAT NOT NULL DEFAULT 0.0,
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES HubSkills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. SkillTestResults Table (Stores individual question answers per attempt)
CREATE TABLE IF NOT EXISTS SkillTestResults (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (attempt_id) REFERENCES SkillTestAttempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES HubQuestions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES HubOptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. SkillReports Table
CREATE TABLE IF NOT EXISTS SkillReports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL UNIQUE,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    topics_to_improve TEXT NOT NULL,
    recommended_courses TEXT NOT NULL,
    recommended_certifications TEXT NOT NULL,
    learning_plan TEXT NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES SkillTestAttempts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. UserBadges Table
CREATE TABLE IF NOT EXISTS UserBadges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES HubSkills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Leaderboard Table (Could also be a view, but we'll use a table for caching top scores)
CREATE TABLE IF NOT EXISTS Leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    highest_score FLOAT NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES HubSkills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
