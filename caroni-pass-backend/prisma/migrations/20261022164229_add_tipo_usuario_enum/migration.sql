-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('PASAJERO', 'CONDUCTOR', 'ADMINISTRADOR', 'INSPECTOR');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "tipoUsuario" "TipoUsuario" NOT NULL DEFAULT 'PASAJERO';
