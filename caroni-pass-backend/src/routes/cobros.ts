import { Router } from 'express';
import { CobroController } from '../controllers/cobros.js';

const cobrosRouter = Router();

cobrosRouter.get('/', CobroController.getAll);
cobrosRouter.get('last/:id', CobroController.getUltimoCobro);
cobrosRouter.get('/:id', CobroController.getById);
cobrosRouter.post('/', CobroController.create);
cobrosRouter.put('/:id', CobroController.update);
cobrosRouter.delete('/:id', CobroController.delete);

export default cobrosRouter;