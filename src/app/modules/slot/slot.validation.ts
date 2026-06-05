import { z } from 'zod';

const updateSlotZodSchema = z.object({
  body: z.object({
    price: z.number().min(0, 'Price must be a non-negative number').optional(),
    isDisabled: z.boolean().optional(),
    isBooked: z.boolean().optional(),
  }),
});

export const SlotValidation = {
  updateSlotZodSchema,
};
