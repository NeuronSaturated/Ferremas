const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const buildApiUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

export const SESSION_TOKEN_KEY = "ferremas_session_token";
export const ADMIN_TOKEN_KEY = "ferremas_admin_token";

export const getSessionToken = () => localStorage.getItem(SESSION_TOKEN_KEY);
export const setSessionToken = (token: string) => localStorage.setItem(SESSION_TOKEN_KEY, token);
export const clearSessionToken = () => localStorage.removeItem(SESSION_TOKEN_KEY);

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

const getHeaders = (token?: string | null, isJson = true) => {
  const headers = new Headers();

  if (isJson) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit & { token?: string | null; isJson?: boolean } = {}
) => {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: getHeaders(options.token, options.isJson ?? true),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && data.message
        ? data.message
        : "Ocurrio un error inesperado."
    );
  }

  return data as T;
};
