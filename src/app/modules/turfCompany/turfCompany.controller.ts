import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import httpStatus from 'http-status';
import { TurfCompanyService } from './turfCompany.service';
import { ITurfCompany } from './turfCompany.interface';

const createTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { ...companyData } = req.body;
  const result = await TurfCompanyService.createTurfCompany(companyData);

  sendResponse<ITurfCompany>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Turf Company created successfully',
    data: result,
  });
});

const getAllTurfCompanies = catchAsync(async (_req: Request, res: Response) => {
  const result = await TurfCompanyService.getAllTurfCompanies();

  sendResponse<ITurfCompany[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Turf Companies retrieved successfully',
    data: result,
  });
});

const getSingleTurfCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
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
  const { ...companyData } = req.body;
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
