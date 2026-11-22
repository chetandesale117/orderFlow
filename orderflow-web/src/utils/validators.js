import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']),
  streetLine1: z.string().min(1, 'Street line 1 is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  compareAtPrice: z.coerce.number().optional().nullable(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  imageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  brand: z.string().optional(),
  weight: z.coerce.number().optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const inventoryUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

export const refundSchema = z.object({
  amount: z.coerce.number().positive('Refund amount must be greater than zero'),
  reason: z.string().min(1, 'Reason is required'),
});
