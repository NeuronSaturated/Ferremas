import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Search, User as UserIcon, LogOut, Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { formatCLP } from "@/data/products";
import BrandMark from "@/components/BrandMark";
import { useProducts } from "@/lib/product-api";

const baseNavItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/sucursales", label: "Sucursales" },
];

const SiteHeader = () => {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const { products } = useProducts();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navItems = baseNavItems;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => `${p.name} ${p.brand} ${p.sku} ${p.category}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [products, q]);

  // Cerrar el dropdown al hacer click fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setOpen(false);
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo");
  };

  const goToProduct = (id: string) => {
    setOpen(false);
    setQ("");
    navigate(`/producto/${id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
        </Link>

        {/* Buscador con sugerencias */}
        <div ref={wrapperRef} className="relative hidden flex-1 max-w-md lg:block">
          <form onSubmit={onSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar productos, marcas, SKU..."
              className="pl-9"
              aria-label="Buscar productos"
              autoComplete="off"
            />
          </form>
          {open && q.trim() && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
              {suggestions.length > 0 ? (
                <>
                  <ul className="max-h-80 overflow-auto py-1">
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => goToProduct(p.id)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.brand} · {p.category}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-primary">
                            {formatCLP(p.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={onSearch}
                    className="block w-full border-t border-border bg-muted/50 px-3 py-2 text-center text-xs font-medium text-primary hover:bg-muted"
                  >
                    Ver todos los resultados para "{q.trim()}"
                  </button>
                </>
              ) : (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Sin resultados para "{q.trim()}"
                </p>
              )}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                isActive(n.to) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Menú de usuario */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-24 truncate">{user.firstName}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/perfil")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/perfil?tab=orders")}>
                  <Package className="mr-2 h-4 w-4" /> Mis compras
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <UserIcon className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Ingresar</span>
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="sm" className="relative">
            <Link to="/carrito" aria-label="Carrito">
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <form onSubmit={onSearch} className="relative mt-8">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-9"
                />
              </form>
              {q.trim() && suggestions.length > 0 && (
                <ul className="mt-2 max-h-64 overflow-auto rounded-md border border-border">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goToProduct(p.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <img src={p.image} alt={p.name} className="h-8 w-8 rounded object-cover" />
                        <span className="truncate">{p.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <nav className="mt-6 flex flex-col gap-2">
                {navItems.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-2 text-base font-medium",
                        isActive ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-muted"
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
                {user ? (
                  <NavLink to="/perfil" className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                    Mi perfil
                  </NavLink>
                ) : (
                  <NavLink to="/auth" className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted">
                    Ingresar / Registrarse
                  </NavLink>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
