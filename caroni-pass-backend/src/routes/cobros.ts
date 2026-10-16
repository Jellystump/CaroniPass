import { Router } from 'express';
import { CobroController } from '../controllers/cobros.js';

const cobrosRouter = Router();

cobrosRouter.get('/', CobroController.getAll);
cobrosRouter.get('/:id', CobroController.getById);
cobrosRouter.post('/', CobroController.create);
cobrosRouter.put('/:id', CobroController.update);     // [NUEVO] Para editar en el dashboard
cobrosRouter.delete('/:id', CobroController.delete); // [NUEVO] Para eliminar en el dashboard

export default cobrosRouter;