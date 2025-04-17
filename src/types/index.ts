import {Request} from 'express';

export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        name: string;
        bio?: string;
        avatar?: string;
    };
}
