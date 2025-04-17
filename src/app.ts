import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import resumeRoutes from './routes/resume';
import socialRoutes from './routes/social';
import uploadRoutes from './routes/upload';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
