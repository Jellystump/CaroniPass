import { Router } from 'express';
import { registrarTelemetria, obtenerTelemetriaDebug } from '../controllers/telemetria.js';

export const telemetriaRouter = Router();
// Ruta POST para recibir datos de GPS de la app móvil
telemetriaRouter.post('/', registrarTelemetria);

telemetriaRouter.get('/debug/telemetria', obtenerTelemetriaDebug);