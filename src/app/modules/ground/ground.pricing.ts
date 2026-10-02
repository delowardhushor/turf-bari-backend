import { IPricingConfig, ITimeBand, PRICING_DAYS } from './ground.interface';

export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Returns an error message, or null when the bands are valid
export const validateTimeBands = (
  bands: Pick<ITimeBand, 'startTime' | 'endTime'>[],
  operatingHours?: { start: string; end: string }
): string | null => {
  const ranges = bands
    .map((b) => ({ start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) }))
    .sort((a, b) => a.start - b.start);

  for (let i = 0; i < ranges.length; i++) {
    if (ranges[i].end <= ranges[i].start) {
      return 'Time band end time must be after its start time';
    }
    if (i > 0 && ranges[i].start < ranges[i - 1].end) {
      return 'Time bands must not overlap';
    }
  }

  if (operatingHours && ranges.length > 0) {
    const opStart = timeToMinutes(operatingHours.start);
    const opEnd = timeToMinutes(operatingHours.end);
    if (ranges[0].start < opStart || ranges[ranges.length - 1].end > opEnd) {
      return 'Time bands must be within the ground operating hours';
    }
  }

  return null;
};

// Price of a slot = the cell (day x band) the slot's start time falls in; basePrice if no cell is set
export const resolveSlotPrice = (
  pricing: IPricingConfig,
  dayOfWeek: number, // 0 = Sunday ... 6 = Saturday (Date#getDay)
  slotStartMinutes: number
): number => {
  const band = pricing.timeBands?.find(
    (b) =>
      slotStartMinutes >= timeToMinutes(b.startTime) &&
      slotStartMinutes < timeToMinutes(b.endTime)
  );
  const cellPrice = band?.prices?.[PRICING_DAYS[dayOfWeek]];
  return cellPrice ?? pricing.basePrice;
};
