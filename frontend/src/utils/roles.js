export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  USER: 'User',
  STORE_OWNER: 'Store owner',
};

// Where each role lands after signing in.
export function homePathFor(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'STORE_OWNER') return '/owner';
  return '/stores';
}
