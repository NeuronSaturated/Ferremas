import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

const SiteFooter = () => (
  <footer className="mt-24 border-t border-border bg-secondary text-secondary-foreground">
    <div className="container grid gap-10 py-14 md:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
        </Link>
        <p className="mt-4 text-sm text-secondary-foreground/70">
          Distribuidora de productos de ferretería y construcción desde 1985. Calidad y servicio para profesionales y hogar.
        </p>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Tienda</h4>
        <ul className="space-y-2 text-sm text-secondary-foreground/80">
          <li><Link to="/catalogo" className="hover:text-primary">Catálogo</Link></li>
          <li><Link to="/carrito" className="hover:text-primary">Carrito</Link></li>
          <li><Link to="/sucursales" className="hover:text-primary">Sucursales</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Empresa</h4>
        <ul className="space-y-2 text-sm text-secondary-foreground/80">
          <li><Link to="/sucursales" className="hover:text-primary">Nuestras sucursales</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Contacto</h4>
        <ul className="space-y-2 text-sm text-secondary-foreground/80">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Santiago Centro, Chile</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +56 2 2345 6789</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contacto@ferremas.cl</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-secondary-foreground/10 py-6 text-center text-xs text-secondary-foreground/60">
      © {new Date().getFullYear()} FERREMAS — Integración de Plataformas (ASY5131) · Demo académica
    </div>
  </footer>
);

export default SiteFooter;
