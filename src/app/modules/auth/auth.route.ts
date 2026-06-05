import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

// Email Login
router.post(
  '/login/email',
  validateRequest(AuthValidation.emailLoginZodSchema),
  AuthController.loginEmail
);

// Phone Login
router.post(
  '/login/phone',
  validateRequest(AuthValidation.phoneLoginZodSchema),
  AuthController.loginPhone
);

// Google Social Login
router.post(
  '/login/google',
  validateRequest(AuthValidation.googleLoginZodSchema),
  AuthController.loginGoogle
);

// Select Active Company (after login)
router.post(
  '/select-company',
  auth('turf_owner', 'maintainer', 'super_admin'),
  validateRequest(AuthValidation.selectCompanyZodSchema),
  AuthController.selectCompany
);

export const AuthRoutes = router;
