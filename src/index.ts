import dotenv from 'dotenv';
import {PrismaClient} from '@prisma/client';
import app from './app';

dotenv.config();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
