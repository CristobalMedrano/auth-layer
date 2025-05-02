import {} from "nuxt/app";
import { defineNuxtPlugin, useUserSession } from "#imports";

/**
 * Nuxt plugin to ensure user session is fetched on the client.
 * 
 * - On client-side navigation (not server-rendered), fetches the user session immediately.
 * - On prerendered or cached payloads, fetches the user session after the app is mounted
 *   to prevent hydration mismatches.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  if (!nuxtApp.payload.serverRendered) {
    // Fetch user session immediately on client-side navigation
    await useUserSession().fetch();
  } else if (
    Boolean(nuxtApp.payload.prerenderedAt) ||
    Boolean(nuxtApp.payload.isCached)
  ) {
    // On prerendered/cached payloads, fetch session after app is mounted
    nuxtApp.hook("app:mounted", async () => {
      await useUserSession().fetch();
    });
  }
});
