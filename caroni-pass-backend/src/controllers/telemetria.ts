import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TelemetriaPayload } from '../types/TelemetriaPayload.js';

export class TelemetriaController {

    static async registrar(req: Request<{}, {}, TelemetriaPayload>, res: Response): Promise<Response> {
        const { unidadId, latitud, longitud, velocidad, timestamp } = req.body;

        if (!unidadId || latitud === undefined || longitud === undefined) {
            return res.status(400).json({ message: 'Faltan datos obligatorios de telemetría' });
        }

        try {
            const unidadExiste = await prisma.unidad.findUnique({
                where: { id: unidadId }
            });

            if (!unidadExiste) {
                return res.status(404).json({ message: 'La unidad especificada no existe' });
            }

            const nuevaTelemetria = await prisma.telemetria.create({
                data: {
                    unidadId,
                    latitud: Number(latitud),
                    longitud: Number(longitud),
                    velocidad: velocidad ? Number(velocidad) : 0,
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                },
            });

            return res.status(201).json({ success: true, data: nuevaTelemetria });
        } catch (error) {
            console.error('Error al guardar telemetria:', error);
            return res.status(500).json({ message: 'Error interno al registrar telemetría' });
        }
    }

    static async obtenerDebug(req: Request, res: Response): Promise<Response> {
        try {
            const telemetrias = await prisma.telemetria.findMany({
                take: 20,
                orderBy: {
                    timestamp: 'desc',
                },
                include: {
                    unidad: {
                        select: {
                            placa: true,
                            marca: true,
                            modelo: true,
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                totalRegistros: telemetrias.length,
                data: telemetrias,
            });
        } catch (error) {
            console.error('Error al obtener telemetría de debug:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al consultar la telemetría', 
                error: String(error) 
            });
        }
    }

    static async obtenerUbicacionesActivas(req: Request, res: Response): Promise<Response> {
        try {
            const unidades = await prisma.unidad.findMany({
                include: {
                    telemetrias: {
                        orderBy: { timestamp: 'desc' },
                        take: 1, // Tomamos solo el registro más reciente
                    }
                }
            });

            const unidadesConUbicacion = unidades.flatMap(u => {
                const telemetria = u.telemetrias[0];
                if (!telemetria) return [];

                return [{
                    id: u.id,
                    placa: u.placa,
                    tipoUnidad: u.tipoUnidad,
                    estado: u.estado,
                    latitud: telemetria.latitud,
                    longitud: telemetria.longitud,
                    velocidad: telemetria.velocidad,
                    timestamp: telemetria.timestamp,
                }];
            });

            return res.status(200).json({
                success: true,
                data: unidadesConUbicacion,
            });
        } catch (error) {
            console.error('Error al obtener ubicaciones activas:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error interno al consultar el mapa en tiempo real' 
            });
        }
    }
}