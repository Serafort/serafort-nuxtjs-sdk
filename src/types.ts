import { UserContext, SerafortClient } from '@serafort/core';

export interface ModuleOptions {
  /** Serafort IAM backend endpoint */
  endpoint?: string;
  /** Name of the session cookie. Default: '__serafort_token' */
  cookieName?: string;
  /** Redirect URL for unauthenticated users */
  loginUrl?: string;
  /** Optional pre-instantiated client */
  client?: SerafortClient;
}

export interface UserSession {
  user: UserContext | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RequireUserSessionOptions {
  /** Required permissions (supports wildcards like 'org:*') */
  permissions?: string[];
  /** Required roles */
  roles?: string[];
  /** Required tenant */
  tenantId?: string;
}
