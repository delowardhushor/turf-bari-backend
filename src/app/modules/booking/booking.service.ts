import mongoose, { Types } from 'mongoose';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
import { Slot } from '../slot/slot.model';
import { Ground } from '../ground/ground.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const createBooking = async (
  userId: string,
  slotId: string
): Promise<IBooking> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Fetch slot
    const slot = await Slot.findById(slotId).session(session);
    if (!slot) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
    }

    if (slot.isBooked) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slot is already booked');
    }

    if (slot.isDisabled) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slot is currently disabled');
    }

    // 2. Fetch ground to check advance payment config and company ID
    const ground = await Ground.findById(slot.groundId).session(session);
    if (!ground) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found for this slot');
    }

    // 3. Determine advance payment amount (e.g. 50% of slot price if advancePayment is true)
    const advancePaidAmount = ground.advancePayment ? Math.round(slot.price * 0.5) : 0;

    // 4. Mark slot as booked
    slot.isBooked = true;
    await slot.save({ session });

    // 5. Create booking record
    const [booking] = await Booking.create(
      [
        {
          userId: new Types.ObjectId(userId),
          groundId: slot.groundId,
          slotId: slot._id,
          companyId: ground.companyId,
          bookingDate: slot.date,
          totalPrice: slot.price,
          advancePaid: advancePaidAmount,
          paymentStatus: 'pending',
          status: 'pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Retrieve full populated booking
    const result = await Booking.findById(booking._id)
      .populate('userId')
      .populate('groundId')
      .populate('slotId')
      .populate('companyId');

    return result!;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllBookings = async (filters: {
  userId?: string;
  companyId?: string;
}): Promise<IBooking[]> => {
  const query: Record<string, any> = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }
  if (filters.companyId) {
    query.companyId = filters.companyId;
  }

  const result = await Booking.find(query)
    .populate('userId')
    .populate('groundId')
    .populate('slotId')
    .populate('companyId');

  return result;
};

const getSingleBooking = async (id: string): Promise<IBooking | null> => {
  const result = await Booking.findById(id)
    .populate('userId')
    .populate('groundId')
    .populate('slotId')
    .populate('companyId');

  return result;
};

const updateBooking = async (
  id: string,
  payload: Partial<IBooking>
): Promise<IBooking | null> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Release slot if booking is cancelled
    if (payload.status === 'cancelled' && booking.status !== 'cancelled') {
      await Slot.findByIdAndUpdate(
        booking.slotId,
        { isBooked: false },
        { session }
      );
    }

    // Re-book slot if booking is re-confirmed / changed back from cancelled
    if (
      payload.status &&
      payload.status !== 'cancelled' &&
      booking.status === 'cancelled'
    ) {
      const slot = await Slot.findById(booking.slotId).session(session);
      if (slot) {
        if (slot.isBooked) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Cannot re-confirm booking, slot is already booked by another reservation'
          );
        }
        slot.isBooked = true;
        await slot.save({ session });
      }
    }

    const result = await Booking.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    // Fetch populated result
    return await Booking.findById(id)
      .populate('userId')
      .populate('groundId')
      .populate('slotId')
      .populate('companyId');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
};
