import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { TurfCompanyController } from './turfCompany.controller';
import { TurfCompanyValidation } from './turfCompany.validation';

const router = express.Router();

router.post(
  '/',
  auth('super_admin', 'turf_owner'),
  validateRequest(TurfCompanyValidation.createTurfCompanyZodSchema),
  TurfCompanyController.createTurfCompany
);

// Admin sees all; owners/maintainers see only their own companies
router.get(
  '/',
  auth('super_admin', 'turf_owner', 'maintainer'),
  TurfCompanyController.getAllTurfCompanies
);

router.get(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer'),
  TurfCompanyController.getSingleTurfCompany
);

router.patch(
  '/:id',
  auth('super_admin', 'turf_owner'),
  validateRequest(TurfCompanyValidation.updateTurfCompanyZodSchema),
  TurfCompanyController.updateTurfCompany
);

router.delete(
  '/:id',
  auth('super_admin', 'turf_owner'),
  TurfCompanyController.deleteTurfCompany
);

export const TurfCompanyRoutes = router;
