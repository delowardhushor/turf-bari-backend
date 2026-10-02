import { z } from 'zod';

const timeString = (label: string) =>
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} must be in HH:MM format`);

const dayPrice = z.number().min(0, 'Price must be a non-negative number').optional();

// One column of the price table: a time range plus a price for each weekday
const timeBandZodSchema = z.object({
  name: z.string().min(1, 'Time band name is required'),
  startTime: timeString('Band start time'),
  endTime: timeString('Band end time'),
  prices: z
    .object({
      sun: dayPrice,
      mon: dayPrice,
      tue: dayPrice,
      wed: dayPrice,
      thu: dayPrice,
      fri: dayPrice,
      sat: dayPrice,
    })
    .default({}),
});

const createGroundZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Ground name is required'),
    description: z.string().optional(),
    companyId: z.string().min(1, 'Company ID is required'),
    sports: z.array(z.string().min(1)).min(1, 'At least one sport is required'),
    slotDuration: z.number().min(15, 'Slot duration must be at least 15 minutes'),
    advancePayment: z.boolean().optional(),
    operatingHours: z.object({
      start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'),
      end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'),
    }),
    pricingConfig: z.object({
      basePrice: z.number().min(0, 'Base price must be a non-negative number'),
      timeBands: z.array(timeBandZodSchema).optional(),
    }),
    campaigns: z
      .array(
        z.object({
          name: z.string().min(1, 'Campaign name is required'),
          startDate: z.string().datetime({ message: 'Invalid start date format' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)')),
          endDate: z.string().datetime({ message: 'Invalid end date format' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)')),
          discountPercentage: z.number().min(0).max(100, 'Discount percentage must be between 0 and 100'),
        })
      )
      .optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

const updateGroundZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    companyId: z.string().optional(),
    sports: z.array(z.string().min(1)).min(1).optional(),
    slotDuration: z.number().min(15).optional(),
    advancePayment: z.boolean().optional(),
    operatingHours: z
      .object({
        start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'),
        end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'),
      })
      .optional(),
    pricingConfig: z
      .object({
        basePrice: z.number().min(0).optional(),
        timeBands: z.array(timeBandZodSchema).optional(),
      })
      .optional(),
    campaigns: z
      .array(
        z.object({
          name: z.string(),
          startDate: z.string().or(z.date()),
          endDate: z.string().or(z.date()),
          discountPercentage: z.number().min(0).max(100),
        })
      )
      .optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

const searchGroundZodSchema = z.object({
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    sport: z.string().min(1).optional(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'startTime must be HH:MM').optional(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'endTime must be HH:MM').optional(),
    companyId: z.string().optional(),
  }),
});

export const GroundValidation = {
  searchGroundZodSchema,
  createGroundZodSchema,
  updateGroundZodSchema,
};
