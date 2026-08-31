import { keys } from '../src/lib/keys';

describe('keys', () => {
  it('builds the catalog partition key scoped to tenant', () => {
    expect(keys.catalogPk('tnt_001')).toBe('TENANT#tnt_001#CATALOG');
  });

  it('builds product and category sort keys', () => {
    expect(keys.productSk('p1')).toBe('PRODUCT#p1');
    expect(keys.categorySk('c1')).toBe('CATEGORY#c1');
    expect(keys.productViewSk('p1')).toBe('VIEW#PRODUCT#p1');
  });

  it('builds the GSI1 category partition key', () => {
    expect(keys.gsi1CategoryPk('tnt_001', 'bebidas')).toBe('TENANT#tnt_001#CATEGORY#bebidas');
  });

  it('isolates tenants in the partition key', () => {
    expect(keys.catalogPk('tnt_a')).not.toBe(keys.catalogPk('tnt_b'));
  });
});
