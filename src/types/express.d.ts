declare namespace Express {
    export interface Request {
        user?: {
            id: string;
            email: string;
            name: string;
            bio?: string;
            avatar?: string;
            [key: string]: any;
        };
    }
}
