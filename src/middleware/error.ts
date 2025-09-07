import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendError } from '../utils/response';

export const notFound = (_req: Request, res: Response) => {
  return sendError(res, { status: 404, code: 'not_found', message: 'Not Found' });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let status = err.status || 500;
  let code = err.code || 'internal_error';
  let message = err.message || 'Internal Server Error';
  let details = err.details;
  let errors = err.errors;

  // Map common Mongoose / Mongo errors
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = 'validation_error';
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e: any) => ({ field: e.path, code: e.kind || 'invalid', message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'invalid_id';
    message = `Invalid id for field ${err.path}`;
  } else if (err && err.code === 11000) {
    // MongoServerError duplicate key
    status = 409;
    code = 'duplicate_key';
    message = 'Duplicate key error';
    details = { keyPattern: err.keyPattern, keyValue: err.keyValue };
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return sendError(res, { status, code, message, details, errors });
};
