import { createProductSchema, createCategorySchema } from '../src/lib/schemas';

describe('createProductSchema', () => {
  it('accepts a valid product', () => {
    const result = createProductSchema.safeParse({
      name: 'Latte',
      price: 12.5,
      categoryId: 'cat_bebidas',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('defaults status to active', () => {
    const result = createProductSchema.safeParse({
      name: 'Latte',
      price: 12.5,
      categoryId: 'cat_bebidas',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('active');
  });

  it('rejects a negative price', () => {
    const result = createProductSchema.safeParse({
      name: 'Latte',
      price: -1,
      categoryId: 'cat_bebidas',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode / OWASP API3)', () => {
    const result = createProductSchema.safeParse({
      name: 'Latte',
      price: 12.5,
      categoryId: 'cat_bebidas',
      tenantId: 'tnt_evil', // intento de inyectar tenant desde el cliente
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = createProductSchema.safeParse({
      name: '',
      price: 12.5,
      categoryId: 'cat_bebidas',
    });
    expect(result.success).toBe(false);
  });
});

describe('createCategorySchema', () => {
  it('accepts a valid category', () => {
    expect(createCategorySchema.safeParse({ name: 'Bebidas' }).success).toBe(true);
  });

  it('rejects a description over 500 chars', () => {
    const result = createCategorySchema.safeParse({
      name: 'Bebidas',
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
