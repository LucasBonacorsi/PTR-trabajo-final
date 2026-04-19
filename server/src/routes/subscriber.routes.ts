import { Router } from 'express';
import {
  subscribe,
  getSubscribers,
  unsubscribe,
} from '../controllers/subscriber.controller';

const router = Router();

router.post('/', subscribe);
router.get('/', getSubscribers);
router.delete('/:email', unsubscribe);

export default router;
