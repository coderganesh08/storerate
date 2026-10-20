import { z } from 'zod';

const name = z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters');
const email = z.string().trim().email('Enter a valid email address').max(254, 'Email is too long').transform((value) => value.toLowerCase());
const address = z.string().trim().min(1, 'Address is required').max(400, 'Address must be at most 400 characters');
const optionalText = (max, label) => z.string().trim().max(max, `${label} must be at most ${max} characters`).optional().transform((value) => value === undefined ? undefined : value || null);
const optionalWebsite = z.string().trim().max(2048, 'Website must be at most 2048 characters')
  .refine((value) => !value || z.string().url().safeParse(value).success, 'Enter a valid website URL')
  .optional().transform((value) => value === undefined ? undefined : value || null);
const storeDetails = {
  category: optionalText(80, 'Category'),
  city: optionalText(100, 'City'),
  state: optionalText(100, 'State'),
  postalCode: optionalText(20, 'PIN code'),
  phone: optionalText(32, 'Phone'),
  website: optionalWebsite,
  description: optionalText(2000, 'Description'),
  openingHours: optionalText(1000, 'Opening hours'),
  isOpen: z.union([z.boolean(), z.enum(['true', 'false']).transform((value) => value === 'true'), z.literal('').transform(() => null)]).nullable().optional(),
};
const password = z.string().min(8, 'Password must be at least 8 characters').max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^A-Za-z0-9\s]/, 'Password must contain at least one special character');

export const registerSchema = z.object({ name, email, address, password });
export const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: password });
export const userCreateSchema = z.object({ name, email, address, password, role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']) });
export const userUpdateSchema = z.object({ name: name.optional(), email: email.optional(), address: address.optional(), password: password.optional(), role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).optional() }).refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');
export const storeCreateSchema = z.object({ name, email, address, ...storeDetails, ownerId: z.coerce.number().int().positive() });
export const storeUpdateSchema = z.object({ name: name.optional(), email: email.optional(), address: address.optional(), ...storeDetails, ownerId: z.coerce.number().int().positive().optional() }).refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update');
export const ratingSchema = z.object({ score: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'), review: optionalText(1000, 'Review') });
export const idSchema = z.object({ id: z.coerce.number().int().positive() });
export const storeIdSchema = z.object({ id: z.coerce.number().int().positive() });
export const listQuerySchema = z.object({
  search: z.string().trim().max(200).optional().default(''),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']).optional(),
  sortBy: z.string().optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  storeId: z.coerce.number().int().positive().optional(),
});
