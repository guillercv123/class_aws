/**
 * Construcción centralizada de claves DynamoDB (single-table design).
 *
 * TODA la lógica de PK/SK vive aquí. Ni los handlers ni el repository
 * deben construir claves a mano: si el modelo de datos cambia, este es
 * el único archivo que se toca.
 *
 * Modelo:
 *   Category:   PK = TENANT#<t>#CATALOG   SK = CATEGORY#<categoryId>
 *   Product:    PK = TENANT#<t>#CATALOG   SK = PRODUCT#<productId>
 *               GSI1PK = TENANT#<t>#CATEGORY#<categoryId>   GSI1SK = PRODUCT#<productId>
 *   ProductView (proyección CQRS):
 *               PK = TENANT#<t>#CATALOG   SK = VIEW#PRODUCT#<productId>
 */
export const keys = {
  catalogPk: (tenantId: string): string => `TENANT#${tenantId}#CATALOG`,
  productSk: (productId: string): string => `PRODUCT#${productId}`,
  categorySk: (categoryId: string): string => `CATEGORY#${categoryId}`,
  productViewSk: (productId: string): string => `VIEW#PRODUCT#${productId}`,
  gsi1CategoryPk: (tenantId: string, categoryId: string): string =>
    `TENANT#${tenantId}#CATEGORY#${categoryId}`,
};
