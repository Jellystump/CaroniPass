import { Router } from 'express';
import { UserController } from '../controllers/users.js';

export const usersRouter = Router();

usersRouter.get('/', UserController.getAll);
usersRouter.post('/', UserController.create);
usersRouter.get('/:id', UserController.getById);
usersRouter.post('/log-in', UserController.login);
usersRouter.post('/saldo/:id', UserController.getSaldo);
usersRouter.put('/:id', UserController.update);     
usersRouter.delete('/:id', UserController.delete); 

export default usersRouter;