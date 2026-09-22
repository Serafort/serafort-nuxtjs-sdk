import { SerafortClient, UserContext } from '@serafort/core';
import { ref, computed, type Ref } from 'vue';

let clientInstance: SerafortClient | null = null;
const userState: Ref<UserContext | null> = ref(null);
const tokenState: Ref<string | null> = ref(null);

export function initializeSerafort(endpoint: string): SerafortClient {
  clientInstance = new SerafortClient({ endpoint });
  return clientInstance;
}

/**
 * Composable returning the SerafortClient instance.
 */
export function useSerafort(): SerafortClient {
  if (!clientInstance) {
    clientInstance = new SerafortClient({
      endpoint: process.env.NUXT_PUBLIC_SERAFORT_ENDPOINT || 'https://api.serafort.com',
    });
  }
  return clientInstance;
}

/**
 * Composable returning reactive user state.
 */
export function useUser(): Ref<UserContext | null> {
  return userState;
}

/**
 * Composable returning authentication state and helpers.
 */
export function useAuth() {
  const client = useSerafort();

  const isAuthenticated = computed(() => !!userState.value);

  const setUser = (user: UserContext | null, token: string | null = null) => {
    userState.value = user;
    tokenState.value = token;
  };

  const hasPermission = (permission: string): boolean => {
    if (!userState.value) return false;
    return client.b2b.hasPermission(userState.value, permission);
  };

  const hasRole = (role: string): boolean => {
    if (!userState.value) return false;
    return client.b2b.hasRole(userState.value, role);
  };

  return {
    user: userState,
    token: tokenState,
    isAuthenticated,
    setUser,
    hasPermission,
    hasRole,
  };
}
