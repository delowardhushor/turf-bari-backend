import httpStatus from 'http-status';
import { Types } from 'mongoose';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { OtpRequest } from './otp.model';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type Rule = { windowMs: number; max: number };

// Seconds until another send is allowed, or 0 if this one is fine.
// `previous` = timestamps (ms) of earlier sends, newest first.
const retryAfterSeconds = (previous: number[], rules: Rule[], now: number): number => {
  let wait = 0;
  for (const { windowMs, max } of rules) {
    const inWindow = previous.filter((t) => now - t < windowMs);
    if (inWindow.length >= max) {
      // The window frees up once the max-th most recent send ages out
      wait = Math.max(wait, windowMs - (now - inWindow[max - 1]));
    }
  }
  return Math.ceil(wait / 1000);
};

/**
 * Reserves one OTP send for `recipient` (normalized phone/email) and `ip`, or throws 429.
 * Counted per recipient: a cooldown between sends plus hourly and daily caps; per IP: an hourly cap.
 * Runs before the user lookup so the answer is the same whether or not the account exists.
 * Returns a `release` to call if the SMS then fails to send, so the user isn't penalized for it.
 */
export const reserveOtpSend = async (
  recipient: string,
  ip?: string
): Promise<() => Promise<void>> => {
  const { cooldown_seconds, max_per_hour, max_per_day, max_per_ip_per_hour } = config.otp_limits;

  const checks: { key: string; rules: Rule[] }[] = [
    {
      key: `id:${recipient}`,
      rules: [
        { windowMs: cooldown_seconds * 1000, max: 1 },
        { windowMs: HOUR_MS, max: max_per_hour },
        { windowMs: DAY_MS, max: max_per_day },
      ],
    },
  ];
  if (ip) checks.push({ key: `ip:${ip}`, rules: [{ windowMs: HOUR_MS, max: max_per_ip_per_hour }] });

  // Insert first, then count only rows older than ours (lower _id): of several simultaneous
  // requests exactly one wins, instead of all slipping through a check-then-insert gap.
  const mine = await OtpRequest.insertMany(checks.map((c) => ({ key: c.key })));
  const mineIds = mine.map((m) => m._id as Types.ObjectId);
  const release = async () => {
    await OtpRequest.deleteMany({ _id: { $in: mineIds } });
  };

  const now = Date.now();
  let retryAfter = 0;
  for (const [i, { key, rules }] of checks.entries()) {
    const rows = await OtpRequest.find({ key, _id: { $lt: mineIds[i] }, createdAt: { $gt: new Date(now - DAY_MS) } })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();
    const wait = retryAfterSeconds(rows.map((r) => r.createdAt.getTime()), rules, now);
    retryAfter = Math.max(retryAfter, wait);
  }

  if (retryAfter > 0) {
    await release();
    throw new ApiError(
      httpStatus.TOO_MANY_REQUESTS,
      `Too many OTP requests. Please try again in ${formatWait(retryAfter)}.`,
      '',
      retryAfter
    );
  }

  return release;
};

const formatWait = (seconds: number): string => {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
};
