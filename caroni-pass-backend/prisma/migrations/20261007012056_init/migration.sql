-- CreateEnum
CREATE TYPE "TipoUnidad" AS ENUM ('AUTOBUS', 'CAMIÓN', 'AUTOMÓVIL');

-- CreateEnum
CREATE TYPE "StatusUnidad" AS ENUM ('ACTIVO', 'EN_RUTA', 'MANTENIMIENTO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "StatusCobro" AS ENUM ('APROBADO_ONLINE', 'APROBADO_OFFLINE', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidad" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tipoUnidad" "TipoUnidad" NOT NULL,
    "capacidadPasajeros" INTEGER NOT NULL,
    "capacidadCargaKg" DOUBLE PRECISION NOT NULL,
    "kilometrajeActual" INTEGER NOT NULL,
    "estado" "StatusUnidad" NOT NULL,
    "fechaUltMantenimiento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobro" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "status" "StatusCobro" NOT NULL DEFAULT 'APROBADO_ONLINE',
    "usuarioId" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recarga" (
    "id" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recarga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Cobro_usuarioId_idx" ON "Cobro"("usuarioId");

-- CreateIndex
CREATE INDEX "Cobro_unidadId_idx" ON "Cobro"("unidadId");

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recarga" ADD CONSTRAINT "Recarga_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
