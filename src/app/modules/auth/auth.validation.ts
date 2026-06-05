import { z } from 'zod';

const emailLoginZodSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const phoneLoginZodSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const googleLoginZodSchema = z.object({
  body: z.object({
    googleId: z.string().min(1, 'Google ID is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    name: z.string().min(1, 'Name is required'),
  }),
});

const selectCompanyZodSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'Company ID is required'),
  }),
});

export const AuthValidation = {
  emailLoginZodSchema,
  phoneLoginZodSchema,
  googleLoginZodSchema,
  selectCompanyZodSchema,
};
