import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { TurfCompanyController } from './turfCompany.controller';
import { TurfCompanyValidation } from './turfCompany.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(TurfCompanyValidation.createTurfCompanyZodSchema),
  TurfCompanyController.createTurfCompany
);

router.get('/:id', TurfCompanyController.getSingleTurfCompany);

router.patch(
  '/:id',
  validateRequest(TurfCompanyValidation.updateTurfCompanyZodSchema),
  TurfCompanyController.updateTurfCompany
);

router.delete('/:id', TurfCompanyController.deleteTurfCompany);

router.get('/', TurfCompanyController.getAllTurfCompanies);

export const TurfCompanyRoutes = router;
