import { clearAdminToken, getAdminToken } from "@/lib/api";

export const isAdminAuthenticated = () => Boolean(getAdminToken());
export const clearAdminSession = () => clearAdminToken();
