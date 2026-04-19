import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Error]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: isProd ? 'Internal server error.' : err.message,
  });
}
