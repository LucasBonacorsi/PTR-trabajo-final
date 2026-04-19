import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  name: string;
  lastName: string;
  email: string;
  subscribedAt: Date;
  active: boolean;
}

const subscriberSchema = new Schema<ISubscriber>({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export const Subscriber = mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
