import {} from "nuxt/app";
import { defineNuxtPlugin, useRequestEvent, useUserSession } from "#imports";

// Definición del plugin de Nuxt
/**
 * Nuxt plugin to manage user session fetching on server-side rendering.
 *
 * @remarks
 * This plugin runs before other plugins (`enforce: "pre"`) and determines if the current request is cached.
 * If the page is server-rendered, not prerendered, and not cached, it fetches the user session.
 *
 * @param nuxtApp - The Nuxt application instance, providing access to the payload and context.
 *
 * @example
 * // This plugin is automatically registered by Nuxt when placed in the plugins directory.
 */
export default defineNuxtPlugin({
  name: "session-fetch-plugin", 
  enforce: "pre",
  async setup(nuxtApp) {
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (
      nuxtApp.payload.serverRendered &&
      !nuxtApp.payload.prerenderedAt &&
      !nuxtApp.payload.isCached
    ) {
      await useUserSession().fetch();
    }
  },
});
