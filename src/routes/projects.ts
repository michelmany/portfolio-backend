import {Router, Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {authenticate} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all projects (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                images: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({projects});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Get featured projects (public)
router.get('/featured', async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                featured: true
            },
            include: {
                images: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({projects});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Get project by slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const {slug} = req.params;

        const project = await prisma.project.findUnique({
            where: {slug},
            include: {
                images: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!project) {
            res.status(404).json({message: 'Project not found'});
            return;
        }

        res.json({project});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Create project (admin only)
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const {title, slug, description, content, technologies, websiteUrl, githubUrl, featured} = req.body;

        // Check if slug already exists
        const existingProject = await prisma.project.findUnique({
            where: {slug}
        });

        if (existingProject) {
            res.status(400).json({message: 'Slug already in use'});
            return;
        }

        const project = await prisma.project.create({
            data: {
                title,
                slug,
                description,
                content,
                technologies,
                websiteUrl,
                githubUrl,
                featured: featured || false
            }
        });

        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Update project (admin only)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {title, slug, description, content, technologies, websiteUrl, githubUrl, featured} = req.body;

        // Check if slug exists and it's not the current project
        if (slug) {
            const existingProject = await prisma.project.findFirst({
                where: {
                    slug,
                    id: {
                        not: id
                    }
                }
            });

            if (existingProject) {
                res.status(400).json({message: 'Slug already in use'});
                return;
            }
        }

        const project = await prisma.project.update({
            where: {id},
            data: {
                title,
                slug,
                description,
                content,
                technologies,
                websiteUrl,
                githubUrl,
                featured
            }
        });

        res.json({
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Delete project (admin only)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        await prisma.project.delete({
            where: {id}
        });

        res.json({message: 'Project deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Add image to project (admin only)
router.post('/:id/images', authenticate, async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {url, caption, order} = req.body;

        const image = await prisma.projectImage.create({
            data: {
                url,
                caption,
                order: order || 0,
                projectId: id
            }
        });

        res.status(201).json({
            message: 'Image added successfully',
            image
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Remove image from project (admin only)
router.delete('/images/:imageId', authenticate, async (req: Request, res: Response) => {
    try {
        const {imageId} = req.params;

        await prisma.projectImage.delete({
            where: {id: imageId}
        });

        res.json({message: 'Image removed successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export default router;
