const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

// Aqui se decide si las llamadas van a un backend remoto o al mismo origen.
// En Vercel normalmente VITE_API_URL apunta al servicio de Render.
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
  // En esta parte se preparan headers comunes: JSON y Authorization si hay token.
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
  // Aqui se estandariza fetch para todo el proyecto. Aca se busca que los errores
  // del backend se conviertan en Error(message) y las paginas no repitan codigo.
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
