import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth('super_admin', 'turf_owner', 'maintainer', 'user'),
  validateRequest(BookingValidation.createBookingZodSchema),
  BookingController.createBooking
);

router.get(
  '/',
  auth('super_admin', 'turf_owner', 'maintainer', 'user'),
  BookingController.getAllBookings
);

router.get(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer', 'user'),
  BookingController.getSingleBooking
);

router.patch(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer'),
  validateRequest(BookingValidation.updateBookingZodSchema),
  BookingController.updateBooking
);

export const BookingRoutes = router;
