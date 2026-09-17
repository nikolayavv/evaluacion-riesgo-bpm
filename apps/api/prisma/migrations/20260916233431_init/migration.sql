-- CreateEnum
CREATE TYPE "RolInstitucional" AS ENUM ('ADMINISTRADOR', 'COORDINADOR', 'TECNICO_EVALUADOR');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('pendiente', 'activo', 'suspendido');

-- CreateEnum
CREATE TYPE "RolMembresia" AS ENUM ('ADMINISTRADOR_EMPRESA', 'USUARIO_DELEGADO');

-- CreateEnum
CREATE TYPE "TipoOrigen" AS ENUM ('solicitud', 'programacion', 'alerta', 'denuncia');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('borrador', 'enviada');

-- CreateEnum
CREATE TYPE "EstadoCaso" AS ENUM ('en_clasificacion', 'pendiente_asignacion', 'asignado', 'en_evaluacion', 'en_revision', 'cerrado', 'cancelado', 'remitido');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('vigente', 'reemplazada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoEvaluacion" AS ENUM ('asignada', 'en_curso', 'en_revision', 'devuelta', 'aprobada', 'cerrada');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashContrasena" TEXT NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'pendiente',
    "rolInstitucional" "RolInstitucional",
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "rnc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establecimientos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "actividad" TEXT,

    CONSTRAINT "establecimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "rol" "RolMembresia" NOT NULL,
    "autorizada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origenes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoOrigen" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "origenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" TEXT NOT NULL,
    "origenId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "establecimientoId" TEXT,
    "motivo" TEXT NOT NULL,
    "detalle" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'borrador',
    "creadaPor" TEXT NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadaEn" TIMESTAMP(3),

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos" (
    "id" TEXT NOT NULL,
    "origenId" TEXT NOT NULL,
    "establecimientoId" TEXT,
    "estado" "EstadoCaso" NOT NULL DEFAULT 'en_clasificacion',
    "version" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "casos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estado_caso" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "estadoDe" "EstadoCaso" NOT NULL,
    "estadoA" "EstadoCaso" NOT NULL,
    "motivo" TEXT,
    "autorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_caso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
    "estado" "EstadoAsignacion" NOT NULL DEFAULT 'vigente',
    "version" INTEGER NOT NULL DEFAULT 0,
    "motivoCambio" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "estado" "EstadoEvaluacion" NOT NULL DEFAULT 'asignada',
    "formularioVer" INTEGER,
    "reglasVer" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_auditoria" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rnc_key" ON "empresas"("rnc");

-- CreateIndex
CREATE UNIQUE INDEX "membresias_usuarioId_empresaId_key" ON "membresias"("usuarioId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_origenId_key" ON "solicitudes"("origenId");

-- AddForeignKey
ALTER TABLE "establecimientos" ADD CONSTRAINT "establecimientos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "origenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "origenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos" ADD CONSTRAINT "casos_establecimientoId_fkey" FOREIGN KEY ("establecimientoId") REFERENCES "establecimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_caso" ADD CONSTRAINT "historial_estado_caso_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
