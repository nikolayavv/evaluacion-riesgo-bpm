import { Router } from 'express';
import { CrearAsignacionInput, CancelarAsignacionInput, DecisionOrigenInput } from '@ebr/contracts';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';

export const casesRouter = Router();
casesRouter.use(requireAuth);

// GET /api/cases
casesRouter.get('/', async (_req, res) => {
  const casos = await prisma.caso.findMany({
    orderBy: { creadoEn: 'desc' },
    include: { asignaciones: { where: { estado: 'vigente' } } },
  });
  res.json(casos);
});

// POST /api/cases/:id/decision - ¿procede evaluar? (alertas/denuncias, D03/D09)
casesRouter.post('/:id/decision', async (req: AuthedRequest, res) => {
  const parsed = DecisionOrigenInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'datos_invalidos', detalle: parsed.error.flatten() });
  }

  const caso = await prisma.caso.findUnique({ where: { id: req.params.id } });
  if (!caso) return res.status(404).json({ error: 'no_encontrado' });

  const nuevoEstado = parsed.data.procede ? 'pendiente_asignacion' : 'cancelado';

  const actualizado = await prisma.$transaction(async (tx) => {
    const c = await tx.caso.update({
      where: { id: caso.id },
      data: { estado: nuevoEstado, version: { increment: 1 } },
    });
    await tx.historialEstadoCaso.create({
      data: {
        casoId: caso.id,
        estadoDe: caso.estado,
        estadoA: nuevoEstado,
        motivo: parsed.data.motivo,
        autorId: req.userId!,
      },
    });
    return c;
  });

  res.json(actualizado);
});

// POST /api/cases/:id/assignments - asignar técnico y cita (valida versión y solapamiento)
casesRouter.post('/:id/assignments', async (req: AuthedRequest, res) => {
  const parsed = CrearAsignacionInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'datos_invalidos', detalle: parsed.error.flatten() });
  }

  const caso = await prisma.caso.findUnique({ where: { id: req.params.id } });
  if (!caso) return res.status(404).json({ error: 'no_encontrado' });

  // Detectar solapamiento de horario para el mismo evaluador (inicio/fin, ver "Acuerdos comunes").
  const solapada = await prisma.asignacion.findFirst({
    where: {
      evaluadorId: parsed.data.evaluadorId,
      estado: 'vigente',
      inicio: { lt: new Date(parsed.data.fin) },
      fin: { gt: new Date(parsed.data.inicio) },
    },
  });
  if (solapada) {
    return res.status(409).json({ error: 'conflicto_horario' });
  }

  const resultado = await prisma.$transaction(async (tx) => {
    // Reemplazar cualquier asignación vigente anterior (una sola vigente por caso, D06).
    await tx.asignacion.updateMany({
      where: { casoId: caso.id, estado: 'vigente' },
      data: { estado: 'reemplazada' },
    });

    const asignacion = await tx.asignacion.create({
      data: {
        casoId: caso.id,
        evaluadorId: parsed.data.evaluadorId,
        inicio: new Date(parsed.data.inicio),
        fin: new Date(parsed.data.fin),
        zonaHoraria: parsed.data.zonaHoraria,
        estado: 'vigente',
      },
    });

    await tx.caso.update({
      where: { id: caso.id },
      data: { estado: 'asignado', version: { increment: 1 } },
    });

    // TODO: P3 crea aquí la Evaluación inicial (ver "Acuerdos comunes": P2 solicita a P3).

    return asignacion;
  });

  res.status(201).json(resultado);
});

// POST /api/cases/:id/assignments/:assignmentId/cancel
casesRouter.post('/:id/assignments/:assignmentId/cancel', async (req: AuthedRequest, res) => {
  const parsed = CancelarAsignacionInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'datos_invalidos' });
  }

  const asignacion = await prisma.asignacion.update({
    where: { id: req.params.assignmentId },
    data: { estado: 'cancelada', motivoCambio: parsed.data.motivo },
  });
  res.json(asignacion);
});
