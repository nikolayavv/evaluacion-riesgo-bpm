# EBR / BPM — Sistema de evaluación basada en riesgo

Monorepo de la Etapa 2 (Base común), sobre la propuesta de arquitectura de la Etapa 1
(ver `docs/decisiones.md` y `docs/contratos-api.md`).

## Estructura

```
apps/web         React + Vite + TS + Material UI (PWA)
apps/api         Express + TS + Prisma
packages/contracts   Tipos y validaciones (zod) compartidos
packages/risk        Motor de riesgo puro (stub, pendiente D04-D07)
docs                 Decisiones, contratos de API
.github/workflows    CI
```

## Arranque local

Requisitos: Node.js 24 LTS, Docker (para Postgres local; ver `docker-compose.yml`).

```bash
# 1. Base de datos local
docker compose up -d

# 2. Dependencias
npm install

# 3. Variables de entorno
cp apps/api/.env.example apps/api/.env

# 4. Esquema de base de datos
npm run prisma:migrate --workspace apps/api

# 5. Levantar API y frontend (dos terminales)
npm run dev:api
npm run dev:web
```

La API queda en `http://localhost:3005`, el frontend en `http://localhost:5173` (con proxy
de `/api` hacia la API, ver `apps/web/vite.config.ts`).

Autenticación real todavía no existe (la implementa P1). Mientras tanto, el cliente web
manda un header `x-dev-user-id` fijo y la API lo acepta vía un middleware stub
(`apps/api/src/middleware/auth.ts`) — **no usar en producción**.

## Estado

- ✅ Estructura de monorepo, workspaces, lint/format, CI.
- ✅ Modelo de datos inicial (Prisma) según D06/D07 del plan.
- ✅ Módulo de Solicitudes/Casos/Agenda (P2): crear, editar borrador, enviar (crea Caso),
  decisión sobre origen, asignación con detección de solapamiento.
- ⬜ Identidad real (P1), formulario/offline (P3), motor de riesgo real e informes (P4).

Ver `docs/decisiones.md` para lo que falta acordar con el equipo/docente antes de dar por
buena cualquier regla de negocio (fórmula de riesgo, criterios de aprobación, etc.).

## Flujo de trabajo

Rama corta por tarea → Pull Request → revisión de otra persona → integrar a `main`.
`main` siempre debe compilar y pasar CI. Ver `docs/contratos-api.md` antes de tocar un
endpoint que no sea tuyo.
