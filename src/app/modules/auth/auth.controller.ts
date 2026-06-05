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

export const AuthController = {
  loginEmail,
  loginPhone,
  loginGoogle,
  selectCompany,
};
