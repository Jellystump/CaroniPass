import { Router } from 'express';
import { TelemetriaController } from '../controllers/telemetria.js';

export const telemetriaRouter = Router();

// Endpoint para que los dispositivos/buses envíen su posición GPS
telemetriaRouter.post('/', TelemetriaController.registrar);

// Endpoint para depuración (últimos 20 registros con detalles de la unidad)
telemetriaRouter.get('/debug', TelemetriaController.obtenerDebug);

// Endpoint que consumirá la app móvil para pintar los pines de las unidades en el mapa en vivo
telemetriaRouter.get('/activas', TelemetriaController.obtenerUbicacionesActivas);

export default telemetriaRouter;