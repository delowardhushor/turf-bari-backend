import { Schema, model } from 'mongoose';
import { ITurfCompany, TurfCompanyModel } from './turfCompany.interface';

const turfCompanySchema = new Schema<ITurfCompany, TurfCompanyModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const TurfCompany = model<ITurfCompany, TurfCompanyModel>(
  'TurfCompany',
  turfCompanySchema
);
