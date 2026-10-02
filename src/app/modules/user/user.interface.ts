import { Model, Types } from 'mongoose';

export type IUser = {
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  googleId?: string;
  resetOtpHash?: string;
  resetOtpExpires?: Date;
  resetOtpAttempts?: number;
  role: 'super_admin' | 'turf_owner' | 'maintainer' | 'user';
  companies?: Types.ObjectId[];
};

export type UserModel = Model<IUser, Record<string, never>>;
