const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const TOKEN_KEY = "manola_token";
const USER_KEY = "manola_user";

// ─── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("manola_cart");
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── API Error ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core request helper ───────────────────────────────────────────────────────

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** If true, the Content-Type header is NOT set (needed for multipart/form-data) */
  isFormData?: boolean;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, isFormData, ...init } = options;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...((init.headers as Record<string, string>) ?? {}),
    },
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  // No-content responses (204, 205)
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // ── Auto-logout on 401 (token expired / invalid) ──────────────────────
    if (response.status === 401 && typeof window !== "undefined") {
      removeToken();
      // Also clear cookies so middleware stops granting access
      document.cookie = "manola_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "manola_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      window.location.href = "/login";
    }

    const message =
      (data as { message?: string })?.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const api = {
  get: <T = unknown>(path: string, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "GET" }),

  post: <T = unknown>(path: string, body?: unknown, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),

  put: <T = unknown>(path: string, body?: unknown, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),

  delete: <T = unknown>(path: string, init?: RequestOptions) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),

  /** Multipart/form-data (file upload) */
  upload: <T = unknown>(path: string, formData: FormData, method: "POST" | "PUT" = "POST") =>
    apiRequest<T>(path, { method, body: formData, isFormData: true }),
};
