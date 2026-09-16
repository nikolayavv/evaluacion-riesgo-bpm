import { PrismaClient } from '@prisma/client';

// Singleton simple; suficiente para etapa 2. Si aparecen problemas de
// múltiples conexiones en dev con tsx watch, migrar al patrón globalThis.
export const prisma = new PrismaClient();
