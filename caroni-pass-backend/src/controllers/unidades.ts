import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TipoUnidad, StatusUnidad } from '@prisma/client';

export class UnidadController {

    static async getAll(req: Request, res: Response) {
        try {
            const unidades = await prisma.unidad.findMany({
                include: { cobros: true },
                orderBy: { id: 'desc' },
            });
            return res.status(200).json(unidades);
        } catch (error) {
            console.error('Error al obtener todas las unidades:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar las unidades' });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'El ID de unidad es requerido' });

        try {
            const unidad = await prisma.unidad.findUnique({
                where: { id },
                include: { cobros: true, recargas: true }
            });
            return res.status(200).json(unidad);
        } catch (error) {
            console.error('Error al obtener unidad por ID:', error);
            return res.status(500).json({ message: 'Error interno del servidor al consultar la unidad' });
        }
    }

    static async loginPlaca(req: Request, res: Response): Promise<Response> {
        const { placa } = req.body;

        if (!placa) {
            return res.status(400).json({ message: 'La placa es obligatoria' });
        }

        try {
            const unidad = await prisma.unidad.findUnique({
            where: { placa: placa.toUpperCase().trim() },
            });

            if (!unidad) {
            return res.status(404).json({ message: 'Unidad no encontrada con esa placa' });
            }

            return res.status(200).json({
            success: true,
            unidadId: unidad.id,
            placa: unidad.placa,
            });
        } catch (error) {
            console.error('Error al autenticar unidad:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const token = req.cookies.access_token || req.get('x-access-token');
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const {
            placa, marca, modelo, tipoUnidad, capacidadPasajeros,
            capacidadCargaKg, estado,
        } = req.body;
            
        if (!placa || !tipoUnidad || !capacidadPasajeros) {
            return res.status(400).json({ message: 'Los campos "placa", "tipo de unidad" y "capacidad de pasajeros" son obligatorios' });
        } 

        try {
            const existingUnidad = await prisma.unidad.findUnique({ where: { placa } });
            if (existingUnidad) {
                return res.status(409).json({ message: 'Ya existe una unidad registrada con esta placa' });
            }

            const newUnidad = await prisma.unidad.create({
                data: {
                    placa,
                    marca,
                    modelo,
                    tipoUnidad: tipoUnidad as TipoUnidad,
                    capacidadPasajeros: Number(capacidadPasajeros),
                    capacidadCargaKg: capacidadCargaKg ? Number(capacidadCargaKg) : 0,
                    kilometrajeActual: req.body.kilometrajeActual ?? 0,
                    estado: estado as StatusUnidad,
                    fechaUltMantenimiento: req.body.fechaUltMantenimiento ? new Date(req.body.fechaUltMantenimiento) : new Date(),
                },
                select: { id: true, placa: true, marca: true, modelo: true, tipoUnidad: true }
            });
            
            return res.status(201).json(newUnidad);
        } catch (error) {
            console.error('Error al crear unidad:', error);
            return res.status(500).json({ message: 'Error interno del servidor al registrar la unidad' });
        }
    }

    static async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        const {
            placa, marca, modelo, tipoUnidad, capacidadPasajeros,
            capacidadCargaKg, kilometrajeActual, estado, fechaUltMantenimiento
        } = req.body;

        try {
            const unidadActualizada = await prisma.unidad.update({
                where: { id },
                data: {
                    ...(placa && { placa }),
                    ...(marca !== undefined && { marca }),
                    ...(modelo !== undefined && { modelo }),
                    ...(tipoUnidad && { tipoUnidad: tipoUnidad as TipoUnidad }),
                    ...(capacidadPasajeros !== undefined && { capacidadPasajeros: Number(capacidadPasajeros) }),
                    ...(capacidadCargaKg !== undefined && { capacidadCargaKg: Number(capacidadCargaKg) }),
                    ...(kilometrajeActual !== undefined && { kilometrajeActual: Number(kilometrajeActual) }),
                    ...(estado && { estado: estado as StatusUnidad }),
                    ...(fechaUltMantenimiento && { fechaUltMantenimiento: new Date(fechaUltMantenimiento) }),
                },
            });
            return res.status(200).json({ success: true, data: unidadActualizada });
        } catch (error) {
            console.error('Error al actualizar unidad:', error);
            return res.status(500).json({ success: false, message: 'Error al actualizar la unidad' });
        }
    }

    static async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            await prisma.unidad.delete({ where: { id } });
            return res.status(200).json({ success: true, message: 'Unidad eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar unidad:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar la unidad' });
        }
    }
}