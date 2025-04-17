import {Router, Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {authenticate} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get active resume (public)
router.get('/active', async (req: Request, res: Response) => {
    try {
        const resume = await prisma.resume.findFirst({
            where: {active: true},
            orderBy: {createdAt: 'desc'}
        });

        if (!resume) {
            res.status(404).json({message: 'Resume not found'});
            return;
        }

        res.json({resume});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Get all resumes (admin only)
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const resumes = await prisma.resume.findMany({
            orderBy: {createdAt: 'desc'}
        });

        res.json({resumes});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Upload new resume (admin only)
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const {title, fileUrl} = req.body;

        // Deactivate all other resumes if setting this one as active
        if (req.body.active) {
            await prisma.resume.updateMany({
                data: {active: false}
            });
        }

        const resume = await prisma.resume.create({
            data: {
                title,
                fileUrl,
                active: req.body.active || false
            }
        });

        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Set resume as active (admin only)
router.put('/:id/activate', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        // Deactivate all resumes
        await prisma.resume.updateMany({
            data: {active: false}
        });

        // Activate selected resume
        const resume = await prisma.resume.update({
            where: {id},
            data: {active: true}
        });

        res.json({
            message: 'Resume activated successfully',
            resume
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Delete resume (admin only)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        await prisma.resume.delete({
            where: {id}
        });

        res.json({message: 'Resume deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export default router;
