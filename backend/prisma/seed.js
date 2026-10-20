import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { prisma } from '../src/lib/prisma.js';

const name = process.env.SEED_ADMIN_NAME || 'Platform Administrator';
const email = (process.env.SEED_ADMIN_EMAIL || 'admin@storerating.local').trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

if (name.trim().length < 2 || name.trim().length > 60) throw new Error('SEED_ADMIN_NAME must be between 2 and 60 characters.');
if (password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) throw new Error('SEED_ADMIN_PASSWORD must be 8–16 characters and include an uppercase letter and a special character.');

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name: name.trim(), passwordHash, role: 'ADMIN' },
    create: { name: name.trim(), email, address: 'Platform administration', passwordHash, role: 'ADMIN' },
  });
  console.log(`Administrator ready: ${email}`);
} finally {
  await prisma.$disconnect();
}
