/*
  Warnings:

  - The values [CAMIÓN,AUTOMÓVIL] on the enum `TipoUnidad` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[placa]` on the table `Unidad` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoUnidad_new" AS ENUM ('AUTOBUS', 'CAMION', 'AUTOMOVIL');
ALTER TABLE "Unidad" ALTER COLUMN "tipoUnidad" TYPE "TipoUnidad_new" USING ("tipoUnidad"::text::"TipoUnidad_new");
ALTER TYPE "TipoUnidad" RENAME TO "TipoUnidad_old";
ALTER TYPE "TipoUnidad_new" RENAME TO "TipoUnidad";
DROP TYPE "public"."TipoUnidad_old";
COMMIT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Telemetria" (
    "id" TEXT NOT NULL,
    "unidadId" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "velocidad" DOUBLE PRECISION,
    "rumbo" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Telemetria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Telemetria_unidadId_timestamp_idx" ON "Telemetria"("unidadId", "timestamp");

-- CreateIndex
CREATE INDEX "Cobro_timestamp_idx" ON "Cobro"("timestamp");

-- CreateIndex
CREATE INDEX "Recarga_usuarioId_idx" ON "Recarga"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Unidad_placa_key" ON "Unidad"("placa");

-- CreateIndex
CREATE INDEX "Unidad_placa_idx" ON "Unidad"("placa");

-- AddForeignKey
ALTER TABLE "Telemetria" ADD CONSTRAINT "Telemetria_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
