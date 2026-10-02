import crypto from 'crypto';
import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import httpStatus from 'http-status';
import multer from 'multer';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { MAX_GROUND_IMAGES } from './ground.interface';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// The extension comes from the verified mimetype, never from the client's filename
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const GROUND_DIR = path.join(config.upload_dir, 'grounds');
export const GROUND_URL_PREFIX = '/uploads/grounds/';

fs.mkdirSync(GROUND_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: GROUND_DIR,
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}.${EXTENSIONS[file.mimetype]}`),
});

const parseGroundImages = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_GROUND_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only JPEG, PNG or WebP images are allowed'));
  },
}).array('images', MAX_GROUND_IMAGES);

const MULTER_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: `Each image must be ${MAX_IMAGE_BYTES / 1024 / 1024} MB or smaller`,
  LIMIT_FILE_COUNT: `You can upload at most ${MAX_GROUND_IMAGES} images at once`,
  LIMIT_UNEXPECTED_FILE: 'Upload images using the "images" field',
};

export const uploadGroundImages: RequestHandler = (req, res, next) =>
  parseGroundImages(req, res, (err?: unknown) => {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(httpStatus.BAD_REQUEST, MULTER_MESSAGES[err.code] ?? err.message));
    }
    next(err);
  });

export const toImagePath = (file: Express.Multer.File) => GROUND_URL_PREFIX + file.filename;

// Removes stored files for the given image paths. Best effort: a file that is already gone is fine.
export const deleteImageFiles = async (imagePaths: string[]) => {
  await Promise.all(
    imagePaths
      .filter((p) => p.startsWith(GROUND_URL_PREFIX))
      .map((p) => fs.promises.unlink(path.join(GROUND_DIR, path.basename(p))).catch(() => undefined))
  );
};
