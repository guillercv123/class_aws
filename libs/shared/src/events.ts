/**
 * Contratos de eventos del sistema OrderFlow.
 *
 * Convenciones:
 *   - Nombre en pasado: `product.created`, no `create.product`.
 *   - Versión explícita en el sufijo: `.v1`.
 *   - Todo evento lleva tenantId para el aislamiento multi-tenant.
 */

/** Sobre común de todos los eventos publicados en el bus. */
export interface EventEnvelope<T> {
    eventId: string;
    eventVersion: string;
    tenantId: string;
    occurredAt: string;
    detail: T;
}

export const EVENT_SOURCES = {
    catalog: 'orderflow.catalog',
    orders: 'orderflow.orders',
    inventory: 'orderflow.inventory',
    payments: 'orderflow.payments',
} as const;

export const EVENT_TYPES = {
    productCreated: 'product.created.v1',
    orderCreated: 'order.created.v1',
    inventoryReserved: 'inventory.reserved.v1',
    paymentSucceeded: 'payment.succeeded.v1',
} as const;

// ---- Payloads (detail) por tipo de evento ----

export interface ProductCreatedDetail {
    productId: string;
    categoryId: string;
    initialStock: number;
}

export interface OrderCreatedDetail {
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
    amount: number;
}

export interface InventoryReservedDetail {
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
}

