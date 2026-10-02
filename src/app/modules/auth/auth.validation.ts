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

const signupPhoneZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const signupEmailZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const identifier = {
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().min(1).optional(),
};
const hasIdentifier = (b: { email?: string; phoneNumber?: string }) =>
  !!b.email !== !!b.phoneNumber;
const identifierMsg = { message: 'Provide either email or phoneNumber' };

const forgotPasswordZodSchema = z.object({
  body: z.object(identifier).refine(hasIdentifier, identifierMsg),
});

const resetPasswordZodSchema = z.object({
  body: z
    .object({
      ...identifier,
      otp: z.string().length(6, 'OTP must be 6 digits'),
      newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    })
    .refine(hasIdentifier, identifierMsg),
});

export const AuthValidation = {
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
  emailLoginZodSchema,
  phoneLoginZodSchema,
  googleLoginZodSchema,
  selectCompanyZodSchema,
  signupPhoneZodSchema,
  signupEmailZodSchema
};
