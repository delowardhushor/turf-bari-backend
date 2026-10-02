import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { ISport } from './sport.interface';
import { SportService } from './sport.service';

const createSport = catchAsync(async (req: Request, res: Response) => {
  const result = await SportService.createSport(req.body);

  sendResponse<ISport>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Sport created successfully',
    data: result,
  });
});

// Public: only sports that can currently be offered
const getActiveSports = catchAsync(async (_req: Request, res: Response) => {
  const result = await SportService.getSports({ includeInactive: false });

  sendResponse<ISport[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sports retrieved successfully',
    data: result,
  });
});

// Admin: includes deactivated sports
const getAllSports = catchAsync(async (_req: Request, res: Response) => {
  const result = await SportService.getSports({ includeInactive: true });

  sendResponse<ISport[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sports retrieved successfully',
    data: result,
  });
});

const updateSport = catchAsync(async (req: Request, res: Response) => {
  const result = await SportService.updateSport(req.params.id as string, req.body);

  sendResponse<ISport>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sport updated successfully',
    data: result,
  });
});

const deleteSport = catchAsync(async (req: Request, res: Response) => {
  const result = await SportService.deleteSport(req.params.id as string);

  sendResponse<ISport>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sport deleted successfully',
    data: result,
  });
});

export const SportController = {
  createSport,
  getActiveSports,
  getAllSports,
  updateSport,
  deleteSport,
};
