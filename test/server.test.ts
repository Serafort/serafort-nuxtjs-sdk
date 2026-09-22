import { describe, it, expect, vi } from 'vitest';
import { getUserSession, requireUserSession } from '../src/runtime/server/utils.js';
import { SerafortClient } from '@serafort/core';
import type { H3Event } from 'h3';

describe('Nuxt Server Utils (Nitro / H3)', () => {
  const mockClient = {
    b2b: {
      validateToken: vi.fn(),
      hasPermission: vi.fn(),
    },
  } as unknown as SerafortClient;

  const createMockEvent = (headers: Record<string, string> = {}): H3Event => {
    return {
      node: {
        req: {
          headers,
        },
      },
    } as unknown as H3Event;
  };

  it('should return unauthenticated session when no header or cookie is present', async () => {
    const event = createMockEvent({});
    const session = await getUserSession(event, { client: mockClient });

    expect(session.isAuthenticated).toBe(false);
    expect(session.user).toBeNull();
  });

  it('should resolve session on valid Bearer token', async () => {
    const mockUser = {
      userId: 'usr_h3_1',
      tenantId: 'ten_h3',
      roles: ['admin'],
      permissions: ['read:all'],
      claims: {},
    };

    vi.mocked(mockClient.b2b.validateToken).mockResolvedValueOnce(mockUser);

    const event = createMockEvent({ authorization: 'Bearer token_h3_valid' });
    const session = await getUserSession(event, { client: mockClient });

    expect(session.isAuthenticated).toBe(true);
    expect(session.user?.userId).toBe('usr_h3_1');
    expect(session.user?.tenantId).toBe('ten_h3');
  });

  it('should throw 401 in requireUserSession when unauthenticated', async () => {
    const event = createMockEvent({});

    await expect(requireUserSession(event, { client: mockClient })).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('should verify permissions in requireUserSession', async () => {
    const mockUser = {
      userId: 'usr_h3_2',
      tenantId: 'ten_h3',
      roles: ['member'],
      permissions: ['org:read'],
      claims: {},
    };

    vi.mocked(mockClient.b2b.validateToken).mockResolvedValue(mockUser);
    vi.mocked(mockClient.b2b.hasPermission).mockImplementation((u, p) => p === 'org:read');

    const event = createMockEvent({ authorization: 'Bearer token_perm' });

    // Success with valid permission
    const user = await requireUserSession(event, {
      client: mockClient,
      permissions: ['org:read'],
    });
    expect(user.userId).toBe('usr_h3_2');

    // Forbidden with missing permission
    await expect(
      requireUserSession(event, {
        client: mockClient,
        permissions: ['org:delete'],
      })
    ).rejects.toThrow(expect.objectContaining({ statusCode: 403 }));
  });
});
