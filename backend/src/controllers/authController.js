import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

const publicUser = ({ id, name, email, address, role, createdAt }) => ({ id, name, email, address, role, createdAt });
const issueToken = (user) => jwt.sign({}, env.JWT_SECRET, { subject: String(user.id), expiresIn: '7d' });

export async function register(req, res) {
  const { name, email, address, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('This email is already registered.', 409, { email: 'This email is already registered' });
  const user = await prisma.user.create({ data: { name, email, address, passwordHash: await bcrypt.hash(password, 12), role: 'USER' } });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Email or password is incorrect.', 401);
  res.json({ token: issueToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function changePassword(req, res) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw new AppError('Current password is incorrect.', 400, { currentPassword: 'Current password is incorrect' });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(req.body.newPassword, 12) } });
  res.json({ message: 'Password updated.' });
}
