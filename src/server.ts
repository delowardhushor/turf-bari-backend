import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { Server } from 'http';

let server: Server;

// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception detected, shutting down immediately...', error);
  process.exit(1);
});

async function bootstrap() {
  try {
    await mongoose.connect(config.database_url);
    console.log(`=== Database Connected Successfully ===`);

    server = app.listen(config.port, () => {
      console.log(`=== TurfBari Application is running on port ${config.port} ===`);
    });
  } catch (err) {
    console.error('Failed to connect database', err);
  }

  // Handle unhandled rejections inside bootstrap
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection detected, shutting down server...', error);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

bootstrap();

// Handle SIGTERM signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server gracefully...');
  if (server) {
    server.close();
  }
});
