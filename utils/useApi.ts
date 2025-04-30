import { $fetch } from "ofetch";
import type { FetchOptions, FetchError } from "ofetch";
import { setResponseHeader } from "h3";
import { useRuntimeConfig } from "#imports";

/**
 * useApi: Cliente HTTP que envía cookies HttpOnly,
 * refresca el token al expirar y propaga correctamente
 * las cookies nuevas en renderizado SSR para que el
 * navegador las reciba.
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  // En SSR obtenemos el H3Event para reenviar cabeceras
  const event = import.meta.server ? useRequestEvent() : undefined;

  // ——————————————————————————————————————————
  // 1) Preparar un objeto mutable `headers` con la
  //    cookie y el Authorization entrantes (solo en SSR).
  //
  //    Por qué: en Nitro/SSR las peticiones `$fetch`
  //    son servidor→servidor, y debemos “forwardear”
  //    la cookie HttpOnly y cualquier header de auth
  //    para que el backend nos reconozca la sesión.
  // ——————————————————————————————————————————
  const headers: Record<string, string> = {};
  if (import.meta.server && event) {
    const { cookie, authorization } = event.node.req.headers;
    if (cookie) headers.cookie = cookie;
    if (authorization) headers.authorization = authorization as string;
  }

  // ——————————————————————————————————————————
  // 2) Crear instancia ofetch con:
  //    - credentials:"include" para mandar/recibir cookies
  //    - headers iniciales en SSR
  //    - onResponse: captura cualquier Set-Cookie que
  //      venga del backend (p. ej. tras refresh-token)
  //
  //    Por qué:
  //    • El navegador cliente sí guarda automaticamente
  //      cookies HttpOnly, pero en SSR Nitro no. Debemos
  //      reinyectar el Set-Cookie en la respuesta Nitro
  //      para que la cookie llegue al navegador.
  //    • Además, para que el retry interno use la nueva
  //      cookie, actualizamos `headers.cookie` con el par
  //      “token=…” extraído del Set-Cookie.
  // ——————————————————————————————————————————
  const fetcher = $fetch.create({
    baseURL: config.public.backBaseUrl,
    credentials: "include",
    headers,
    retry: 0, // desactivar reintentos automáticos
    onResponse({ response }) {
      if (import.meta.server && event) {
        // Viene un nuevo JWT en Set-Cookie tras un refresh
        const sc = response.headers.get("set-cookie");
        if (sc) {
          // 1) Reinyectar al cliente la cookie nueva
          setResponseHeader(event, "set-cookie", sc);
          // 2) Actualizar `headers.cookie` para subsecuentes
          //    llamadas SSR con el token fresco
          headers.cookie = sc.split(";")[0].trim();
        }
      }
    },
    onResponseError({ response }) {
      // Logging sin interrumpir la lógica de retry
      console.error("[API Error]", response.status, response._data);
    },
  });

  // ——————————————————————————————————————————
  // 3) Wrapper `api()` que:
  //    - Llama al endpoint
  //    - Si recibe 401 y aún no ha reintentado:
  //        • Invoca POST /auth/refresh_token
  //        • (el onResponse anterior propaga la cookie fresca)
  //        • Reintenta la petición original UNA sola vez
  //
  //    Por qué:
  //    Garantizar un flujo transparente “401→refresh→retry”
  //    sin propagar al caller el primer 401 por expiración.
  // ——————————————————————————————————————————
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function api<T = any>(
    url: string,
    opts: FetchOptions & { _retry?: boolean } = {},
  ): Promise<T> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await fetcher<T>(url, opts as any);
    } catch (e: unknown) {
      const err = e as FetchError;
      const status = err.response?.status;
      if (status === 401 && !opts._retry) {
        // primer 401: refrescar token
        await fetcher("/auth/refresh_token", { method: "POST" });
        // retry con bandera para evitar bucles infinitos
        return api<T>(url, { ...opts, _retry: true });
      }
      // 401 tras retry o cualquier otro error → propagar
      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api as <T = any>(
    url: string,
    opts?: FetchOptions & { _retry?: boolean },
  ) => Promise<T>;
};
