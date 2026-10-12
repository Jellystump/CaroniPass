import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { TipoUnidad, StatusUnidad } from '@prisma/client';

export class  UserController {

    static async getAll(req: Request, res: Response) {
        try {
            const unidades = await prisma.unidad.findMany({
                include: {
                    cobros: true,
                },
                orderBy: {
                    id: 'desc',
                },
            });

            return res.status(200).json(unidades);
        } catch (error) {
            console.error('Error al obtener todos las unidades:', error);

            return res.status(500).json({
                message: 'Error interno del servidor al consultar las unidades',
            });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: 'El ID de unidad es requerido' });
        }

        try {
            const unidad = await prisma.unidad.findUnique({
                where: { id },
                include: { cobros: true, recargas: true }
            })

            if (unidad) return res.json(unidad)

            return res.status(200).json(unidad);
        } catch (error) {
            console.error('Error al obtener unidad por ID:', error);
            
            return res.status(500).json({ 
                message: 'Error interno del servidor al consultar la unidad' 
            });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {
            placa,
            marca,
            modelo,
            tipoUnidad,
            capacidadPasajeros,
            capacidadCargaKg,
            kilometrajeActual,
            estado,
            fechaUltMantenimiento,
        } = req.body;
            
        if (!placa || !tipoUnidad || !capacidadPasajeros) {
            return res.status(400).json({ 
                message: 'Los campos "placa", "tipo de unidad" y "capacidad de pasajeros" son obligatorios' 
            });
        } 

        if (tipoUnidad && !Object.values(TipoUnidad).includes(tipoUnidad)) {
            return res.status(400).json({ 
                message: `Estado inválido. Los valores permitidos son: ${Object.values(TipoUnidad).join(', ')}` 
            });
        }
        if (estado && !Object.values(StatusUnidad).includes(estado)) {
            return res.status(400).json({ 
                message: `Estado inválido. Los valores permitidos son: ${Object.values(StatusUnidad).join(', ')}` 
            });
        }

        try {
            const existingUnidad = await prisma.unidad.findUnique({
                where: { placa },
            });

            if (existingUnidad) {
                return res.status(409).json({
                message: 'Ya existe una unidad registrada con esta placa',
                });
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
                select: {
                    id: true,
                    placa: true,
                    marca: true,
                    modelo: true,
                    tipoUnidad: true,
                }
            });
            
            return res.status(201).json(newUnidad);
        } catch (error) {
            console.error('Error al crear unidad:', error);

            return res.status(500).json({ 
                message: 'Error interno del servidor al registrar la unidad' 
            });
        }
    }



}