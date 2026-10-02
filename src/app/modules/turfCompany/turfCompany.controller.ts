import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { TurfCompanyService } from './turfCompany.service';
import { ITurfCompany } from './turfCompany.interface';
import ApiError from '../../errors/ApiError';
import { TurfCompany } from './turfCompany.model';

// Admin: always. Owner: only their own company. Maintainer: linked companies (read only).
const assertCompanyAccess = async (
  req: Request,
  companyId: string,
  { ownerOnly }: { ownerOnly: boolean }
) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }
  if (user.role === 'super_admin') return;

  const company = await TurfCompany.findById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Turf Company not found');
  }

  const isOwner = company.ownerId.toString() === user.userId;
  const isLinked =
    isOwner ||
    (!ownerOnly &&
      (await TurfCompanyService.isLinkedToCompany(user.userId, companyId)));

  if (!isLinked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Forbidden: You do not have access to this company'
    );
  }
};

const createTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { ...companyData } = req.body;

  // Owners can only create companies for themselves
  if (req.user!.role === 'turf_owner') {
    companyData.ownerId = req.user!.userId;
  }

  const result = await TurfCompanyService.createTurfCompany(companyData);

  sendResponse<ITurfCompany>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Turf Company created successfully',
    data: result,
  });
});

const getAllTurfCompanies = catchAsync(async (req: Request, res: Response) => {
  const result =
    req.user!.role === 'super_admin'
      ? await TurfCompanyService.getAllTurfCompanies()
      : await TurfCompanyService.getMyTurfCompanies(req.user!.userId);

  sendResponse<ITurfCompany[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Turf Companies retrieved successfully',
    data: result,
  });
});

const getSingleTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertCompanyAccess(req, id as string, { ownerOnly: false });
  const result = await TurfCompanyService.getSingleTurfCompany(id as string);

  sendResponse<ITurfCompany>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Turf Company retrieved successfully',
    data: result,
  });
});

const updateTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertCompanyAccess(req, id as string, { ownerOnly: true });
  const { ...companyData } = req.body;

  // Ownership transfer is admin-only
  if (req.user!.role !== 'super_admin') {
    delete companyData.ownerId;
  }
  const result = await TurfCompanyService.updateTurfCompany(id as string, companyData);

  sendResponse<ITurfCompany>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Turf Company updated successfully',
    data: result,
  });
});

const deleteTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await assertCompanyAccess(req, id as string, { ownerOnly: true });
  const result = await TurfCompanyService.deleteTurfCompany(id as string);

  sendResponse<ITurfCompany>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Turf Company deleted successfully',
    data: result,
  });
});

export const TurfCompanyController = {
  createTurfCompany,
  getAllTurfCompanies,
  getSingleTurfCompany,
  updateTurfCompany,
  deleteTurfCompany,
};
