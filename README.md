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

## Contributing

Before committing, changes are checked with `pnpm run type-check`. This is
wired up two ways — pick whichever fits your setup:

- **Husky (npm-idiomatic, default for contributors who run `pnpm install`)**:
  the `prepare` script installs a Husky hook automatically, so once you've run
  `pnpm install` in a git checkout, `git commit` runs the check for you.
- **`.githooks/` (portable, no Husky/Node required to install)**: run
  `git config core.hooksPath .githooks` once to point git directly at the
  checked-in `.githooks/pre-commit` script, which runs the same check.

Both hooks run the same command, so pick one — you don't need both active
at once.

CI (`.github/workflows/ci.yml`) runs `type-check`, `test`, and `build` on
every push to `main` and on every pull request.
