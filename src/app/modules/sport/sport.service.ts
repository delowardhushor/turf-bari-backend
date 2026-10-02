import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { Ground } from '../ground/ground.model';
import { ISport } from './sport.interface';
import { Sport } from './sport.model';

const createSport = async (payload: ISport): Promise<ISport> => {
  if (await Sport.exists({ key: payload.key })) {
    throw new ApiError(httpStatus.CONFLICT, `A sport with key "${payload.key}" already exists`);
  }
  return await Sport.create(payload);
};

const getSports = async ({ includeInactive }: { includeInactive: boolean }): Promise<ISport[]> => {
  return await Sport.find(includeInactive ? {} : { isActive: true }).sort({ order: 1, 'name.en': 1 });
};

const getSingleSport = async (id: string): Promise<ISport | null> => {
  const result = await Sport.findById(id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sport not found');
  }
  return result;
};

const updateSport = async (id: string, payload: Partial<ISport>): Promise<ISport | null> => {
  const { name, ...rest } = payload;

  // Set name fields individually so renaming one language doesn't wipe the other
  const update: Record<string, any> = { ...rest };
  if (name) {
    for (const [lang, value] of Object.entries(name)) {
      update[`name.${lang}`] = value;
    }
  }

  const result = await Sport.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sport not found');
  }
  return result;
};

const deleteSport = async (id: string): Promise<ISport | null> => {
  const sport = await Sport.findById(id);
  if (!sport) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sport not found');
  }

  const groundsUsing = await Ground.countDocuments({ sports: sport.key });
  if (groundsUsing > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `${groundsUsing} ground(s) still offer this sport. Deactivate it instead of deleting.`
    );
  }

  await sport.deleteOne();
  return sport;
};

// A ground may only be given sports that exist; newly added ones must also be active
const assertValidGroundSports = async (sports: string[], currentSports: string[] = []) => {
  const keys = [...new Set(sports.map((s) => s.trim().toLowerCase()))];
  const found = await Sport.find({ key: { $in: keys } });
  const byKey = new Map(found.map((s) => [s.key, s]));

  const unknown = keys.filter((k) => !byKey.has(k));
  if (unknown.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Unknown sport: ${unknown.join(', ')}`);
  }

  const inactive = keys.filter((k) => !byKey.get(k)!.isActive && !currentSports.includes(k));
  if (inactive.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Sport is not available: ${inactive.join(', ')}`);
  }
};

export const SportService = {
  createSport,
  getSports,
  getSingleSport,
  updateSport,
  deleteSport,
  assertValidGroundSports,
};
