import { Schema, model } from 'mongoose';
import { IBooking, BookingModelType } from './booking.interface';

const bookingSchema = new Schema<IBooking, BookingModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groundId: {
      type: Schema.Types.ObjectId,
      ref: 'Ground',
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
      unique: true, // A slot can only be booked once
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'TurfCompany',
      required: true,
    },
    bookingDate: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    advancePaid: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Booking = model<IBooking, BookingModelType>('Booking', bookingSchema);
