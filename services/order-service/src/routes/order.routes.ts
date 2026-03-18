import express, { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router: express.Router = Router();
const controller = new OrderController();

router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/', controller.getByUser.bind(controller));

export default router;
