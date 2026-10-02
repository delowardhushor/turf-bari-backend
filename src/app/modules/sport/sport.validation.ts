import { z } from 'zod';

const keySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Key must be lower-case letters and numbers separated by hyphens (e.g. table-tennis)')
  .max(40);

const nameSchema = z.object({
  en: z.string().trim().min(1, 'English name is required').max(60),
  bn: z.string().trim().max(60).optional(),
});

const iconSchema = z.string().trim().max(500);

const createSportZodSchema = z.object({
  body: z.object({
    key: keySchema,
    name: nameSchema,
    icon: iconSchema.optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

// The key is deliberately not editable: grounds and bookings reference it
const updateSportZodSchema = z.object({
  body: z.object({
    name: nameSchema.partial().optional(),
    icon: iconSchema.optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const SportValidation = {
  createSportZodSchema,
  updateSportZodSchema,
};
