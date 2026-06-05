import { IGround } from './ground.interface';
import { Ground } from './ground.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const createGround = async (payload: IGround): Promise<IGround> => {
  const result = await Ground.create(payload);
  return result;
};

const getAllGrounds = async (filters: { companyId?: string }): Promise<IGround[]> => {
  const query: Record<string, any> = {};
  if (filters.companyId) {
    query.companyId = filters.companyId;
  }
  const result = await Ground.find(query).populate('companyId');
  return result;
};

const getSingleGround = async (id: string): Promise<IGround | null> => {
  const result = await Ground.findById(id).populate('companyId');
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }
  return result;
};

const updateGround = async (
  id: string,
  payload: Partial<IGround>
): Promise<IGround | null> => {
  const isExist = await Ground.findById(id);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }

  const result = await Ground.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteGround = async (id: string): Promise<IGround | null> => {
  const isExist = await Ground.findById(id);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }

  const result = await Ground.findByIdAndDelete(id);
  return result;
};

export const GroundService = {
  createGround,
  getAllGrounds,
  getSingleGround,
  updateGround,
  deleteGround,
};
