import { prisma } from '../lib/prisma.js';
import { pageInfo } from '../utils/pagination.js';

export async function summary(req, res) {
  const stores = await prisma.store.findMany({
    where: { ownerId: req.user.id },
    include: { ratings: { select: { score: true } } },
    orderBy: { name: 'asc' },
  });
  const output = stores.map((store) => {
    const scores = store.ratings.map((rating) => rating.score);
    return { id: store.id, name: store.name, email: store.email, address: store.address,
      averageRating: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null,
      ratingCount: scores.length };
  });
  const ratings = stores.flatMap((store) => store.ratings.map((rating) => rating.score));
  res.json({ stores: output, overall: { averageRating: ratings.length ? Number((ratings.reduce((sum, score) => sum + score, 0) / ratings.length).toFixed(1)) : null, ratingCount: ratings.length } });
}

export async function ratings(req, res) {
  const { page, pageSize, storeId, sortBy: requestedSort, order } = req.validatedQuery;
  const where = { store: { ownerId: req.user.id }, ...(storeId ? { storeId } : {}) };
  const sortMap = { date: 'updatedAt', updatedAt: 'updatedAt', value: 'score', score: 'score', userName: 'user', storeName: 'store' };
  const sortBy = sortMap[requestedSort] || 'updatedAt';
  const orderBy = sortBy === 'user' ? { user: { name: order } } : sortBy === 'store' ? { store: { name: order } } : { [sortBy]: order };
  const [rows, total] = await Promise.all([
    prisma.rating.findMany({ where, include: { user: { select: { id: true, name: true, email: true } }, store: { select: { id: true, name: true } } }, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.rating.count({ where }),
  ]);
  res.json({ ratings: rows.map((rating) => ({ id: rating.id, value: rating.score, updatedAt: rating.updatedAt, user: rating.user, store: rating.store, userName: rating.user.name, storeName: rating.store.name, date: rating.updatedAt })), pagination: pageInfo(total, page, pageSize) });
}
