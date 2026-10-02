import { ISlot } from './slot.interface';
import { Slot } from './slot.model';
import { Ground } from '../ground/ground.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { resolveSlotPrice, timeToMinutes } from '../ground/ground.pricing';

// Helper to convert minutes from midnight to HH:MM
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const getSlotsForDate = async (groundId: string, date: string): Promise<ISlot[]> => {
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format. Use YYYY-MM-DD.');
  }

  // Check if slots already exist in DB for this ground and date
  let slots = await Slot.find({ groundId, date });

  if (slots.length > 0) {
    return slots;
  }

  // If slots don't exist, we must generate them based on Ground config
  const ground = await Ground.findById(groundId);
  if (!ground) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }

  if (ground.status === 'inactive') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This ground is currently inactive');
  }

  const { start, end } = ground.operatingHours;
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const duration = ground.slotDuration;

  if (endMinutes <= startMinutes) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid operating hours config. End time must be after start time.'
    );
  }

  // Parse date
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  // 1. Check active campaigns
  let discountPercentage = 0;
  if (ground.campaigns && ground.campaigns.length > 0) {
    const timeVal = dateObj.getTime();
    const activeCampaigns = ground.campaigns.filter((cam) => {
      const camStart = new Date(cam.startDate).getTime();
      const camEnd = new Date(cam.endDate).getTime();
      return timeVal >= camStart && timeVal <= camEnd;
    });

    if (activeCampaigns.length > 0) {
      // Use maximum discount percentage
      discountPercentage = Math.max(...activeCampaigns.map((c) => c.discountPercentage));
    }
  }

  const generatedSlotsData = [];
  let currentMinutes = startMinutes;

  while (currentMinutes + duration <= endMinutes) {
    const slotStartStr = minutesToTime(currentMinutes);
    const slotEndStr = minutesToTime(currentMinutes + duration);

    // 2. Price comes from the ground's day x time-band table
    let slotPrice = resolveSlotPrice(ground.pricingConfig, dayOfWeek, currentMinutes);

    // 3. Apply campaign discount
    if (discountPercentage > 0) {
      slotPrice = slotPrice * (1 - discountPercentage / 100);
    }

    generatedSlotsData.push({
      groundId,
      date,
      startTime: slotStartStr,
      endTime: slotEndStr,
      price: Math.round(slotPrice),
      isBooked: false,
      isDisabled: false,
    });

    currentMinutes += duration;
  }

  if (generatedSlotsData.length === 0) {
    return [];
  }

  // Save slots to database
  try {
    await Slot.insertMany(generatedSlotsData, { ordered: false });
  } catch (error: any) {
    // A concurrent request already generated them (duplicate key) - that's fine
    if (error?.code !== 11000 && !error?.writeErrors?.every((e: any) => e.err?.code === 11000)) {
      throw error;
    }
  }

  // Retrieve them again from DB to obtain mongoose _ids
  slots = await Slot.find({ groundId, date });
  return slots;
};

const updateSlot = async (id: string, payload: Partial<ISlot>): Promise<ISlot | null> => {
  const isExist = await Slot.findById(id);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  const result = await Slot.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const SlotService = {
  getSlotsForDate,
  updateSlot,
};
