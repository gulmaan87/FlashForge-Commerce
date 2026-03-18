import express, { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router: express.Router = Router();
const controller = new PaymentController();

router.post('/intents', controller.createIntent.bind(controller));
router.post('/confirm', controller.confirm.bind(controller));

export default router;
