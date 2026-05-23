import { clearAdminToken, getAdminToken } from "@/lib/api";

// Aqui se encapsula la lectura del token admin para que las rutas protegidas no
// conozcan directamente el nombre de la key usada en localStorage.
export const isAdminAuthenticated = () => Boolean(getAdminToken());
export const clearAdminSession = () => clearAdminToken();
