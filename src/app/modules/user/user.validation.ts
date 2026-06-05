import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    googleId: z.string().optional(),
    role: z.enum(['super_admin', 'turf_owner', 'maintainer', 'user']).optional(),
    companies: z.array(z.string()).optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    googleId: z.string().optional(),
    role: z.enum(['super_admin', 'turf_owner', 'maintainer', 'user']).optional(),
    companies: z.array(z.string()).optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
