import { Schema, model } from 'mongoose';
import { ISport, SportModel } from './sport.interface';

const sportSchema = new Schema<ISport, SportModel>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      en: { type: String, required: true, trim: true },
      bn: { type: String, trim: true },
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Sport = model<ISport, SportModel>('Sport', sportSchema);
