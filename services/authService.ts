import type { UserSTDForm } from "~/schemas/AuthSchema";

export const authService = {
  login: async (endpoint: string, userForm: UserSTDForm) => {
    const api = useApi();
    try {
      const data = await api(endpoint, {
        method: "POST",
        body: {
          user: userForm.email,
          domain: userForm.domain,
          password: userForm.password,
        },
      });
      return {
        success: true,
        data: data,
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
  logout: async (endpoint: string) => {
    const api = useApi();
    try {
      const data = await api(endpoint, {
        method: "POST",
      });
      return {
        success: true,
        data: data,
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
  getUser: async (endpoint: string) => {
    const api = useApi();
    try {
      const { data } = await api(endpoint, {
        method: "GET",
      });
      return {
        success: true,
        data: data,
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
