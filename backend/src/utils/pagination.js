export function pagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function pageInfo(total, page, pageSize) {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
