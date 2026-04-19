import { NextFunction, Request, Response } from 'express';
import { Subscriber } from '../models/Subscriber';
import { sendWelcomeEmail } from '../services/email.service';

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, lastName, email } = req.body as Record<string, string>;

    if (!name?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Name, lastName and email are required.' });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'This email is already subscribed.' });
    }

    const subscriber = await Subscriber.create({ name, lastName, email });

    sendWelcomeEmail(subscriber).catch((err) =>
      console.error('Welcome email failed:', err)
    );

    return res.status(201).json({
      message: 'Successfully subscribed to camera alerts.',
      subscriber: { name, lastName, email },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubscribers(req: Request, res: Response, next: NextFunction) {
  try {
    const subscribers = await Subscriber.find({ active: true })
      .select('-__v')
      .sort({ subscribedAt: -1 });
    return res.json(subscribers);
  } catch (err) {
    next(err);
  }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.params;
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { active: false },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }

    return res.json({ message: 'Successfully unsubscribed.' });
  } catch (err) {
    next(err);
  }
}
