import { Router } from 'express';
import { RecargaController } from '../controllers/recarga.js';

const recargasRouter = Router();

recargasRouter.get('/', RecargaController.getAll);
recargasRouter.get('/:id', RecargaController.getById);
recargasRouter.post('/', RecargaController.create);
recargasRouter.put('/:id', RecargaController.update);    
recargasRouter.delete('/:id', RecargaController.delete);

export default recargasRouter;