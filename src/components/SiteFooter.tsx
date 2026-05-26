import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { useLanguage } from "@/context/LanguageContext";

const SiteFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-24 border-t border-border bg-secondary text-secondary-foreground">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <BrandMark />
          </Link>
          <p className="mt-4 text-sm text-secondary-foreground/70">{t("footerDescription")}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{t("store")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/80">
            <li><Link to="/catalogo" className="hover:text-primary">{t("catalog")}</Link></li>
            <li><Link to="/carrito" className="hover:text-primary">{t("cart")}</Link></li>
            <li><Link to="/sucursales" className="hover:text-primary">{t("branches")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{t("company")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/80">
            <li><Link to="/sucursales" className="hover:text-primary">{t("ourBranches")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{t("contact")}</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/80">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Santiago Centro, Chile</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +56 2 2345 6789</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contacto@ferremas.cl</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 py-6 text-center text-xs text-secondary-foreground/60">
        © {new Date().getFullYear()} FERREMAS - {t("academicDemo")}
      </div>
    </footer>
  );
};

export default SiteFooter;
