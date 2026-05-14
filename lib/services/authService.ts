import { api, setToken, setStoredUser, removeToken, getStoredUser } from "@/lib/api";

// ─── Cookie helpers (for middleware route protection) ─────────────────────────

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "OWNER" | "ADMIN" | "KASIR" | "PACKAGING" | "USER";

export interface User {
  id: number;
  email: string;
  nama: string;
  foto: string | null;
  role: UserRole;
  createdAt: string;
}

interface LoginResponse {
  message?: string;
  token: string;
  user: User;
}

interface RegisterPayload {
  email: string;
  password: string;
  nama: string;
  foto?: string;
}

// ─── Auth service ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /auth/login
   * Saves token + user to localStorage on success.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(res.token);
    setStoredUser(res.user);
    // Also persist to cookies so Next.js middleware can read them
    setCookie("manola_token", res.token);
    setCookie("manola_user", JSON.stringify(res.user));
    return res;
  },

  /**
   * POST /auth/register
   */
  async register(payload: RegisterPayload): Promise<User> {
    return api.post<User>("/auth/register", payload);
  },

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post("/auth/forgot-password", { email });
  },

  /**
   * POST /auth/reset-password
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return api.post("/auth/reset-password", { token, password });
  },

  /** Clear token & user from localStorage */
  logout(): void {
    removeToken();
    deleteCookie("manola_token");
    deleteCookie("manola_user");
  },

  /** Get currently logged-in user from localStorage */
  getCurrentUser(): User | null {
    return getStoredUser<User>();
  },

  isLoggedIn(): boolean {
    return !!authService.getCurrentUser();
  },
};
