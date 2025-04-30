// composables/useUserSession.ts
import { getCookie } from "h3";
import type { UserSession } from "~/schemas/AuthSchema";

export function useUserSession() {
  const sessionState = useState<UserSession | null>("nuxt-session", () => null);
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
      sessionState.value = data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
