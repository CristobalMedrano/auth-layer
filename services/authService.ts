/**
 * AuthService provides authentication-related API methods.
 * Each method returns an object with success, data, and optional error fields.
 */
export const authService = {
  /**
   * Logs in a user by sending a POST request to the specified endpoint.
   * @template T - Expected response data type.
   * @param endpoint - API endpoint for login.
   * @param payload - Request body payload.
   * @returns Promise resolving to an object with success, data, and error fields.
   */
  login: async <T = unknown>(endpoint: string, payload: unknown) => {
    const api = useApi();

    try {
      const data = await api(endpoint, {
        method: "POST",
        body: payload as Record<string, any>,
      });

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error) || null;

      return {
        success: false,
        data: null,
        error: errorMessage,
      };
    }
  },

  /**
   * Logs out a user by sending a POST request to the specified endpoint.
   * @template T - Expected response data type.
   * @param endpoint - API endpoint for logout.
   * @returns Promise resolving to an object with success, data, and error fields.
   */
  logout: async <T = unknown>(endpoint: string) => {
    const api = useApi();

    try {
      const data = await api(endpoint, {
        method: "POST",
      });

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error) || null;

      return {
        success: false,
        data: null,
        error: errorMessage,
      };
    }
  },

  /**
   * Retrieves the current user by sending a GET request to the specified endpoint.
   * @template T - Expected response data type.
   * @param endpoint - API endpoint to get user data.
   * @returns Promise resolving to an object with success, data, and error fields.
   */
  getUser: async <T = unknown>(endpoint: string) => {
    const api = useApi();

    try {
      const { data } = await api(endpoint, {
        method: "GET",
      });

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error) || null;

      return {
        success: false,
        data: null,
        error: errorMessage,
      };
    }
  },
};
