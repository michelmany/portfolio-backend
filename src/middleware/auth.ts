import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({message: 'Authentication required'});
            return; // Return early without value
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET || 'default-secret', async (err: any, decoded: any) => {
            if (err) {
                res.status(401).json({message: 'Invalid token'});
                return; // Return early
            }

            try {
                const user = await prisma.user.findUnique({
                    where: {id: decoded.id}
                });

                if (!user) {
                    res.status(401).json({message: 'User not found'});
                    return; // Return early
                }

                req.user = user;
                next(); // Call next() to continue execution
            } catch (error) {
                res.status(500).json({message: 'Server error'});
                return;
            }
        });
    } catch (error) {
        res.status(401).json({message: 'Authentication failed'});
        return;
    }
}
