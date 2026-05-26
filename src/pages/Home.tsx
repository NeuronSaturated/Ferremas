import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, CreditCard, Store, Wrench, HardHat, PaintBucket, Cable } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/product-api";
import { useLanguage } from "@/context/LanguageContext";
import hero from "@/assets/hero-warehouse.jpg";

const categories = [
  { icon: Wrench, labelKey: "categoryTools", filter: "Herramientas" },
  { icon: HardHat, labelKey: "categorySafety", filter: "Seguridad" },
  { icon: PaintBucket, labelKey: "categoryPaints", filter: "Pinturas" },
  { icon: Cable, labelKey: "categoryElectrical", filter: "Eléctrico" },
] as const;

const Home = () => {
  // Aqui se arma la portada comercial de FERREMAS con categorias y destacados.
  const { products } = useProducts();
  const { t } = useLanguage();
  const benefits = [
    { icon: Truck, title: t("homeDelivery"), text: t("homeDeliveryText") },
    { icon: Store, title: t("storePickup"), text: t("storePickupText") },
    { icon: CreditCard, title: t("paymentMethods"), text: t("paymentMethodsText") },
    { icon: ShieldCheck, title: t("trustedBrands"), text: t("trustedBrandsText") },
  ];

  return (
    <>
      {/* Aqui se muestra el primer impacto visual de la tienda. */}
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Bodega FERREMAS" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 gradient-hero" />
        <div className="container py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
              {t("since1985")}
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight text-white text-balance md:text-6xl">
              {t("heroTitleA")}<br />
              <span className="text-primary">{t("heroTitleB")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">{t("heroCopy")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/catalogo">
                  {t("viewCatalog")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Link to="/sucursales">{t("findStore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* En esta parte se resumen beneficios de compra y entrega. */}
      <section className="border-y border-border bg-card">
        <div className="container grid gap-6 py-10 md:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aca se muestran accesos rapidos por categoria. */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t("featuredCategories")}</h2>
            <p className="mt-2 text-muted-foreground">{t("featuredCategoriesText")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.filter}
              to={`/catalogo?cat=${category.filter}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-elegant"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground transition-transform group-hover:scale-110">
                <category.icon className="h-6 w-6" />
              </span>
              <span className="font-semibold">{t(category.labelKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Aqui se muestran productos destacados desde el catalogo cargado. */}
      <section className="container py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t("featuredProducts")}</h2>
            <p className="mt-2 text-muted-foreground">{t("featuredProductsText")}</p>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link to="/catalogo">{t("viewAll")}</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* En esta parte se invita a clientes profesionales o constructoras. */}
      <section className="container my-16">
        <div className="overflow-hidden rounded-2xl gradient-dark p-10 text-secondary-foreground md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl text-balance">{t("professionalCtaTitle")}</h2>
              <p className="mt-4 text-secondary-foreground/80">{t("professionalCtaText")}</p>
            </div>
            <div className="flex md:justify-end">
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/sucursales">{t("contactUs")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
