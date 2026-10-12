import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const unidadRouter = Router();

unidadRouter.post('/login-placa', async (req: Request, res: Response) => {
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
});