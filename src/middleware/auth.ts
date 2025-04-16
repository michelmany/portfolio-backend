import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({message: 'Authentication required'});
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        const user = await prisma.user.findUnique({
            where: {id: decoded.id}
        });

        if (!user) {
            return res.status(401).json({message: 'User not found'});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Invalid token'});
    }
};
