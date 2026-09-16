// Contratos del módulo Casos/Agenda (P2). Ver D06 y "Contratos de integración y API".
import { z } from 'zod';

// --- Solicitud (D09: borrador -> enviada -> crea Caso) ---
export const EstadoSolicitud = z.enum(['borrador', 'enviada']);
export type EstadoSolicitud = z.infer<typeof EstadoSolicitud>;

export const SolicitudBase = z.object({
  empresaId: z.string().uuid(),
  establecimientoId: z.string().uuid().optional(), // puede resolverse después, ver D06
  motivo: z.string().min(1),
  detalle: z.string().optional(),
});
export type SolicitudBase = z.infer<typeof SolicitudBase>;

export const Solicitud = SolicitudBase.extend({
  id: z.string().uuid(),
  estado: EstadoSolicitud,
  creadaPor: z.string().uuid(),
  creadaEn: z.string().datetime(),
  casoId: z.string().uuid().nullable(), // null hasta que el envío válido crea el caso
});
export type Solicitud = z.infer<typeof Solicitud>;

// POST /api/requests
export const CrearSolicitudInput = SolicitudBase;
// PATCH /api/requests/:id (solo mientras está en borrador)
export const ActualizarSolicitudInput = SolicitudBase.partial();

// --- Origen (D06: solicitud | programación | alerta | denuncia) ---
export const TipoOrigen = z.enum(['solicitud', 'programacion', 'alerta', 'denuncia']);
export type TipoOrigen = z.infer<typeof TipoOrigen>;

export const Origen = z.object({
  id: z.string().uuid(),
  tipo: TipoOrigen,
  detalleId: z.string().uuid(), // referencia al detalle específico según tipo
  creadoEn: z.string().datetime(),
});
export type Origen = z.infer<typeof Origen>;

// Decisión sobre alerta/denuncia: ¿procede evaluar? (D03/D09)
export const DecisionOrigenInput = z.object({
  procede: z.boolean(),
  motivo: z.string().min(1),
  // Si no procede y es denuncia, puede remitirse a otro proceso.
  remitidoA: z.string().optional(),
});
export type DecisionOrigenInput = z.infer<typeof DecisionOrigenInput>;

// --- Caso ---
export const EstadoCaso = z.enum([
  'en_clasificacion',
  'pendiente_asignacion',
  'asignado',
  'en_evaluacion',
  'en_revision',
  'cerrado',
  'cancelado',
  'remitido',
]);
export type EstadoCaso = z.infer<typeof EstadoCaso>;

export const Caso = z.object({
  id: z.string().uuid(),
  origenId: z.string().uuid(),
  establecimientoId: z.string().uuid().nullable(), // puede resolverse durante clasificación (D06)
  estado: EstadoCaso,
  version: z.number().int().nonnegative(), // resourceVersion para control de conflictos (409)
  creadoEn: z.string().datetime(),
});
export type Caso = z.infer<typeof Caso>;

// --- Asignación / cita (D06: una asignación responsable vigente por caso) ---
export const EstadoAsignacion = z.enum(['vigente', 'reemplazada', 'cancelada']);
export type EstadoAsignacion = z.infer<typeof EstadoAsignacion>;

export const CrearAsignacionInput = z.object({
  evaluadorId: z.string().uuid(),
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
  zonaHoraria: z.string().default('America/Santo_Domingo'),
});
export type CrearAsignacionInput = z.infer<typeof CrearAsignacionInput>;

export const CancelarAsignacionInput = z.object({
  motivo: z.string().min(1),
});
export type CancelarAsignacionInput = z.infer<typeof CancelarAsignacionInput>;

export const Asignacion = z.object({
  id: z.string().uuid(),
  casoId: z.string().uuid(),
  evaluadorId: z.string().uuid(),
  inicio: z.string().datetime(),
  fin: z.string().datetime(),
  zonaHoraria: z.string(),
  estado: EstadoAsignacion,
  version: z.number().int().nonnegative(),
  motivoCambio: z.string().optional(),
});
export type Asignacion = z.infer<typeof Asignacion>;

// Errores de estado/versión se comunican como 409 (ver "Acuerdos comunes" del plan).
export const ConflictoVersion = z.object({
  error: z.literal('conflicto_version'),
  versionActual: z.number().int(),
});
export type ConflictoVersion = z.infer<typeof ConflictoVersion>;
