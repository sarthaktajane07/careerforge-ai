import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';

// Route imports
import authRouter from './routes/auth.js';
import assessmentRouter from './routes/assessment.js';
import resumeRouter from './routes/resume.js';
import interviewRouter from './routes/interview.js';
import skillgapRouter from './routes/skillgap.js';
import careertwinRouter from './routes/careertwin.js';
import dashboardRouter from './routes/dashboard.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
app.use(cors({
  origin: '*', // Allow all origins for the competition dashboard demo simplicity
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes Registration
app.use('/api/auth', authRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/skillgap', skillgapRouter);
app.use('/api/careertwin', careertwinRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerForge AI server is running healthy.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err);
  res.status(500).json({
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// Initialize DB and start server
const startServer = async () => {
  console.log('Initializing database schema...');
  await initDb();
  
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 CareerForge AI Backend listening on Port: ${PORT}`);
    console.log(`👉 API Health Check: http://localhost:${PORT}/health`);
    console.log(`===================================================`);
  });
};

startServer();
