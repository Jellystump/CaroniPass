import { Router } from 'express';
import { UnidadController } from '../controllers/unidades.js'; 

export const unidadRouter = Router();

unidadRouter.post('/login-placa', UnidadController.loginPlaca); 
unidadRouter.get('/', UnidadController.getAll);
unidadRouter.get('/:id', UnidadController.getById);
unidadRouter.post('/', UnidadController.create);
unidadRouter.put('/:id', UnidadController.update);   
unidadRouter.delete('/:id', UnidadController.delete); 

export default unidadRouter;