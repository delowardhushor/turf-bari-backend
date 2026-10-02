import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// Admin-only: create any kind of user (e.g. a turf owner or maintainer).
// Public self-registration goes through /auth/signup/*.
router.post(
  '/',
  auth('super_admin'),
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

router.get('/', auth('super_admin'), UserController.getAllUsers);

// Admin or the user themselves (checked in the controller)
router.get(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer', 'user'),
  UserController.getSingleUser
);

router.patch(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer', 'user'),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

router.delete('/:id', auth('super_admin'), UserController.deleteUser);

export const UserRoutes = router;
