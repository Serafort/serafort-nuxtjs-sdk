import { SerafortClient, UserContext } from '@serafort/core';
import { getHeader, getCookie, createError, type H3Event } from 'h3';
import { ModuleOptions, RequireUserSessionOptions, UserSession } from '../../types.js';

let defaultClient: SerafortClient | null = null;

export function getSerafortClient(options: ModuleOptions = {}): SerafortClient {
  if (options.client) {
    return options.client;
  }
  if (!defaultClient) {
    defaultClient = new SerafortClient({
      endpoint: options.endpoint || process.env.NUXT_PUBLIC_SERAFORT_ENDPOINT || process.env.SERAFORT_ENDPOINT || 'https://api.serafort.com',
    });
  }
  return defaultClient;
}

/**
 * Resolves the authenticated user session from the H3Event request.
 */
export async function getUserSession(event: H3Event, options: ModuleOptions = {}): Promise<UserSession> {
  const client = getSerafortClient(options);
  const cookieName = options.cookieName || '__serafort_token';

  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = getHeader(event, 'authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Try cookie
  if (!token) {
    token = getCookie(event, cookieName) || null;
  }

  if (!token) {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const user = await client.b2b.validateToken(token);
    return {
      user,
      token,
      isAuthenticated: true,
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

/**
 * Enforces authentication and authorization on a Nitro server handler.
 * Throws an H3Error with status 401 or 403 if unauthorized.
 */
export async function requireUserSession(
  event: H3Event,
  options: RequireUserSessionOptions & ModuleOptions = {}
): Promise<UserContext> {
  const client = getSerafortClient(options);
  const session = await getUserSession(event, options);

  if (!session.isAuthenticated || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Authentication required.',
    });
  }

  const user = session.user;

  // Check tenant
  if (options.tenantId && user.tenantId !== options.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Tenant access mismatch.',
    });
  }

  // Check roles
  if (options.roles && options.roles.length > 0) {
    const hasRole = options.roles.some((r) => user.roles.includes(r));
    if (!hasRole) {
      throw createError({
        statusCode: 403,
        statusMessage: `Forbidden: Missing required role (${options.roles.join(', ')}).`,
      });
    }
  }

  // Check permissions (wildcards supported)
  if (options.permissions && options.permissions.length > 0) {
    for (const perm of options.permissions) {
      if (!client.b2b.hasPermission(user, perm)) {
        throw createError({
          statusCode: 403,
          statusMessage: `Forbidden: Missing required permission "${perm}".`,
        });
      }
    }
  }

  return user;
}
