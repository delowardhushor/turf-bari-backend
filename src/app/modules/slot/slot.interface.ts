import { Model, Types } from 'mongoose';

export type ISlot = {
  groundId: Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  price: number;
  isBooked: boolean;
  isDisabled: boolean;
};

export type SlotModelType = Model<ISlot, Record<string, never>>;
