import {Router, Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';
import {authenticate} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Register user (admin)
router.post('/register', async (req: Request, res: Response) => {
    try {
        const {email, password, name} = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if (existingUser) {
            res.status(400).json({message: 'User already exists'});
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        // Generate token
        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET || 'default-secret',
            {expiresIn: '7d'}
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if (!user) {
            res.status(400).json({message: 'Invalid credentials'});
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({message: 'Invalid credentials'});
            return;
        }

        // Generate token
        const token = jwt.sign(
            {id: user.id},
            process.env.JWT_SECRET || 'default-secret',
            {expiresIn: '7d'}
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: req.user?.id}
        });

        if (!user) {
            res.status(404).json({message: 'User not found'});
            return;
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const {name, bio} = req.body;

        const updatedUser = await prisma.user.update({
            where: {id: req.user?.id},
            data: {name, bio}
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export default router;
