import { z } from 'zod';

const createTurfCompanyZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    logo: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    ownerId: z.string().min(1, 'Owner ID is required'),
  }),
});

const updateTurfCompanyZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    logo: z.string().optional(),
    address: z.string().optional(),
    ownerId: z.string().optional(),
  }),
});

export const TurfCompanyValidation = {
  createTurfCompanyZodSchema,
  updateTurfCompanyZodSchema,
};
