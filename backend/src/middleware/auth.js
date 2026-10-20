import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) throw new AppError('Please sign in to continue.', 401);
    let payload;
    try { payload = jwt.verify(token, env.JWT_SECRET); } catch { throw new AppError('Your session has expired. Please sign in again.', 401); }
    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) }, select: { id: true, name: true, email: true, address: true, role: true } });
    if (!user) throw new AppError('Your account is no longer available.', 401);
    req.user = user;
    next();
  } catch (error) { next(error); }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('You do not have access to this action.', 403));
  next();
};
