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
// Get all projects (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany({
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
        res.json({ projects });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Get featured projects (public)
router.get('/featured', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany({
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
        res.json({ projects });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Get project by slug (public)
router.get('/:slug', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const project = yield prisma.project.findUnique({
            where: { slug },
            include: {
                images: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.json({ project });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Create project (admin only)
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, slug, description, content, technologies, websiteUrl, githubUrl, featured } = req.body;
        // Check if slug already exists
        const existingProject = yield prisma.project.findUnique({
            where: { slug }
        });
        if (existingProject) {
            res.status(400).json({ message: 'Slug already in use' });
            return;
        }
        const project = yield prisma.project.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Update project (admin only)
router.put('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, slug, description, content, technologies, websiteUrl, githubUrl, featured } = req.body;
        // Check if slug exists and it's not the current project
        if (slug) {
            const existingProject = yield prisma.project.findFirst({
                where: {
                    slug,
                    id: {
                        not: id
                    }
                }
            });
            if (existingProject) {
                res.status(400).json({ message: 'Slug already in use' });
                return;
            }
        }
        const project = yield prisma.project.update({
            where: { id },
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Delete project (admin only)
router.delete('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.project.delete({
            where: { id }
        });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Add image to project (admin only)
router.post('/:id/images', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { url, caption, order } = req.body;
        const image = yield prisma.projectImage.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Remove image from project (admin only)
router.delete('/images/:imageId', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageId } = req.params;
        yield prisma.projectImage.delete({
            where: { id: imageId }
        });
        res.json({ message: 'Image removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
exports.default = router;
