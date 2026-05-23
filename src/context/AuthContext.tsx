import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import {
  apiFetch,
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from "@/lib/api";

export type Address = {
  street: string;
  number: string;
  apt?: string;
  commune: string;
  region: string;
  reference?: string;
};

export type PaymentMethod = {
  holder: string;
  number: string;
  expiry: string;
  type: "credito" | "debito";
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  status: "Pendiente" | "Aprobado" | "Preparando" | "Listo" | "Despachado" | "Rechazado";
  items: OrderItem[];
  delivery: "retiro" | "despacho";
  payment: string;
  paymentStatus: "Confirmado" | "Pendiente";
  branch: string;
  authorizationCode?: string | null;
  cardLast4?: string | null;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  address?: Address;
  payment?: PaymentMethod;
  orders: Order[];
  createdAt: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rut: string;
    phone: string;
  }) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, nextPassword: string) => Promise<boolean>;
  recoverPassword: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

type AuthResponse = {
  token: string;
  user: User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    // Aqui se rehidrata la sesion cuando la pagina se recarga. Si hay token
    // local, el backend devuelve el usuario actualizado con sus compras.
    const token = getSessionToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch<AuthResponse>("/api/auth/me", {
        method: "GET",
        token,
      });
      setSessionToken(response.token);
      setUser(response.user);
    } catch {
      clearSessionToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const signUp: AuthCtx["signUp"] = async (data) => {
    try {
      // Aca se registra un cliente y se guarda su token para dejarlo logueado.
      const response = await apiFetch<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSessionToken(response.token);
      setUser(response.user);
      toast.success(`Bienvenido a FERREMAS, ${response.user.firstName}`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
      return false;
    }
  };

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    try {
      // Aqui el frontend pide al backend validar email/contrasena y crear sesion.
      const response = await apiFetch<AuthResponse>("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSessionToken(response.token);
      setUser(response.user);
      toast.success(`Hola de nuevo, ${response.user.firstName}`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
      return false;
    }
  };

  const signOut = async () => {
    const token = getSessionToken();

    try {
      if (token) {
        await apiFetch("/api/auth/signout", {
          method: "POST",
          token,
        });
      }
    } catch {
      // En esta parte, si el token ya vencio, igual se limpia el estado local.
    } finally {
      clearSessionToken();
      setUser(null);
      toast.success("Sesion cerrada");
    }
  };

  const updateProfile: AuthCtx["updateProfile"] = async (patch) => {
    const token = getSessionToken();
    if (!token) return false;

    try {
      // Aqui el perfil se actualiza en backend y vuelve ya persistido.
      const response = await apiFetch<{ user: User }>("/api/auth/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify(patch),
      });
      setUser(response.user);
      toast.success("Datos actualizados");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfil.");
      return false;
    }
  };

  const updatePassword: AuthCtx["updatePassword"] = async (currentPassword, nextPassword) => {
    const token = getSessionToken();
    if (!token) return false;

    try {
      // Aca se cambia la contrasena validando primero la clave actual.
      const response = await apiFetch<{ user: User }>("/api/auth/password", {
        method: "PATCH",
        token,
        body: JSON.stringify({ currentPassword, nextPassword }),
      });
      setUser(response.user);
      toast.success("Contraseña actualizada");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar la contraseña.");
      return false;
    }
  };

  const recoverPassword: AuthCtx["recoverPassword"] = async (email) => {
    try {
      // Aqui la demo simula recuperacion. En produccion esta parte enviaria
      // correo con token seguro y expiracion.
      const response = await apiFetch<{ message: string }>("/api/auth/recover", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success(response.message);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar la recuperación.");
      return false;
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile, updatePassword, recoverPassword, refreshUser, setUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};
