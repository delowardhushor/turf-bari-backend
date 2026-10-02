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
  // Temporary: every OTP is this fixed code until an SMS/email provider is wired up.
  // Set OTP_STATIC_CODE to an empty string to switch back to random codes.
  otp_static_code: process.env.OTP_STATIC_CODE ?? '123456',
  jwt: {
    secret: process.env.JWT_SECRET || 'turfbari-secret-key-123456-789-xyz',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },
};
