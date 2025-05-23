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
// Get all social links (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const socialLinks = yield prisma.socialLink.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ socialLinks });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Create social link (admin only)
router.post('/', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { platform, url, icon, order } = req.body;
        const socialLink = yield prisma.socialLink.create({
            data: {
                platform,
                url,
                icon,
                order: order || 0
            }
        });
        res.status(201).json({
            message: 'Social link created successfully',
            socialLink
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Update social link (admin only)
router.put('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { platform, url, icon, order } = req.body;
        const socialLink = yield prisma.socialLink.update({
            where: { id },
            data: {
                platform,
                url,
                icon,
                order
            }
        });
        res.json({
            message: 'Social link updated successfully',
            socialLink
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Delete social link (admin only)
router.delete('/:id', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.socialLink.delete({
            where: { id }
        });
        res.json({ message: 'Social link deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
exports.default = router;
