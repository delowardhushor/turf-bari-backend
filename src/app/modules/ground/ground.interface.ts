import { Model, Types } from 'mongoose';

export type ITimePricingRule = {
  startTime: string; // e.g. "06:00"
  endTime: string;   // e.g. "12:00"
  price: number;     // specific price for this time range
};

export type ICampaign = {
  name: string;
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
};

export type IPricingConfig = {
  basePrice: number;
  weekendPrice?: number; // Price on Friday & Saturday (standard weekend in BD)
  timeRules?: ITimePricingRule[];
};

export type IGround = {
  name: string;
  description?: string;
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
