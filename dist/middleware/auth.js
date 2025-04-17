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
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication required' });
            return; // Return early without value
        }
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret', (err, decoded) => __awaiter(this, void 0, void 0, function* () {
            if (err) {
                res.status(401).json({ message: 'Invalid token' });
                return; // Return early
            }
            try {
                const user = yield prisma.user.findUnique({
                    where: { id: decoded.id }
                });
                if (!user) {
                    res.status(401).json({ message: 'User not found' });
                    return; // Return early
                }
                req.user = user;
                next(); // Call next() to continue execution
            }
            catch (error) {
                res.status(500).json({ message: 'Server error' });
                return;
            }
        }));
    }
    catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
        return;
    }
}
