import { Schema, model } from 'mongoose';
import { ISlot, SlotModelType } from './slot.interface';

const slotSchema = new Schema<ISlot, SlotModelType>(
  {
    groundId: {
      type: Schema.Types.ObjectId,
      ref: 'Ground',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isBooked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Slot = model<ISlot, SlotModelType>('Slot', slotSchema);
