import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { StatusCobro } from '@prisma/client';

export class  UserController {

    static async getAll(req: Request, res: Response) {
        try {
            const cobros = await prisma.cobro.findMany({
                orderBy: {
                    usuarioId: 'desc',
                },
            });

            return res.status(200).json(cobros);
        } catch (error) {
            console.error('Error al obtener todos los cobros:', error);

            return res.status(500).json({
                message: 'Error interno del servidor al consultar los cobros',
            });
        }
    }

    static async getById(req: Request<{ id: string }>, res: Response): Promise<Response> {
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: 'El ID de cobro es requerido' });
        }

        try {
            const cobro = await prisma.cobro.findUnique({
                where: { id },
            })

            if (cobro) return res.json(cobro)

            return res.status(200).json(cobro);
        } catch (error) {
            console.error('Error al obtener cobro por ID:', error);
            
            return res.status(500).json({ 
                message: 'Error interno del servidor al consultar el cobro' 
            });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const {
            monto,
            status,
            usuarioId,
            unidadId,
            timestamp,
        } = req.body;
            
        if (!monto || !usuarioId || !unidadId) {
            return res.status(400).json({ 
                message: 'Los campos "monto", "usuarioId" y "unidadId" son obligatorios' 
            });
        } 

        if (status && !Object.values(StatusCobro).includes(status)) {
                    return res.status(400).json({ 
                        message: `Estado inválido. Los valores permitidos son: ${Object.values(status).join(', ')}` 
                    });
                }

        try {
            const newCobro = await prisma.cobro.create({
                data: {
                    monto: Number(monto),
                    status: status as StatusCobro,
                    usuarioId,
                    unidadId,
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                },
                include: {
                    usuario: {
                        select: { id: true, nombre: true, email: true },
                    },
                    unidad: {
                        select: { id: true, placa: true, tipoUnidad: true },
                    },
                },
            });
            
            return res.status(201).json(newCobro);
        } catch (error) {
            console.error('Error al crear cobro:', error);

            return res.status(500).json({ 
                message: 'Error interno del servidor al registrar el cobro' 
            });
        }
    }



}