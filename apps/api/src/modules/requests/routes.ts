import { Router } from 'express';
import { z } from 'zod';
import { CrearSolicitudInput, ActualizarSolicitudInput } from '@ebr/contracts';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../../middleware/auth.js';

export const requestsRouter = Router();

requestsRouter.use(requireAuth);

// GET /api/requests - lista solicitudes visibles para el usuario (mis solicitudes)
requestsRouter.get('/', async (req: AuthedRequest, res) => {
  // TODO: filtrar por membresías autorizadas del usuario (acordar con P1).
  const solicitudes = await prisma.solicitud.findMany({
    orderBy: { creadaEn: 'desc' },
  });
  res.json(solicitudes);
});

// POST /api/requests - crea un borrador (aún no crea Caso, ver D09)
requestsRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = CrearSolicitudInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'datos_invalidos', detalle: parsed.error.flatten() });
  }

  const origen = await prisma.origen.create({ data: { tipo: 'solicitud' } });
  const solicitud = await prisma.solicitud.create({
    data: {
      origenId: origen.id,
      empresaId: parsed.data.empresaId,
      establecimientoId: parsed.data.establecimientoId,
      motivo: parsed.data.motivo,
      detalle: parsed.data.detalle,
      creadaPor: req.userId!,
      estado: 'borrador',
    },
  });

  res.status(201).json(solicitud);
});

// PATCH /api/requests/:id - edita mientras está en borrador
requestsRouter.patch('/:id', async (req: AuthedRequest, res) => {
  const parsed = ActualizarSolicitudInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: 'datos_invalidos', detalle: parsed.error.flatten() });
  }

  const existente = await prisma.solicitud.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: 'no_encontrado' });
  if (existente.estado !== 'borrador') {
    return res.status(409).json({ error: 'estado_invalido', detalle: 'Solo se edita en borrador' });
  }

  const actualizada = await prisma.solicitud.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(actualizada);
});

// POST /api/requests/:id/submit - envío idempotente, crea el Caso en una transacción (D09)
requestsRouter.post('/:id/submit', async (req: AuthedRequest, res) => {
  const idSchema = z.string().uuid();
  const idCheck = idSchema.safeParse(req.params.id);
  if (!idCheck.success) return res.status(422).json({ error: 'id_invalido' });

  const resultado = await prisma.$transaction(async (tx) => {
    const solicitud = await tx.solicitud.findUnique({ where: { id: req.params.id } });
    if (!solicitud) return { status: 404 as const, body: { error: 'no_encontrado' } };

    // Idempotencia: si ya fue enviada, devolver el caso existente sin duplicar (D09, escenario de aceptación).
    if (solicitud.estado === 'enviada') {
      const caso = await tx.caso.findFirst({ where: { origenId: solicitud.origenId } });
      return { status: 200 as const, body: { solicitud, caso } };
    }

    // TODO: validar campos obligatorios completos antes de permitir el envío.

    const caso = await tx.caso.create({
      data: {
        origenId: solicitud.origenId,
        establecimientoId: solicitud.establecimientoId,
        estado: 'pendiente_asignacion',
      },
    });

    const solicitudActualizada = await tx.solicitud.update({
      where: { id: solicitud.id },
      data: { estado: 'enviada', enviadaEn: new Date() },
    });

    return { status: 201 as const, body: { solicitud: solicitudActualizada, caso } };
  });

  res.status(resultado.status).json(resultado.body);
});
