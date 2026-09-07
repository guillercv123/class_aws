/** Item de una orden. */
export interface OrderItem {
  productId: string;
  quantity: number;
}

/** Input que fluye a través de la Saga (se enriquece en cada paso). */
export interface SagaInput {
  tenantId: string;
  orderId: string;
  items: OrderItem[];
  amount: number;
}

/** Contexto que inyecta el Lambda Authorizer (sesión 1). */
export interface AuthContext {
  tenantId: string;
  userId: string;
  roles: string;
  permissions: string;
}
