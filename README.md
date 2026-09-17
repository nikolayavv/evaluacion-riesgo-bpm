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

- ✅ Estructura de monorepo, workspaces y configuración de lint/format.
- ⬜ CI: todavía no hay workflows versionados.
- ✅ Modelo de datos inicial (Prisma) según D06/D07 del plan.
- ✅ Módulo de Solicitudes/Casos/Agenda (P2): crear, editar borrador, enviar (crea Caso),
  decisión sobre origen, asignación con detección de solapamiento.
- ⬜ Identidad real (P1), formulario/offline (P3), motor de riesgo real e informes (P4).

Ver `docs/decisiones.md` para lo que falta acordar con el equipo/docente antes de dar por
buena cualquier regla de negocio (fórmula de riesgo, criterios de aprobación, etc.).

## Flujo de trabajo

Rama corta por tarea → Pull Request → revisión de otra persona → integrar a `main`.
El objetivo es mantener `main` compilando y con las comprobaciones aprobadas. Aún no
hay workflows de CI versionados; por ahora registrar las comprobaciones locales en el PR.
Ver `docs/contratos-api.md` antes de tocar un endpoint que no sea tuyo.

### Ramas por tarea

Propuesta para el equipo: `main` como base compartida y una rama temporal por tarea.
Los prefijos describen el trabajo; no son ramas permanentes por integrante:

- `feat/<tarea>`: funcionalidad nueva, por ejemplo `feat/p2-calendario`.
- `fix/<tarea>`: corrección, por ejemplo `fix/p2-cancelacion-asignacion`.
- `chore/<tarea>`: configuración o mantenimiento, como `chore/branch-workflow`.
- `docs/<tarea>`: documentación.

Antes de empezar, revisar `git status` y terminar o guardar los cambios pendientes.
Desde la raíz del repositorio, crear cada rama nueva desde `main` actualizado:

```bash
git switch main
git pull --ff-only origin main
git switch -c fix/p2-cancelacion-asignacion
```

Trabajar en una sola tarea, revisar `git diff` y ejecutar las comprobaciones pertinentes
(por ejemplo, `npm run typecheck --workspace apps/api` para cambios de API; si cambia
el comportamiento, comprobar también ese comportamiento). Preparar archivos concretos
con `git add <archivo>`, revisar `git diff --cached` y crear el commit:

```bash
git commit -m "Corregir pertenencia de asignacion al cancelar"
git push -u origin fix/p2-cancelacion-asignacion
```

Abrir un Pull Request en GitHub con base `main` y la rama de la tarea como origen.
Describir qué cambia, cómo se comprobó y qué sigue pendiente; solicitar revisión a un
compañero. Tras aprobar e integrar el PR, volver a `main`, ejecutar
`git pull --ff-only origin main` y crear otra rama para la siguiente tarea.

La protección de `main` y la revisión obligatoria requieren configuración en GitHub;
esta guía no las activa ni confirma que estén configuradas.
