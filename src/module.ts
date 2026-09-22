import { defineNuxtModule, addImports, addServerImports } from '@nuxt/kit';
import { ModuleOptions } from './types.js';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@serafort/nuxt',
    configKey: 'serafort',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    endpoint: process.env.NUXT_PUBLIC_SERAFORT_ENDPOINT || 'https://api.serafort.com',
    cookieName: '__serafort_token',
    loginUrl: '/login',
  },
  setup(options, nuxt) {
    // Expose in runtimeConfig
    nuxt.options.runtimeConfig.public.serafort = {
      endpoint: options.endpoint,
      cookieName: options.cookieName,
      loginUrl: options.loginUrl,
    };

    // Auto-import composables for client & SSR
    addImports([
      { name: 'useSerafort', from: '@serafort/nuxt' },
      { name: 'useUser', from: '@serafort/nuxt' },
      { name: 'useAuth', from: '@serafort/nuxt' },
    ]);

    // Auto-import server utilities for Nitro handlers
    addServerImports([
      { name: 'getUserSession', from: '@serafort/nuxt/server' },
      { name: 'requireUserSession', from: '@serafort/nuxt/server' },
    ]);
  },
});
