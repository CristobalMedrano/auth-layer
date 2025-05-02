import { authService } from "~/services/authService";
/**
 * Composable for handling user authentication logic.
 *
 * Provides methods for logging in, logging out, and retrieving the current user.
 * Uses generics to allow flexible typing for session and login form data.
 *
 * @template T - The type of the user session object.
 * @template F - The type of the login form data.
 *
 * @returns An object containing authentication methods:
 * - `login(loginForm: F): Promise<{ success: boolean; data?: T; error?: any }>`: Authenticates the user with the provided credentials.
 * - `logout(): Promise<{ success: boolean; data?: any; error?: any }>`: Logs out the current user.
 * - `getUser(): Promise<{ success: boolean; data?: T; error?: any }>`: Retrieves the current authenticated user.
 *
 * @example
 * ```typescript
 * const { login, logout, getUser } = useAuth<User, LoginForm>();
 * await login({ username: 'user', password: 'pass' });
 * ```
 */
export const useAuth = <T = any, F = any>() => {
  const endpoint = "/auth";
  const { session } = useUserSession<T>();

  const login = async (loginForm: F) => {
    const { success, data, error } = await authService.login(`${endpoint}/login`, loginForm);
    if (success && data) {
      session.value = data as T;
      return { success: true, data };
    }
    return { success: false, error };
  };

  const logout = async () => {
    const { success, data, error } = await authService.logout(`${endpoint}/logout`);
    if (success && data) {
      return { success: true, data };
    }
    return { success: false, error };
  };

  const getUser = async () => {
    const { success, data, error } = await authService.getUser(`${endpoint}/me`);
    if (success && data) {
      return { success: true, data: data as T };
    }
    return { success: false, error };
  };

  return {
    login,
    logout,
    getUser,
  };
};
