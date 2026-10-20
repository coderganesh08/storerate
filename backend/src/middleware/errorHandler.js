import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    const errors = Object.fromEntries(error.issues.map((issue) => [issue.path[0] || 'form', issue.message]));
    return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
  }
  if (error instanceof AppError) return res.status(error.status).json({ message: error.message, errors: error.errors });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({ message: 'A record with that email already exists.', errors: { email: 'This email is already registered' } });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
    return res.status(409).json({ message: 'This record is still in use.' });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ message: 'The requested record was not found.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
