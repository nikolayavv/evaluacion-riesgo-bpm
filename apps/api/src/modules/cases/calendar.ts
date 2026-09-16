import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';

export const calendarRouter = Router();
calendarRouter.use(requireAuth);

// GET /api/calendar - vistas día/semana/mes para FullCalendar
calendarRouter.get('/', async (_req, res) => {
  const asignaciones = await prisma.asignacion.findMany({
    where: { estado: 'vigente' },
    orderBy: { inicio: 'asc' },
  });
  res.json(
    asignaciones.map((a) => ({
      id: a.id,
      title: `Caso ${a.casoId}`,
      start: a.inicio,
      end: a.fin,
    })),
  );
});
