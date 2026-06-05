import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { TurfCompanyRoutes } from '../modules/turfCompany/turfCompany.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { GroundRoutes } from '../modules/ground/ground.route';
import { SlotRoutes } from '../modules/slot/slot.route';
import { BookingRoutes } from '../modules/booking/booking.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/turf-companies',
    route: TurfCompanyRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/grounds',
    route: GroundRoutes,
  },
  {
    path: '/slots',
    route: SlotRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
