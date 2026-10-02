import { Schema, model } from 'mongoose';
import { IGround, GroundModelType } from './ground.interface';

// Price per weekday for one time band (a column of the owner's price table)
const bandPricesSchema = new Schema(
  {
    sun: { type: Number, min: 0 },
    mon: { type: Number, min: 0 },
    tue: { type: Number, min: 0 },
    wed: { type: Number, min: 0 },
    thu: { type: Number, min: 0 },
    fri: { type: Number, min: 0 },
    sat: { type: Number, min: 0 },
  },
  { _id: false }
);

const timeBandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    prices: { type: bandPricesSchema, default: () => ({}) },
  },
  { _id: false }
);

const groundSchema = new Schema<IGround, GroundModelType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'TurfCompany',
      required: true,
    },
    // A ground can host several sports (e.g. cricket and football); stored lower-case
    sports: {
      type: [{ type: String, trim: true, lowercase: true }],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one sport is required',
      },
    },
    slotDuration: {
      type: Number,
      required: true,
      default: 60,
    },
    advancePayment: {
      type: Boolean,
      required: true,
      default: false,
    },
    operatingHours: {
      start: {
        type: String,
        required: true,
        default: '06:00',
      },
      end: {
        type: String,
        required: true,
        default: '23:00',
      },
    },
    pricingConfig: {
      basePrice: {
        type: Number,
        required: true,
      },
      timeBands: [timeBandSchema],
    },
    campaigns: [
      {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        discountPercentage: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Ground = model<IGround, GroundModelType>('Ground', groundSchema);
