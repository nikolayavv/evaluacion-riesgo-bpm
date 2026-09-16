// Tipos compartidos de identidad/empresa (D06). Frontera de P1, consumidos por todos los módulos.
import { z } from 'zod';

export const RolAplicacion = z.enum([
  'ADMINISTRADOR',
  'ADMINISTRADOR_EMPRESA',
  'USUARIO_DELEGADO',
  'COORDINADOR',
  'TECNICO_EVALUADOR',
]);
export type RolAplicacion = z.infer<typeof RolAplicacion>;

export const Usuario = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  email: z.string().email(),
  estado: z.enum(['pendiente', 'activo', 'suspendido']),
  rolInstitucional: RolAplicacion.optional(),
});
export type Usuario = z.infer<typeof Usuario>;

export const Empresa = z.object({
  id: z.string().uuid(),
  rnc: z.string().min(1),
  razonSocial: z.string().min(1),
});
export type Empresa = z.infer<typeof Empresa>;

export const Establecimiento = z.object({
  id: z.string().uuid(),
  empresaId: z.string().uuid(),
  nombre: z.string().min(1),
  direccion: z.string().min(1),
  actividad: z.string().optional(),
});
export type Establecimiento = z.infer<typeof Establecimiento>;

export const Membresia = z.object({
  id: z.string().uuid(),
  usuarioId: z.string().uuid(),
  empresaId: z.string().uuid(),
  rol: z.enum(['ADMINISTRADOR_EMPRESA', 'USUARIO_DELEGADO']),
  autorizada: z.boolean(),
});
export type Membresia = z.infer<typeof Membresia>;

// Respuesta de GET /api/me
export const SesionActual = z.object({
  usuario: Usuario,
  membresias: z.array(Membresia),
  permisos: z.array(z.string()),
});
export type SesionActual = z.infer<typeof SesionActual>;
