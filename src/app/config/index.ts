import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database_url: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/turfbari',
  // Where uploaded images live on disk; served publicly under /uploads
  upload_dir: path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')),
  bcrypt_salt_rounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  // Number of reverse-proxy hops in front of the app (so req.ip is the real client). 0 = none.
  trust_proxy: parseInt(process.env.TRUST_PROXY || '0', 10),
  // Dev shortcut: when set, every OTP is this fixed code and no SMS is sent. Ignored in production.
  otp_static_code: process.env.OTP_STATIC_CODE ?? '',
  // Send limits for OTP requests (per phone/email and per client IP)
  otp_limits: {
    cooldown_seconds: parseInt(process.env.OTP_COOLDOWN_SECONDS || '60', 10),
    max_per_hour: parseInt(process.env.OTP_MAX_PER_HOUR || '5', 10),
    max_per_day: parseInt(process.env.OTP_MAX_PER_DAY || '10', 10),
    max_per_ip_per_hour: parseInt(process.env.OTP_MAX_PER_IP_PER_HOUR || '20', 10),
  },
  // MiMSMS gateway
  sms: {
    api_url: process.env.SMS_API_URL || 'https://api.mimsms.com/api/SmsSending/SMS',
    api_key: process.env.SMS_API_KEY || '',
    user_name: process.env.SMS_USER_NAME || '',
    sender_id: process.env.SMS_SENDER_ID || '',
    transaction_type: process.env.SMS_TRANSACTION_TYPE || 'T',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'turfbari-secret-key-123456-789-xyz',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },
};
