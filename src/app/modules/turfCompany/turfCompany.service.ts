import { ITurfCompany } from './turfCompany.interface';
import { TurfCompany } from './turfCompany.model';
import { User } from '../user/user.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

const createTurfCompany = async (payload: ITurfCompany): Promise<ITurfCompany> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Check if user exists
    const user = await User.findById(payload.ownerId).session(session);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Owner User not found');
    }

    // Check if user is a turf_owner
    if (user.role !== 'turf_owner') {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Only users with role "turf_owner" can own a TurfCompany'
      );
    }

    // Create company
    const [company] = await TurfCompany.create([payload], { session });

    // Link company to user's companies array
    await User.findByIdAndUpdate(
      payload.ownerId,
      { $addToSet: { companies: company._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return company;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllTurfCompanies = async (): Promise<ITurfCompany[]> => {
  const result = await TurfCompany.find({}).populate('ownerId');
  return result;
};

const getSingleTurfCompany = async (id: string): Promise<ITurfCompany | null> => {
  const result = await TurfCompany.findById(id).populate('ownerId');
  return result;
};

const updateTurfCompany = async (
  id: string,
  payload: Partial<ITurfCompany>
): Promise<ITurfCompany | null> => {
  const result = await TurfCompany.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteTurfCompany = async (id: string): Promise<ITurfCompany | null> => {
  const result = await TurfCompany.findByIdAndDelete(id);
  return result;
};

export const TurfCompanyService = {
  createTurfCompany,
  getAllTurfCompanies,
  getSingleTurfCompany,
  updateTurfCompany,
  deleteTurfCompany,
};
