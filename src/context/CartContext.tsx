import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "@/data/products";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type CartItem = Product & { qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const CART_KEY = "ferremas_cart";

const loadCart = (): CartItem[] => {
  // Aqui se recupera el carrito desde localStorage para no perderlo al recargar.
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    // En esta parte se mantiene una copia local del carrito mientras hay sesion.
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // Aca se evita que quede el numero del carrito despues de cerrar sesion.
    // Si no hay usuario, el carrito se limpia para no mostrar compras ajenas.
    if (!loading && !user && items.length > 0) {
      setItems([]);
      localStorage.removeItem(CART_KEY);
    }
  }, [items.length, loading, user]);

  const add = (p: Product) => {
    // Aqui se valida que solo clientes logueados puedan agregar productos.
    if (!user) {
      toast.error("Inicia sesión para agregar productos al carrito");
      return;
    }

    if (p.stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }

    setItems((prev) => {
      // En esta parte se respeta el stock real del producto antes de sumar unidades.
      const e = prev.find((i) => i.id === p.id);
      if (e) {
        if (e.qty >= p.stock) {
          toast.error(`Solo quedan ${p.stock} unidad(es) disponibles`);
          return prev;
        }
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...p, qty: 1 }];
    });
    toast.success(`${p.name} agregado al carrito`);
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, qty)) } : i))
    );
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
