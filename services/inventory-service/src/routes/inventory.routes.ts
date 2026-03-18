import express, { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router: express.Router = Router();
const controller = new InventoryController();

router.post('/seed', controller.seed.bind(controller));
router.get('/:productId', controller.getAvailability.bind(controller));
router.post('/:productId/reservations', controller.reserve.bind(controller));
router.post('/reservations/:reservationId/release', controller.release.bind(controller));
router.post('/reservations/:reservationId/commit', controller.commit.bind(controller));

export default router;
