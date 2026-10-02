import { Model } from 'mongoose';

export type ISport = {
  // Stable lower-case slug (e.g. 'table-tennis'). Grounds and bookings store this, so it never changes.
  key: string;
  name: { en: string; bn?: string };
  // An emoji (e.g. '⚽') or an image URL
  icon?: string;
  order: number;
  isActive: boolean;
};

export type SportModel = Model<ISport, Record<string, never>>;
