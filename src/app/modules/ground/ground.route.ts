import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { GroundController } from './ground.controller';
import { GroundValidation } from './ground.validation';
import auth from '../../middlewares/auth';
import jwt from 'jsonwebtoken';
import config from '../../config';

// Mini-middleware to parse user optionally without failing on guest requests
const parseUserOptional = (req: any, _res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        companyId: decoded.companyId || null,
      };
    } catch (err) {
      // Ignore token verification errors to treat as guest
    }
  }
  next();
};

const router = express.Router();

router.post(
  '/',
  auth('super_admin', 'turf_owner'),
  validateRequest(GroundValidation.createGroundZodSchema),
  GroundController.createGround
);

router.get('/:id', GroundController.getSingleGround);

router.patch(
  '/:id',
  auth('super_admin', 'turf_owner', 'maintainer'),
  validateRequest(GroundValidation.updateGroundZodSchema),
  GroundController.updateGround
);

router.delete(
  '/:id',
  auth('super_admin', 'turf_owner'),
  GroundController.deleteGround
);

router.get('/', parseUserOptional, GroundController.getAllGrounds);

export const GroundRoutes = router;
