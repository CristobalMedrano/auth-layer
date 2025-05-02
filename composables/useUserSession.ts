import { getCookie } from "h3";

/**
 * Provides composable utilities for managing the user session state in a Nuxt application.
 *
 * @template T - The type of the user session data.
 *
 * @returns An object containing:
 * - `ready`: A computed ref indicating if the authentication state is ready.
 * - `loggedIn`: A computed ref indicating if the user is currently logged in.
 * - `user`: A computed ref containing the current user session data or `null`.
 * - `session`: The reactive state holding the user session data.
 * - `fetch`: An async function to fetch and validate the current user session.
 * - `clear`: An async function to clear the user session and log out.
 *
 * @remarks
 * This composable uses Nuxt's `useState` for session and authentication readiness state,
 * and integrates with an authentication composable (`useAuth`) for session management.
 * It handles both server-side and client-side session validation, including token checks and error handling.
 *
 * @example
 * ```typescript
 * const { user, loggedIn, fetch, clear } = useUserSession<User>();
 * await fetch();
 * if (loggedIn.value) {
 *   // User is authenticated
 * }
 * ```
 */
export function useUserSession<T = unknown>() {
  const sessionState = useState<T | null>("nuxt-session", () => null);
  const authReadyState = useState("nuxt-auth-ready", () => false);

  const clear = async () => {
    const { logout } = useAuth();
    await logout();
    sessionState.value = null;
  };

  const fetch = async () => {
    if (import.meta.server) {
      const event = useRequestEvent();
      if (!event) {
        sessionState.value = null;
        authReadyState.value = true;
        return;
      }

      const token = getCookie(event, "token");
      if (!token) {
        sessionState.value = null;
        authReadyState.value = true;
        return;
      }
    }

    try {
      const { getUser } = useAuth();
      const { data } = await getUser();
      sessionState.value = data as T;
    } catch (err: any) {
      if (err.response?.status === 401 || err.status === 401) {
        sessionState.value = null;
      } else {
        console.error("Error inesperado al validar sesión:", err);
      }
    } finally {
      authReadyState.value = true;
    }
  };

  return {
    ready: computed(() => authReadyState.value),
    loggedIn: computed(() => Boolean(sessionState.value)),
    user: computed(() => sessionState.value),
    session: sessionState,
    fetch,
    clear,
  };
}
