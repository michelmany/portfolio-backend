import {Router, Request, Response} from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {authenticate} from '../middleware/auth';

const router = Router();

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true});
        }

        cb(null, uploadDir);
    },
    filename: (req: Request, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images and PDFs
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
});

// Upload file (admin only)
router.post('/', authenticate, upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({message: 'No file uploaded'});
            return;
        }

        // Return the file path
        const filePath = `/uploads/${req.file.filename}`;

        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: filePath,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export default router;
