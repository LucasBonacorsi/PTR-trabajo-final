import { Router } from 'express';
import { getCameraStatus, getCameraList } from '../controllers/camera.controller';

const router = Router();

router.get('/status', getCameraStatus);
router.get('/list', getCameraList);

export default router;
