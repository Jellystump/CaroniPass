import { Router } from 'express';
import { TelemetriaController } from '../controllers/telemetria.js';

const router = Router();

// Endpoint para que los dispositivos/buses envíen su posición GPS
router.post('/', TelemetriaController.registrar);

// Endpoint para depuración (últimos 20 registros con detalles de la unidad)
router.get('/debug', TelemetriaController.obtenerDebug);

// Endpoint que consumirá la app móvil para pintar los pines de las unidades en el mapa en vivo
router.get('/activas', TelemetriaController.obtenerUbicacionesActivas);

export default router;