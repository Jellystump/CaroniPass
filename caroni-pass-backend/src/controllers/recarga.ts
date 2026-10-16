import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export class RecargaController {

    static async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const recargas = await prisma.recarga.findMany({
                include: {
                    usuario: { select: { id: true, nombre: true, email: true } },
                },
                orderBy: { timestamp: 'desc' },
            });
            return res.status(200).json(recargas);
        } catch (error) {
            console.error('Error al obtener todas las recargas:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar las recargas' });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'El ID de la recarga es requerido' });

        try {
            const recarga = await prisma.recarga.findUnique({
                where: { id }, 
                include: { usuario: { select: { id: true, nombre: true, email: true } } }
            });
            if (!recarga) return res.status(404).json({ message: 'Recarga no encontrada' });
            return res.status(200).json(recarga);
        } catch (error) {
            console.error('Error al obtener recarga por ID:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar la recarga' });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const userId = req.body.userId as string;
        const montoInput = req.body.monto;
        const metodo = req.body.metodo as string;

        if (!userId || !montoInput) {
            return res.status(400).json({ message: 'Los campos "userId" y "monto" son obligatorios' });
        }

        const monto = typeof montoInput === 'number' ? montoInput : Number(montoInput);
        if (isNaN(monto) || monto <= 0) {
            return res.status(400).json({ message: 'El monto de la recarga debe ser un número válido mayor a 0' });
        }

        try {
            const usuarioExistente = await prisma.usuario.findUnique({ where: { id: userId } });
            if (!usuarioExistente) return res.status(404).json({ message: 'El usuario especificado no existe' });

            const resultado = await prisma.$transaction(async (tx) => {
                const nuevaRecarga = await tx.recarga.create({
                    data: {
                        usuarioId: userId,
                        monto: monto,
                        metodo: metodo || 'Pago Móvil',
                    },
                });

                const usuarioActualizado = await tx.usuario.update({
                    where: { id: userId },
                    data: { saldo: { increment: monto } },
                    select: { id: true, nombre: true, email: true, saldo: true }
                });

                return { nuevaRecarga, usuarioActualizado };
            });

            return res.status(201).json({
                message: 'Recarga procesada y saldo actualizado exitosamente',
                recarga: resultado.nuevaRecarga,
                usuario: resultado.usuarioActualizado,
            });
        } catch (error) {
            console.error('Error al procesar la recarga:', error);
            return res.status(500).json({ message: 'Error interno del servidor al procesar la recarga' });
        }
    }

    static async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        const { monto, metodo } = req.body;
        try {
            const recargaActualizada = await prisma.recarga.update({
                where: { id },
                data: {
                    ...(monto !== undefined && { monto: Number(monto) }),
                    ...(metodo && { metodo }),
                },
            });
            return res.status(200).json({ success: true, data: recargaActualizada });
        } catch (error) {
            console.error('Error al actualizar recarga:', error);
            return res.status(500).json({ success: false, message: 'Error al actualizar la recarga' });
        }
    }

    static async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.recarga.delete({ where: { id } });
            return res.status(200).json({ success: true, message: 'Recarga eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar recarga:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar la recarga' });
        }
    }
}