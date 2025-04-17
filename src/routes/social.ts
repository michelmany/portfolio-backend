import {Router, Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {authenticate} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all social links (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const socialLinks = await prisma.socialLink.findMany({
            orderBy: {order: 'asc'}
        });

        res.json({socialLinks});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Create social link (admin only)
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const {platform, url, icon, order} = req.body;

        const socialLink = await prisma.socialLink.create({
            data: {
                platform,
                url,
                icon,
                order: order || 0
            }
        });

        res.status(201).json({
            message: 'Social link created successfully',
            socialLink
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Update social link (admin only)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {platform, url, icon, order} = req.body;

        const socialLink = await prisma.socialLink.update({
            where: {id},
            data: {
                platform,
                url,
                icon,
                order
            }
        });

        res.json({
            message: 'Social link updated successfully',
            socialLink
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Delete social link (admin only)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        await prisma.socialLink.delete({
            where: {id}
        });

        res.json({message: 'Social link deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export default router;
