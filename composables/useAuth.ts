import type { UserSTDForm } from "~/schemas/AuthSchema";
import { authService } from "~/services/authService";

export const useAuth = () => {
  const endpoint = "/auth";

  const { session } = useUserSession();
  const login = async (userForm: UserSTDForm) => {
    const { success, data, error } = await authService.login(
      `${endpoint}/login`,
      userForm,
    );
    if (success && data) {
      session.value = data.perfil;
      return { success: true, data: data };
    }
    return { success: false, error };
  };

  const logout = async () => {
    const { success, data, error } = await authService.logout(
      `${endpoint}/logout`,
    );
    if (success && data) {
      return { success: true, data: data };
    }
    return { success: false, error };
  };

  const getUser = async () => {
    const { success, data, error } = await authService.getUser(
      `${endpoint}/me`,
    );
    if (success && data) {
      return { success: true, data: data };
    }
    return { success: false, error };
  };

  return {
    login,
    logout,
    getUser,
  };
};
