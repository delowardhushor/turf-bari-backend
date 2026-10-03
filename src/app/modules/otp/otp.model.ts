import { Schema, model } from 'mongoose';

// One row per OTP send, keyed by recipient (`id:<phone|email>`) or client (`ip:<address>`).
// Rows expire after a day; the throttle counts them to enforce its sliding windows.
const DAY_SECONDS = 24 * 60 * 60;

const otpRequestSchema = new Schema({
  key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: DAY_SECONDS },
});

otpRequestSchema.index({ key: 1, createdAt: -1 });

export const OtpRequest = model('OtpRequest', otpRequestSchema);
