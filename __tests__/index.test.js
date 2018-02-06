import state from './fixtures/state.json';

import denormalizer from '../src/index.js';

test('should load payload', () => {
  expect(state.users.data.length).toBe(1);
});

describe('Denormalizer', () => {
  it('should denormalize state', () => {
    const result = denormalizer(state);

    expect(Object.keys(result.users).length).toBe(1);
    expect(Object.keys(result.providers).length).toBe(2);
    expect(Object.keys(result.stats).length).toBe(1);

    expect(result.providers['1'].type).toBe('providers');
    expect(result.users['1'].type).toBe('users');
    expect(result.stats['2'].type).toBe('stats');

    expect(result.stats['2'].data['ranking']).toBe(36457);

    const stats = result.stats['2'];

    expect(result.users['1'].current_stats).toBe(stats);
  });

  it('should reuse reference for each object', () => {
    const result = denormalizer(state);

    result.stats['2'].data['ranking'] = 'hello-world';
    expect(result.users['1'].current_stats.data['ranking']).toBe('hello-world');
  });
});
