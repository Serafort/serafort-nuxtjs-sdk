import { describe, it, expect } from 'vitest';
import { useAuth, useUser, initializeSerafort } from '../src/runtime/composables.js';

describe('Nuxt Composables', () => {
  it('should initialize and manage reactive auth state', () => {
    initializeSerafort('https://auth.acme.com');
    const auth = useAuth();
    const user = useUser();

    expect(auth.isAuthenticated.value).toBe(false);
    expect(user.value).toBeNull();

    auth.setUser(
      {
        userId: 'usr_nuxt_1',
        tenantId: 'ten_nuxt',
        roles: ['editor'],
        permissions: ['posts:*'],
        claims: {},
      },
      'test_token_123'
    );

    expect(auth.isAuthenticated.value).toBe(true);
    expect(user.value?.userId).toBe('usr_nuxt_1');
    expect(auth.hasPermission('posts:create')).toBe(true);
    expect(auth.hasRole('editor')).toBe(true);
    expect(auth.hasRole('admin')).toBe(false);
  });
});
