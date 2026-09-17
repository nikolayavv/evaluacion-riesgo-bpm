import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { asignacion } = vi.hoisted(() => ({
  asignacion: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock('../src/lib/prisma.ts', () => ({ prisma: { asignacion } }));

import { casesRouter } from '../src/modules/cases/routes.ts';

const casoId = '11111111-1111-4111-8111-111111111111';
const otroCasoId = '22222222-2222-4222-8222-222222222222';
const assignmentId = '33333333-3333-4333-8333-333333333333';
const inexistenteId = '44444444-4444-4444-8444-444444444444';
const motivo = 'Reprogramación de prueba';
const app = express();
app.use(express.json());
app.use('/api/cases', casesRouter);

function cancelar(caso = casoId, asignacionId = assignmentId, body = { motivo }) {
  return request(app)
    .post(`/api/cases/${caso}/assignments/${asignacionId}/cancel`)
    .set('x-dev-user-id', '55555555-5555-4555-8555-555555555555')
    .send(body);
}

describe('POST cancelación de asignación (Prisma simulado)', () => {
  let fila;

  beforeEach(() => {
    vi.resetAllMocks();
    fila = { id: assignmentId, casoId, estado: 'vigente', motivoCambio: null };
    asignacion.findFirst.mockImplementation(async ({ where }) =>
      Object.entries(where).every(([campo, valor]) => fila[campo] === valor)
        ? { ...fila }
        : null,
    );
    asignacion.update.mockImplementation(async ({ data }) => {
      Object.assign(fila, data);
      return { ...fila };
    });
  });

  it('rechaza una asignación de otro caso sin modificarla', async () => {
    const respuesta = await cancelar(otroCasoId);
    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'no_encontrado' });
    expect(asignacion.update).not.toHaveBeenCalled();
    expect(fila.estado).toBe('vigente');
    expect(fila.motivoCambio).toBeNull();
  });

  it('cancela la asignación del caso correcto y conserva ambos filtros al escribir', async () => {
    const respuesta = await cancelar();
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toMatchObject({
      id: assignmentId, casoId, estado: 'cancelada', motivoCambio: motivo,
    });
    expect(asignacion.update).toHaveBeenCalledTimes(1);
    expect(asignacion.update).toHaveBeenCalledWith({
      where: { id: assignmentId, casoId },
      data: { estado: 'cancelada', motivoCambio: motivo },
    });
  });

  it('devuelve 404 para una asignación inexistente', async () => {
    const respuesta = await cancelar(casoId, inexistenteId);
    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'no_encontrado' });
    expect(asignacion.update).not.toHaveBeenCalled();
  });

  it.each([
    ['caso', 'invalido', assignmentId],
    ['asignación', casoId, 'invalido'],
  ])('rechaza un UUID inválido de %s antes de consultar', async (_nombre, caso, id) => {
    const respuesta = await cancelar(caso, id);
    expect(respuesta.status).toBe(422);
    expect(respuesta.body).toEqual({ error: 'id_invalido' });
    expect(asignacion.findFirst).not.toHaveBeenCalled();
    expect(asignacion.update).not.toHaveBeenCalled();
  });

  it('rechaza el motivo vacío antes de consultar', async () => {
    const respuesta = await cancelar(casoId, assignmentId, { motivo: '' });
    expect(respuesta.status).toBe(422);
    expect(respuesta.body).toEqual({ error: 'datos_invalidos' });
    expect(asignacion.findFirst).not.toHaveBeenCalled();
    expect(asignacion.update).not.toHaveBeenCalled();
  });
});
