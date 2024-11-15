import { cache } from '../../src/core/cache';

describe('Cache', () => {
  it('should set and retrieve cached value', async () => {
    await cache.set('key', 'value', 60);
    const value = await cache.get('key');
    expect(value).toBe('value');
  });

  it('should return null for expired cache', async () => {
    await cache.set('key', 'value', -1); // TTL expired
    const value = await cache.get('key');
    expect(value).toBeNull();
  });
});
