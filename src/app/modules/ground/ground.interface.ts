import { Model, Types } from 'mongoose';

// Index matches Date#getDay(): 0 = Sunday ... 6 = Saturday
export const PRICING_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type PricingDay = (typeof PRICING_DAYS)[number];

// One column of the owner's price table: a named time range with a price per day.
// A day without a price falls back to pricingConfig.basePrice.
export type ITimeBand = {
  name: string; // e.g. "Morning"
  startTime: string; // e.g. "06:00"
  endTime: string; // e.g. "12:00"
  prices: Partial<Record<PricingDay, number>>;
};

export type ICampaign = {
  name: string;
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
};

export type IPricingConfig = {
  basePrice: number; // fallback for any day/time not covered by a band price
  timeBands?: ITimeBand[];
};

export const MAX_GROUND_IMAGES = 10;

export type IGround = {
  name: string;
  description?: string;
  images: string[]; // public paths like /uploads/grounds/<id>.jpg; the first one is the cover
  companyId: Types.ObjectId;
  sports: string[]; // sports playable on this ground, e.g. ['cricket', 'football']
  slotDuration: number; // in minutes (e.g. 60, 90)
  advancePayment: boolean; // true/false
  operatingHours: {
    start: string; // e.g. "06:00"
    end: string;   // e.g. "23:00"
  };
  pricingConfig: IPricingConfig;
  campaigns?: ICampaign[];
  status: 'active' | 'inactive';
};

export type GroundModelType = Model<IGround, Record<string, never>>;
