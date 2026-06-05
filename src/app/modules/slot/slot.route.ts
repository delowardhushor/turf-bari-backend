import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SlotController } from './slot.controller';
import { SlotValidation } from './slot.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/', SlotController.getSlotsForDate);

router.patch(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer'),
  validateRequest(SlotValidation.updateSlotZodSchema),
  SlotController.updateSlot
);

export const SlotRoutes = router;
