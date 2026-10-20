import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { pageInfo } from '../utils/pagination.js';

const safeUser = ({ passwordHash, ...user }) => user;
const validSort = (requested, allowed, fallback = allowed[0]) => allowed.includes(requested) ? requested : fallback;

export async function stats(req, res) {
  const [users, stores, ratings, byRole, distribution] = await Promise.all([
    prisma.user.count(), prisma.store.count(), prisma.rating.count(),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.rating.groupBy({ by: ['score'], _count: { _all: true }, orderBy: { score: 'asc' } }),
  ]);
  const usersByRole = { ADMIN: 0, USER: 0, STORE_OWNER: 0 };
  byRole.forEach((entry) => { usersByRole[entry.role] = entry._count._all; });
  res.json({ users, stores, ratings, usersByRole, distribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: distribution.find((entry) => entry.score === score)?._count._all || 0 })) });
}

export async function listUsers(req, res) {
  const { search, role, page, pageSize, sortBy: requestedSort, order } = req.validatedQuery;
  const where = {
    ...(role ? { role } : {}),
    ...(search ? { OR: ['name', 'email', 'address'].map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {}),
  };
  const [records, total] = await Promise.all([
    prisma.user.findMany({ where, include: { ownedStores: { include: { ratings: { select: { score: true } } } } } }),
    prisma.user.count({ where }),
  ]);
  const rows = records.map((record) => {
    const { ownedStores, ...user } = safeUser(record);
    const scores = ownedStores.flatMap((store) => store.ratings.map((rating) => rating.score));
    return { ...user, rating: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null };
  });
  const sortBy = validSort(requestedSort, ['name', 'email', 'address', 'role', 'rating']);
  const direction = order === 'desc' ? -1 : 1;
  rows.sort((a, b) => (a[sortBy] == null ? 1 : b[sortBy] == null ? -1 : typeof a[sortBy] === 'number' ? (a[sortBy] - b[sortBy]) * direction : String(a[sortBy]).localeCompare(String(b[sortBy])) * direction));
  res.json({ users: rows.slice((page - 1) * pageSize, page * pageSize), pagination: pageInfo(total, page, pageSize) });
}

export async function getUser(req, res) {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!user) throw new AppError('User not found.', 404);
  res.json({ user: safeUser(user) });
}

export async function createUser(req, res) {
  const { name, email, address, password, role } = req.body;
  const user = await prisma.user.create({ data: { name, email, address, passwordHash: await bcrypt.hash(password, 12), role } });
  res.status(201).json({ user: safeUser(user) });
}

export async function updateUser(req, res) {
  const id = Number(req.params.id);
  const { password, ...data } = req.body;
  if (id === req.user.id && data.role && data.role !== 'ADMIN') throw new AppError('You cannot change your own administrator role.', 400);
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({ where: { id }, data });
  res.json({ user: safeUser(user) });
}

export async function deleteUser(req, res) {
  const id = Number(req.params.id);
  if (id === req.user.id) throw new AppError('You cannot delete your own account.', 400);
  const ownedStoreCount = await prisma.store.count({ where: { ownerId: id } });
  if (ownedStoreCount) throw new AppError('Delete or reassign this owner’s stores before deleting the account.', 409);
  await prisma.user.delete({ where: { id } });
  res.status(204).end();
}
