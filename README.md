# @serafort/nuxt

Nuxt 3 module for Serafort B2B authentication, reactive composables (`useUser`, `useAuth`), and Nitro server guards (`requireUserSession`).

## Installation

```bash
npm install @serafort/nuxt @serafort/core
```

## Setup

Add `@serafort/nuxt` to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@serafort/nuxt'],
  serafort: {
    endpoint: process.env.NUXT_PUBLIC_SERAFORT_ENDPOINT,
    cookieName: '__serafort_token',
    loginUrl: '/login',
  },
});
```

## Usage

### In Vue Components / Pages

```vue
<script setup lang="ts">
const { user, isAuthenticated, hasPermission } = useAuth();
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Welcome, {{ user?.userId }} (Tenant: {{ user?.tenantId }})</p>
    <button v-if="hasPermission('org:write')">Create Organization</button>
  </div>
  <div v-else>
    <NuxtLink to="/login">Sign In</NuxtLink>
  </div>
</template>
```

### In Server Route Handlers (`server/api/*`)

```typescript
// server/api/projects.get.ts
export default defineEventHandler(async (event) => {
  // Requires authenticated session with permission
  const user = await requireUserSession(event, {
    permissions: ['projects:read'],
  });

  return {
    tenantId: user.tenantId,
    projects: ['Project Alpha', 'Project Beta'],
  };
});
```
