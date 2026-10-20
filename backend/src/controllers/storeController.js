import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { pageInfo } from '../utils/pagination.js';

const sortValue = (a, b, key, order) => {
  const direction = order === 'desc' ? -1 : 1;
  if (a[key] == null && b[key] == null) return 0;
  if (a[key] == null) return 1;
  if (b[key] == null) return -1;
  return (typeof a[key] === 'number' ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key]), undefined, { sensitivity: 'base' })) * direction;
};

function presentStore(store, userId) {
  const ratings = store.ratings || [];
  const scores = ratings.map((rating) => rating.score);
  return {
    id: store.id, name: store.name, email: store.email, address: store.address, ownerId: store.ownerId,
    category: store.category, city: store.city, state: store.state, postalCode: store.postalCode,
    phone: store.phone, website: store.website, description: store.description, openingHours: store.openingHours, isOpen: store.isOpen,
    ownerName: store.owner?.name, ownerEmail: store.owner?.email,
    averageRating: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null,
    ratingCount: scores.length,
    ...(userId ? { myRating: ratings.find((rating) => rating.userId === userId)?.score ?? null } : {}),
  };
}

const storeInclude = { owner: { select: { id: true, name: true, email: true } }, ratings: { select: { score: true, userId: true } } };

export async function listStores(req, res) {
  const { search, page, pageSize, sortBy: requestedSort, order } = req.validatedQuery;
  const searchableFields = req.user.role === 'ADMIN' ? ['name', 'email', 'address'] : ['name', 'address'];
  const where = search ? { OR: searchableFields.map((field) => ({ [field]: { contains: search, mode: 'insensitive' } })) } : {};
  const records = await prisma.store.findMany({ where, include: storeInclude });
  const rows = records.map((store) => presentStore(store, req.user.role === 'USER' ? req.user.id : undefined));
  const sortable = req.user.role === 'ADMIN' ? ['name', 'email', 'address', 'ownerName', 'averageRating'] : ['name', 'address', 'averageRating'];
  const sortBy = sortable.includes(requestedSort) ? requestedSort : 'name';
  rows.sort((a, b) => sortValue(a, b, sortBy, order));
  const stores = rows.slice((page - 1) * pageSize, page * pageSize);
  res.json({ stores, pagination: pageInfo(rows.length, page, pageSize) });
}

export async function getStore(req, res) {
  const storeId = Number(req.params.id);
  const { page, pageSize } = req.validatedQuery;
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new AppError('Store not found.', 404);
  const [aggregate, groupedRatings, ownRating, reviews, totalReviews] = await Promise.all([
    prisma.rating.aggregate({ where: { storeId }, _avg: { score: true }, _count: { _all: true } }),
    prisma.rating.groupBy({ by: ['score'], where: { storeId }, _count: { _all: true } }),
    req.user.role === 'USER'
      ? prisma.rating.findUnique({ where: { userId_storeId: { userId: req.user.id, storeId } }, select: { score: true, review: true } })
      : null,
    prisma.rating.findMany({
      where: { storeId },
      select: { id: true, score: true, review: true, createdAt: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.rating.count({ where: { storeId } }),
  ]);
  const ratingCounts = new Map(groupedRatings.map((item) => [item.score, item._count._all]));
  res.json({
    store: {
      ...store,
      averageRating: aggregate._avg.score == null ? null : Number(aggregate._avg.score.toFixed(1)),
      ratingCount: aggregate._count._all,
      ...(req.user.role === 'USER' ? { myRating: ownRating?.score ?? null, myReview: ownRating?.review ?? '' } : {}),
    },
    ratingDistribution: [1, 2, 3, 4, 5].map((score) => ({ score, count: ratingCounts.get(score) ?? 0 })),
    reviews: reviews.map((rating) => ({
      id: rating.id,
      score: rating.score,
      review: rating.review,
      createdAt: rating.createdAt,
      reviewerName: rating.user.name,
    })),
    pagination: pageInfo(totalReviews, page, pageSize),
  });
}

export async function createStore(req, res) {
  const owner = await prisma.user.findUnique({ where: { id: req.body.ownerId }, select: { id: true, role: true } });
  if (!owner || owner.role !== 'STORE_OWNER') throw new AppError('Choose a valid store owner.', 400, { ownerId: 'Choose a valid store owner' });
  const store = await prisma.store.create({ data: req.body });
  res.status(201).json({ store: presentStore({ ...store, ratings: [] }) });
}

export async function updateStore(req, res) {
  const data = { ...req.body };
  if (data.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: data.ownerId }, select: { role: true } });
    if (owner?.role !== 'STORE_OWNER') throw new AppError('Choose a valid store owner.', 400, { ownerId: 'Choose a valid store owner' });
  }
  const store = await prisma.store.update({ where: { id: Number(req.params.id) }, data, include: storeInclude });
  res.json({ store: presentStore(store) });
}

export async function deleteStore(req, res) {
  await prisma.store.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
}

export async function submitRating(req, res) {
  const storeId = Number(req.params.id);
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
  if (!store) throw new AppError('Store not found.', 404);
  const review = Object.hasOwn(req.body, 'review') ? req.body.review || null : undefined;
  await prisma.rating.upsert({
    where: { userId_storeId: { userId: req.user.id, storeId } },
    create: { userId: req.user.id, storeId, score: req.body.score, ...(review === undefined ? {} : { review }) },
    update: { score: req.body.score, ...(review === undefined ? {} : { review }) },
  });
  const result = await prisma.rating.aggregate({ where: { storeId }, _avg: { score: true }, _count: { _all: true } });
  res.json({ storeId, myRating: req.body.score, ...(review === undefined ? {} : { myReview: review ?? '' }), averageRating: result._avg.score == null ? null : Number(result._avg.score.toFixed(1)), ratingCount: result._count._all });
}
