import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import config from './app/config';

const app: Application = express();

// Behind a proxy/load balancer, trust it so req.ip (used by OTP rate limits) is the real client
if (config.trust_proxy > 0) app.set('trust proxy', config.trust_proxy);

// Parser Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded images (ground photos)
app.use('/uploads', express.static(config.upload_dir, { maxAge: '7d', immutable: true }));

// Application Routes
app.use('/api/v1', router);

// Health Check Route
app.get('/', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Welcome to TurfBari API Server!',
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Handle Not Found Route
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API route not found',
      },
    ],
  });
});

export default app;
