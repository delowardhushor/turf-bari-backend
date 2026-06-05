import { Model, Types } from 'mongoose';

export type ITurfCompany = {
  name: string;
  logo?: string;
  address: string;
  ownerId: Types.ObjectId;
};

export type TurfCompanyModel = Model<ITurfCompany, Record<string, never>>;
