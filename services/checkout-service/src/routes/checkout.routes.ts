import express, { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';

const router: express.Router = Router();
const controller = new CheckoutController();

router.post('/session', controller.createSession.bind(controller));
router.post('/confirm', controller.confirm.bind(controller));
router.get('/:sessionId', controller.getSession.bind(controller));

export default router;
