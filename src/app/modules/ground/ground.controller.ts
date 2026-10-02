import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { GroundService } from './ground.service';
import { IGround } from './ground.interface';
import ApiError from '../../errors/ApiError';

const createGround = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { ...groundData } = req.body;

  // Enforce company scoping for turf owners
  if (user.role === 'turf_owner') {
    if (!user.companyId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Please select an active company first'
      );
    }
    groundData.companyId = user.companyId;
  }

  const result = await GroundService.createGround(groundData);

  sendResponse<IGround>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Ground created successfully',
    data: result,
  });
});

const getAllGrounds = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const filters: { companyId?: string } = {};

  // If owner or maintainer, only return grounds for their selected company
  if (user && (user.role === 'turf_owner' || user.role === 'maintainer')) {
    if (user.companyId) {
      filters.companyId = user.companyId;
    }
  } else if (req.query.companyId) {
    filters.companyId = req.query.companyId as string;
  }

  const result = await GroundService.getAllGrounds(filters);

  sendResponse<IGround[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Grounds retrieved successfully',
    data: result,
  });
});

const searchGrounds = catchAsync(async (req: Request, res: Response) => {
  const { date, sport, startTime, endTime, companyId } = req.query as Record<
    string,
    string | undefined
  >;

  const result = await GroundService.searchGrounds({
    date: date as string,
    sport,
    startTime,
    endTime,
    companyId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Available grounds retrieved successfully',
    data: result,
  });
});

const getSingleGround = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GroundService.getSingleGround(id);

  sendResponse<IGround>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ground retrieved successfully',
    data: result,
  });
});

const updateGround = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { id } = req.params;
  const { ...groundData } = req.body;

  // Verify ownership/scoping
  const ground = await GroundService.getSingleGround(id);
  if (!ground) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }

  if (user.role !== 'super_admin') {
    if (!user.companyId || ground.companyId.toString() !== user.companyId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Forbidden: You do not have permission to modify this ground'
      );
    }
  }

  const result = await GroundService.updateGround(id, groundData);

  sendResponse<IGround>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ground updated successfully',
    data: result,
  });
});

const deleteGround = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { id } = req.params;

  // Verify ownership/scoping
  const ground = await GroundService.getSingleGround(id);
  if (!ground) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found');
  }

  if (user.role !== 'super_admin') {
    if (!user.companyId || ground.companyId.toString() !== user.companyId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Forbidden: You do not have permission to delete this ground'
      );
    }
  }

  const result = await GroundService.deleteGround(id);

  sendResponse<IGround>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ground deleted successfully',
    data: result,
  });
});

export const GroundController = {
  createGround,
  getAllGrounds,
  searchGrounds,
  getSingleGround,
  updateGround,
  deleteGround,
};
