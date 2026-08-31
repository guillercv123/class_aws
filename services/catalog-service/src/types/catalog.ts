import type { CreateProductInput } from '../lib/schemas';

export interface Product extends CreateProductInput {
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductView {
  productId: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  status: 'active' | 'inactive';
  updatedAt: string;
}

/** Contexto que inyecta el Lambda Authorizer del identity-service (sesión 1). */
export interface AuthContext {
  tenantId: string;
  userId: string;
  roles: string;
  permissions: string;
}
