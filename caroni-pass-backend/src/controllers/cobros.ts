import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { StatusCobro } from '@prisma/client';

export class CobroController {

    // 1. Obtener todos los cobros (con datos clave de usuario y unidad)
    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const cobros = await prisma.cobro.findMany({
                include: {
                    usuario: { select: { id: true, nombre: true, email: true } },
                    unidad: { select: { id: true, placa: true, tipoUnidad: true } },
                },
                orderBy: { timestamp: 'desc' },
            });
            return res.status(200).json(cobros);
        } catch (error) {
            console.error('Error al obtener todos los cobros:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar los cobros' });
        }
    }

    // 2. Obtener un cobro específico por su ID
    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'El ID del cobro es requerido' });

        try {
            const cobro = await prisma.cobro.findUnique({
                where: { id },
                include: {
                    usuario: { select: { id: true, nombre: true, email: true } },
                    unidad: { select: { id: true, placa: true, tipoUnidad: true } },
                },
            });
            if (!cobro) return res.status(404).json({ message: 'Cobro no encontrado' });
            return res.status(200).json(cobro);
        } catch (error) {
            console.error('Error al obtener cobro por ID:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar el cobro' });
        }
    }

    // 3. Crear un nuevo cobro (Valida saldo, descuenta y registra usando una transacción)
    static async create(req: Request, res: Response): Promise<Response> {
        const userId = req.body.userId as string;
        const unidadId = req.body.unidadId as string;
        const montoInput = req.body.monto;
        const status = req.body.status as StatusCobro;

        if (!userId || !unidadId || !montoInput) {
            return res.status(400).json({ message: 'Los campos "userId", "unidadId" y "monto" son obligatorios' });
        }

        const monto = typeof montoInput === 'number' ? montoInput : Number(montoInput);
        if (isNaN(monto) || monto <= 0) {
            return res.status(400).json({ message: 'El monto del cobro debe ser un número válido mayor a 0' });
        }

        try {
            // Verificar que el usuario exista
            const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
            if (!usuario) return res.status(404).json({ message: 'El usuario especificado no existe' });

            // Validar si el usuario posee saldo suficiente
            if (usuario.saldo < monto) {
                return res.status(400).json({ message: 'Saldo insuficiente para procesar el viaje/cobro' });
            }

            // Verificar que la unidad de transporte exista
            const unidad = await prisma.unidad.findUnique({ where: { id: unidadId } });
            if (!unidad) return res.status(404).json({ message: 'La unidad de transporte especificada no existe' });

            // Transacción segura: crea el registro de cobro y descuenta el saldo al usuario simultáneamente
            const resultado = await prisma.$transaction(async (tx) => {
                const nuevoCobro = await tx.cobro.create({
                    data: {
                        monto,
                        status: status || StatusCobro.APROBADO_ONLINE,
                        usuario: { connect: { id: userId } },
                        unidad: { connect: { id: unidadId } }
                    },
                });

                const usuarioActualizado = await tx.usuario.update({
                    where: { id: userId },
                    data: { saldo: { decrement: monto } },
                    select: { id: true, nombre: true, email: true, saldo: true },
                });

                return { nuevoCobro, usuarioActualizado };
            });

            return res.status(201).json({
                message: 'Cobro procesado y saldo actualizado exitosamente',
                cobro: resultado.nuevoCobro,
                usuario: resultado.usuarioActualizado,
            });
        } catch (error) {
            console.error('Error al procesar el cobro:', error);
            return res.status(500).json({ message: 'Error interno del servidor al procesar el cobro' });
        }
    }

    // 4. Actualizar un cobro existente
    static async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        const { monto, status } = req.body;
        try {
            const cobroActualizado = await prisma.cobro.update({
                where: { id },
                data: {
                    ...(monto !== undefined && { monto: Number(monto) }),
                    ...(status && { status }),
                },
            });
            return res.status(200).json({ success: true, data: cobroActualizado });
        } catch (error) {
            console.error('Error al actualizar cobro:', error);
            return res.status(500).json({ success: false, message: 'Error al actualizar el cobro' });
        }
    }

    // 5. Eliminar un registro de cobro
    static async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.cobro.delete({ where: { id } });
            return res.status(200).json({ success: true, message: 'Cobro eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar cobro:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar el cobro' });
        }
    }
}