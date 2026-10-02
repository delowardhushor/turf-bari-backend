import { Schema, model } from 'mongoose';
import { IBooking, BookingModelType } from './booking.interface';

const bookingSchema = new Schema<IBooking, BookingModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // Walk-in / phone bookings created by staff
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    source: {
      type: String,
      enum: ['online', 'manual'],
      default: 'online',
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
    },
    sport: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

// A slot can have only one active booking; cancelled bookings free it up again.
// (Drop the old unique index first: db.bookings.dropIndex('slotId_1'))
bookingSchema.index(
  { slotId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

export const Booking = model<IBooking, BookingModelType>('Booking', bookingSchema);
