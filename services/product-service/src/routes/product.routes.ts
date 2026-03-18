import express, { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router: express.Router = Router();
const controller = new ProductController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));

export default router;
