import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TelemetriaPayload } from '../types/TelemetriaPayload.js';

export const registrarTelemetria = async (req: Request<{}, {}, TelemetriaPayload>, res: Response) => {
  const { unidadId, latitud, longitud, velocidad, timestamp } = req.body;

  if (!unidadId || latitud === undefined || longitud === undefined) {
    return res.status(400).json({ message: 'Faltan datos obligatorios de telemetría' });
  }

  try {
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
};

export const obtenerTelemetriaDebug = async (req: Request, res: Response) => {
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
};