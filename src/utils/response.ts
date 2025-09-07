import type { Response } from 'express';

export type ApiResponseEnvelope<T = any> = {
  success: boolean;
  status: number;
  code: string; // machine-readable
  message: string; // human readable
  data?: T;
  meta?: Record<string, any>;
  details?: any;
  errors?: Array<{ field?: string; code?: string; message?: string }>;
};

const envelope = <T>(
  success: boolean,
  status: number,
  code: string,
  message: string,
  data?: T,
  meta?: Record<string, any>,
  extra?: Partial<Pick<ApiResponseEnvelope, 'details' | 'errors'>>
): ApiResponseEnvelope<T> => ({ success, status, code, message, ...(data !== undefined ? { data } : {}), ...(meta ? { meta } : {}), ...(extra || {}) });

export const sendSuccess = <T>(res: Response, options: { status?: number; code: string; message: string; data?: T; meta?: Record<string, any> }) => {
  const s = options.status ?? 200;
  return res.status(s).json(envelope(true, s, options.code, options.message, options.data, options.meta));
};

export const sendCreated = <T>(res: Response, options: { code: string; message: string; data?: T; meta?: Record<string, any> }) => {
  return res.status(201).json(envelope(true, 201, options.code, options.message, options.data, options.meta));
};

export const sendError = (res: Response, options: { status: number; code: string; message: string; details?: any; errors?: Array<{ field?: string; code?: string; message?: string }> }) => {
  return res.status(options.status).json(envelope(false, options.status, options.code, options.message, undefined, undefined, { details: options.details, errors: options.errors }));
};

