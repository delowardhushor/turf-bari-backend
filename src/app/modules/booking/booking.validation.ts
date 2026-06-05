import { z } from 'zod';

const createBookingZodSchema = z.object({
  body: z.object({
    slotId: z.string().min(1, 'Slot ID is required'),
  }),
});

const updateBookingZodSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['pending', 'paid']).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    advancePaid: z.number().min(0).optional(),
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
  updateBookingZodSchema,
};
