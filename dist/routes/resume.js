"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get active resume (public)
router.get('/active', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resume = yield prisma.resume.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });
        if (!resume) {
            res.status(404).json({ message: 'Resume not found' });
            return;
        }
        res.json({ resume });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Get all resumes (admin only)
router.get('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resumes = yield prisma.resume.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ resumes });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Upload new resume (admin only)
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, fileUrl } = req.body;
        // Deactivate all other resumes if setting this one as active
        if (req.body.active) {
            yield prisma.resume.updateMany({
                data: { active: false }
            });
        }
        const resume = yield prisma.resume.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Set resume as active (admin only)
router.put('/:id/activate', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Deactivate all resumes
        yield prisma.resume.updateMany({
            data: { active: false }
        });
        // Activate selected resume
        const resume = yield prisma.resume.update({
            where: { id },
            data: { active: true }
        });
        res.json({
            message: 'Resume activated successfully',
            resume
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Delete resume (admin only)
router.delete('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.resume.delete({
            where: { id }
        });
        res.json({ message: 'Resume deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
exports.default = router;
