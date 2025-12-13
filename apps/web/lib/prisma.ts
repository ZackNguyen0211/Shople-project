import { PrismaClient } from '@prisma/client';

type GlobalPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as GlobalPrisma;

// Only log warnings and errors in dev; errors in prod.
// Avoid logging raw SQL queries to prevent sensitive data leakage in logs.
const logLevels: ('query' | 'info' | 'warn' | 'error')[] =
  process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
