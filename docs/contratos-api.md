# Contratos de API (detalle)

Resumen vivo de los endpoints. La fuente de verdad de tipos es `packages/contracts/src`;
este archivo es la referencia legible para el equipo. Actualizar en el mismo PR que cambia
un endpoint.

## Convenciones

- IDs: UUID. Nunca la posición de una fila.
- Fechas: ISO 8601 en UTC; se muestran en `America/Santo_Domingo` en el frontend.
- Errores: `401` sesión, `403` permiso, `409` estado/versión, `422` datos inválidos.
- Recursos con posible conflicto (`Caso`, `Asignacion`) llevan `version` (resourceVersion).

## Implementado en esta base (P2)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/api/requests` | Lista solicitudes visibles para el usuario |
| POST | `/api/requests` | Crea solicitud en borrador |
| PATCH | `/api/requests/:id` | Edita mientras está en borrador |
| POST | `/api/requests/:id/submit` | Envío idempotente; crea el Caso en transacción |
| GET | `/api/cases` | Lista casos con asignación vigente |
| POST | `/api/cases/:id/decision` | Decide si procede evaluar (alertas/denuncias) |
| POST | `/api/cases/:id/assignments` | Asigna evaluador y cita; valida solapamiento |
| POST | `/api/cases/:id/assignments/:assignmentId/cancel` | Cancela una asignación vigente |
| GET | `/api/calendar` | Citas vigentes para FullCalendar |

## Pendiente (otros módulos, ver plan de arquitectura pp. 12)

- `GET /api/me`, login, recuperación de contraseña (P1).
- `GET /api/evaluations/:id/offline-package`, `POST /api/sync` (P3).
- `POST /api/evaluations/:id/submit`, `POST /api/evaluations/:id/reviews` (P3+P4).
- `POST /api/reports/:id/issue`, `POST /api/cases/:id/close` (P4 + P2).
