import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { AuthService } from './auth.service';
import { ILoginResponse } from './auth.interface';

const loginEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginEmail(loginData);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const loginPhone = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginPhone(loginData);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const loginGoogle = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginGoogle(loginData);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const signupPhone = catchAsync(async (req: Request, res: Response) => {
  const { ...signupData } = req.body;
  const result = await AuthService.signupPhone(signupData);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Signed up successfully',
    data: result,
  });
});

const signupEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...signupData } = req.body;
  const result = await AuthService.signupEmail(signupData);

  sendResponse<ILoginResponse>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Signed up successfully',
    data: result,
  });
});

const selectCompany = catchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.body;
  const userId = (req as any).user?.userId; // Populated by Auth security middleware

  const result = await AuthService.selectCompany(userId, companyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active company selected successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  await AuthService.changePassword(req.user!.userId, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  await AuthService.forgotPassword({ email, phoneNumber }, req.ip);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'If an account exists, an OTP has been sent',
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, phoneNumber, otp, newPassword } = req.body;
  await AuthService.resetPassword({ email, phoneNumber }, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: null,
  });
});

export const AuthController = {
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
