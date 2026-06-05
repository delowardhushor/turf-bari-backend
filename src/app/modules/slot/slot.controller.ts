import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { SlotService } from './slot.service';
import { ISlot } from './slot.interface';
import { Slot } from './slot.model';
import { Ground } from '../ground/ground.model';
import ApiError from '../../errors/ApiError';

const getSlotsForDate = catchAsync(async (req: Request, res: Response) => {
  const { groundId, date } = req.query;

  if (!groundId || !date) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Both "groundId" and "date" query parameters are required'
    );
  }

  const result = await SlotService.getSlotsForDate(
    groundId as string,
    date as string
  );

  sendResponse<ISlot[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slots retrieved successfully',
    data: result,
  });
});

const updateSlot = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const { id } = req.params;
  const { ...updateData } = req.body;

  // Retrieve slot
  const slot = await Slot.findById(id);
  if (!slot) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  // Retrieve ground to verify company scope
  const ground = await Ground.findById(slot.groundId);
  if (!ground) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ground not found for this slot');
  }

  // Enforce company scoping
  if (user.role !== 'super_admin') {
    if (!user.companyId || ground.companyId.toString() !== user.companyId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Forbidden: You do not have permission to modify this slot'
      );
    }
  }

  const result = await SlotService.updateSlot(id, updateData);

  sendResponse<ISlot>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Slot updated successfully',
    data: result,
  });
});

export const SlotController = {
  getSlotsForDate,
  updateSlot,
};
