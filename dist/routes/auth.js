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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Register user (admin)
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Check password
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Get current user
router.get('/me', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
// Update user profile
router.put('/profile', auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, bio } = req.body;
        const updatedUser = yield prisma.user.update({
            where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
            data: { name, bio }
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}));
exports.default = router;
