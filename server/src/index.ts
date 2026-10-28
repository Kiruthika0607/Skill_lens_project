import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import { initDB } from './db';
import authRoutes from './routes/auth';
import skillsRoutes from './routes/skills';
import jobsRoutes from './routes/jobs';
import demandRoutes from './routes/demand';
import careerRoutes from './routes/career';
import adminRoutes from './routes/admin';
import industryRoutes from './routes/industry';
import collegeRoutes from './routes/college';
import resumeRoutes from './routes/resume';
import assessmentRoutes from './routes/assessment';
import opportunitiesRoutes from './routes/opportunities';
import chatRoutes from './routes/chat';
import studentRoutes from './routes/student';
import roadmapRoutes from './routes/roadmap';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', service: 'SkillLens API', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

async function startServer() {
  await initDB();
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` SkillLens Backend API running on port ${PORT}`);
      console.log(` Database initialized with SQLite/Postgres compatibility`);
      console.log(`=======================================================`);
    });
  }
}

startServer().catch(err => {
  console.error('Failed to initialize database or start server:', err);
});

export default app;
