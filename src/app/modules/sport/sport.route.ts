import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SportController } from './sport.controller';
import { SportValidation } from './sport.validation';

const router = express.Router();

// Public list for the customer site and the owner's ground form
router.get('/', SportController.getActiveSports);

// Must be declared before '/:id'
router.get('/all', auth('super_admin'), SportController.getAllSports);

router.post(
  '/',
  auth('super_admin'),
  validateRequest(SportValidation.createSportZodSchema),
  SportController.createSport
);

router.patch(
  '/:id',
  auth('super_admin'),
  validateRequest(SportValidation.updateSportZodSchema),
  SportController.updateSport
);

router.delete('/:id', auth('super_admin'), SportController.deleteSport);

export const SportRoutes = router;
