import { Model, Types } from 'mongoose';

export type IBooking = {
  userId?: Types.ObjectId; // absent for walk-in / phone bookings made by staff
  customerName?: string;
  customerPhone?: string;
  source: 'online' | 'manual';
  groundId: Types.ObjectId;
  slotId: Types.ObjectId;
  sport: string;
  companyId: Types.ObjectId;
  bookingDate: string; // YYYY-MM-DD
  totalPrice: number;
  advancePaid: number;
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type BookingModelType = Model<IBooking, Record<string, never>>;
