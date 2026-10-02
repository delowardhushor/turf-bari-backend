import { User } from '../user/user.model';
import {
  IEmailLoginPayload,
  IEmailSignupPayload,
  IGoogleLoginPayload,
  ILoginResponse,
  IPhoneLoginPayload,
  IPhoneSignupPayload,
  ISignupResponse,
} from './auth.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import crypto from 'crypto';
import { TurfCompany } from '../turfCompany/turfCompany.model';

// Helper to sign JWT
const createToken = (
  payload: Record<string, unknown>,
  secret: string,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime as jwt.SignOptions['expiresIn'],
  });
};

// Helper to compare password
const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hashed);
};

// Helper to format login response
const formatLoginResponse = async (user: any): Promise<ILoginResponse> => {
  const needsCompanySelection =
    (user.role === 'turf_owner' || user.role === 'maintainer') &&
    user.companies &&
    user.companies.length > 0;

  // Retrieve companies list
  let associatedCompanies: { id: string; name: string }[] = [];
  if (user.companies && user.companies.length > 0) {
    const companies = await TurfCompany.find({ _id: { $in: user.companies } });
    associatedCompanies = companies.map((c) => ({
      id: c._id.toString(),
      name: c.name,
    }));
  }

  // Issue standard token (companyId will be null until selected)
  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    companyId: null,
  };

  const accessToken = createToken(
    tokenPayload,
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    accessToken,
    needsCompanySelection,
    associatedCompanies: needsCompanySelection ? associatedCompanies : undefined,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
};

const loginEmail = async (payload: IEmailLoginPayload): Promise<ILoginResponse> => {
  const { email, password } = payload;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.password || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is not set for this account');
  }

  const isPasswordMatched = await comparePassword(password, user.password);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  return await formatLoginResponse(user);
};

const loginPhone = async (payload: IPhoneLoginPayload): Promise<ILoginResponse> => {
  const { phoneNumber, password } = payload;

  // Find user and explicitly select password
  const user = await User.findOne({ phoneNumber }).select('+password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.password || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is not set for this account');
  }

  const isPasswordMatched = await comparePassword(password, user.password);
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  return await formatLoginResponse(user);
};

const loginGoogle = async (payload: IGoogleLoginPayload): Promise<ILoginResponse> => {
  const { googleId, email, name } = payload;

  // Find user by Google ID or Email
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (!user) {
    // Auto-register social user
    user = await User.create({
      name,
      email,
      googleId,
      role: 'user', // Default to normal user
    });
  } else if (!user.googleId) {
    // Link googleId to existing email account
    user.googleId = googleId;
    await user.save();
  }

  return await formatLoginResponse(user);
};

const signupPhone = async (payload: IPhoneSignupPayload): Promise<ISignupResponse> => {
  const { name, phoneNumber, password } = payload;

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User with this phone number already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await User.create({
    name,
    phoneNumber,
    password: hashedPassword,
    role: 'user', // Default to normal user
  });

  return await formatLoginResponse(newUser);
};

const signupEmail = async (payload: IEmailSignupPayload): Promise<ISignupResponse> => {
  const { name, email, password } = payload;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user', // Default to normal user
  });

  return await formatLoginResponse(newUser);
}

const selectCompany = async (
  userId: string,
  companyId: string
): Promise<{ accessToken: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify the user is linked to the company
  const isLinked = user.companies?.some((c) => c.toString() === companyId);
  if (!isLinked && user.role !== 'super_admin') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to access this TurfCompany'
    );
  }

  // Issue company-scoped token
  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    companyId: companyId,
  };

  const accessToken = createToken(
    tokenPayload,
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    accessToken,
  };
};

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const hashOtp = (otp: string): string =>
  crypto.createHash('sha256').update(otp).digest('hex');

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!user.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is not set for this account');
  }
  if (!(await comparePassword(oldPassword, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
  }

  // pre-save hook hashes it
  user.password = newPassword;
  await user.save();
};

// Generates a 6-digit OTP. Always resolves the same way so callers can't probe
// which emails/phones are registered.
const forgotPassword = async (identifier: {
  email?: string;
  phoneNumber?: string;
}): Promise<void> => {
  const user = await User.findOne(identifier);
  if (!user) return;

  const otp = config.otp_static_code || crypto.randomInt(100000, 1000000).toString();
  user.resetOtpHash = hashOtp(otp);
  user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.resetOtpAttempts = 0;
  await user.save();

  // TODO: deliver via SMS / email provider. Until one is wired up, log in dev only.
  if (config.env !== 'production' && !config.otp_static_code) {
    console.log(`[forgot-password] OTP for ${identifier.email ?? identifier.phoneNumber}: ${otp}`);
  }
};

const resetPassword = async (
  identifier: { email?: string; phoneNumber?: string },
  otp: string,
  newPassword: string
): Promise<void> => {
  const invalid = new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');

  const user = await User.findOne(identifier).select(
    '+resetOtpHash +resetOtpExpires +resetOtpAttempts'
  );
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) throw invalid;

  const clear = () => {
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
  };

  if (user.resetOtpExpires.getTime() < Date.now() || (user.resetOtpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    clear();
    await user.save();
    throw invalid;
  }

  if (user.resetOtpHash !== hashOtp(otp)) {
    user.resetOtpAttempts = (user.resetOtpAttempts ?? 0) + 1;
    await user.save();
    throw invalid;
  }

  user.password = newPassword;
  clear();
  await user.save();
};

export const AuthService = {
  changePassword,
  forgotPassword,
  resetPassword,
  loginEmail,
  loginPhone,
  loginGoogle,
  selectCompany,
  signupPhone,
  signupEmail
};
