import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';

// Extend Express Request to carry decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        companyId: string | null;
      };
    }
  }
}

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const token = authHeader.split(' ')[1];

      // Verify JWT
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      req.user = {
        userId: decoded.userId as string,
        role: decoded.role as string,
        companyId: (decoded.companyId as string) || null,
      };

      // Check role authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(req.user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
