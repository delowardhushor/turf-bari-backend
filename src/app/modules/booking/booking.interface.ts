import { Model, Types } from 'mongoose';

export type IBooking = {
  userId: Types.ObjectId;
  groundId: Types.ObjectId;
  slotId: Types.ObjectId;
  companyId: Types.ObjectId;
  bookingDate: string; // YYYY-MM-DD
  totalPrice: number;
  advancePaid: number;
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type BookingModelType = Model<IBooking, Record<string, never>>;
