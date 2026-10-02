import { z } from 'zod';

const createBookingZodSchema = z.object({
  body: z.object({
    slotId: z.string().min(1, 'Slot ID is required'),
    // Required when the ground hosts more than one sport
    sport: z.string().min(1).optional(),
  }),
});

const createManualBookingZodSchema = z.object({
  body: z.object({
    slotId: z.string().min(1, 'Slot ID is required'),
    sport: z.string().min(1).optional(),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().min(1, 'Customer phone is required'),
    advancePaid: z.number().min(0).optional(),
    paymentStatus: z.enum(['pending', 'paid']).optional(),
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
  createManualBookingZodSchema,
  updateBookingZodSchema,
};
