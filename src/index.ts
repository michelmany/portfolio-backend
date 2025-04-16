import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {PrismaClient} from '@prisma/client';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import resumeRoutes from './routes/resume';
import socialRoutes from './routes/social';
import uploadRoutes from './routes/upload';
import path from 'path';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
