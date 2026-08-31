import { z } from 'zod';

/**
 * Schemas de validación de entrada (zod).
 *
 * `.strict()` rechaza cualquier campo no declarado — primera línea de defensa
 * contra OWASP API3 (Broken Object Property Level Authorization) y contra el
 * envío de campos como `tenantId` o `productId` desde el cliente.
 */
export const createProductSchema = z
  .object({
    name: z.string().min(1).max(120),
    price: z.number().positive().max(1_000_000),
    categoryId: z.string().min(1).max(64),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createCategorySchema = z
  .object({
    name: z.string().min(1).max(80),
    description: z.string().max(500).optional(),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
