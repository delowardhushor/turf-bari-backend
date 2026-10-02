import { IGround } from './ground.interface';
import { Ground } from './ground.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { SlotService } from '../slot/slot.service';
import { ISlot } from '../slot/slot.interface';
import { validateTimeBands } from './ground.pricing';
import { SportService } from '../sport/sport.service';

const assertValidTimeBands = (
  bands: IGround['pricingConfig']['timeBands'],
  operatingHours: IGround['operatingHours']
) => {
  const error = bands && validateTimeBands(bands, operatingHours);
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const createGround = async (payload: IGround): Promise<IGround> => {
  assertValidTimeBands(payload.pricingConfig.timeBands, payload.operatingHours);
  await SportService.assertValidGroundSports(payload.sports);
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

  const { pricingConfig, ...rest } = payload;

  if (payload.sports) {
    await SportService.assertValidGroundSports(payload.sports, isExist.sports);
  }

  // Bands are checked against the operating hours the ground will have after this update
  assertValidTimeBands(
    pricingConfig?.timeBands ?? isExist.pricingConfig.timeBands,
    payload.operatingHours ?? isExist.operatingHours
  );

  // Set pricingConfig fields individually so a partial update (e.g. only basePrice)
  // doesn't wipe the rest of the price table
  const update: Record<string, any> = { ...rest };
  if (pricingConfig) {
    for (const [key, value] of Object.entries(pricingConfig)) {
      update[`pricingConfig.${key}`] = value;
    }
  }

  const result = await Ground.findByIdAndUpdate(id, update, {
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

type ISearchFilters = {
  date: string;
  sport?: string;
  startTime?: string; // only slots starting at or after this time
  endTime?: string; // only slots ending at or before this time
  companyId?: string;
};

// Active grounds that have at least one free slot matching the date/sport/time window
const searchGrounds = async (
  filters: ISearchFilters
): Promise<{ ground: IGround; availableSlots: ISlot[] }[]> => {
  const query: Record<string, any> = { status: 'active' };
  if (filters.sport) query.sports = filters.sport.trim().toLowerCase();
  if (filters.companyId) query.companyId = filters.companyId;

  const grounds = await Ground.find(query).populate('companyId');

  const results = await Promise.all(
    grounds.map(async (ground) => {
      try {
        // Generates the day's slots on first access
        const slots = await SlotService.getSlotsForDate(
          (ground as any)._id.toString(),
          filters.date
        );
        const availableSlots = slots.filter(
          (s) =>
            !s.isBooked &&
            !s.isDisabled &&
            (!filters.startTime || s.startTime >= filters.startTime) &&
            (!filters.endTime || s.endTime <= filters.endTime)
        );
        return { ground, availableSlots };
      } catch {
        // Misconfigured ground (e.g. bad operating hours) - leave it out of results
        return { ground, availableSlots: [] as ISlot[] };
      }
    })
  );

  return results.filter((r) => r.availableSlots.length > 0);
};

export const GroundService = {
  searchGrounds,
  createGround,
  getAllGrounds,
  getSingleGround,
  updateGround,
  deleteGround,
};
