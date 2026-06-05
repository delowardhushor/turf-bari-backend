import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { BookingService } from './booking.service';
import { IBooking } from './booking.interface';
import ApiError from '../../errors/ApiError';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { slotId } = req.body;
  const result = await BookingService.createBooking(user.userId, slotId);

  sendResponse<IBooking>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const filters: { userId?: string; companyId?: string } = {};

  if (user.role === 'user') {
    filters.userId = user.userId;
  } else if (user.role === 'turf_owner' || user.role === 'maintainer') {
    if (!user.companyId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Please select an active company first'
      );
    }
    filters.companyId = user.companyId;
  } else if (user.role === 'super_admin' && req.query.companyId) {
    filters.companyId = req.query.companyId as string;
  }

  const result = await BookingService.getAllBookings(filters);

  sendResponse<IBooking[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { id } = req.params;
  const result = await BookingService.getSingleBooking(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  // Authorization checks
  if (user.role === 'user' && result.userId._id.toString() !== user.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Forbidden: You do not have permission to view this booking'
    );
  }

  if (
    (user.role === 'turf_owner' || user.role === 'maintainer') &&
    (!user.companyId || result.companyId._id.toString() !== user.companyId)
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Forbidden: You do not have permission to view this booking'
    );
  }

  sendResponse<IBooking>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { id } = req.params;
  const { ...updateData } = req.body;

  // Retrieve booking first to verify company scope
  const booking = await BookingService.getSingleBooking(id);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  // Enforce company scoping
  if (user.role !== 'super_admin') {
    if (
      !user.companyId ||
      booking.companyId._id.toString() !== user.companyId
    ) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Forbidden: You do not have permission to update this booking'
      );
    }
  }

  const result = await BookingService.updateBooking(id, updateData);

  sendResponse<IBooking>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking updated successfully',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
};
