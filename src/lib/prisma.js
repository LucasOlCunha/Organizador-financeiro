import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the app
const prisma = new PrismaClient();

export { prisma };
