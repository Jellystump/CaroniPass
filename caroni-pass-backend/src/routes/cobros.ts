import { Router } from 'express';
import { CobroController } from '../controllers/cobros.js';

const cobrosRouter = Router();

cobrosRouter.get('/', CobroController.getAll);
cobrosRouter.get('/:id', CobroController.getById);
cobrosRouter.post('/', CobroController.create);

export default cobrosRouter;