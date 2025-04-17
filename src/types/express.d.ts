declare namespace Express {
    export interface Request {
        user?: {
            id: string;
            email: string;
            name: string;
            bio?: string | null;
            avatar?: string | null;
            [key: string]: any;
        };
    }
}
