import { Router } from 'express';
import subscriberRoutes from './subscriber.routes';
import cameraRoutes from './camera.routes';

const router = Router();

router.use('/subscribers', subscriberRoutes);
router.use('/camera', cameraRoutes);

export default router;
