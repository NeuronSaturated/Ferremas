import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, CreditCard, Store, Wrench, HardHat, PaintBucket, Cable } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import hero from "@/assets/hero-warehouse.jpg";

const categories = [
  { icon: Wrench, label: "Herramientas" },
  { icon: HardHat, label: "Seguridad" },
  { icon: PaintBucket, label: "Pinturas" },
  { icon: Cable, label: "Eléctrico" },
];

const Home = () => (
  <>
    {/* HERO */}
    <section className="relative isolate overflow-hidden">
      <img src={hero} alt="Bodega FERREMAS" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 gradient-hero" />
      <div className="container py-24 md:py-36">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
            Distribuidora desde 1985
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight text-white text-balance md:text-6xl">
            Todo para construir,<br />
            <span className="text-primary">renovar y reparar.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Herramientas, materiales eléctricos, pinturas y seguridad de las mejores marcas. Compra online con retiro en tienda o despacho a domicilio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/catalogo">
                Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
              <Link to="/sucursales">Encuentra una sucursal</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* BENEFITS */}
    <section className="border-y border-border bg-card">
      <div className="container grid gap-6 py-10 md:grid-cols-4">
        {[
          { icon: Truck, title: "Despacho a domicilio", text: "En la Región Metropolitana y regiones." },
          { icon: Store, title: "Retiro en tienda", text: "En cualquiera de nuestras 7 sucursales." },
          { icon: CreditCard, title: "Múltiples medios de pago", text: "Débito, crédito y transferencia." },
          { icon: ShieldCheck, title: "Marcas confiables", text: "Bosch, Makita, Stanley, Sika." },
        ].map((b) => (
          <div key={b.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <b.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* CATEGORIES */}
    <section className="container py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold">Categorías destacadas</h2>
          <p className="mt-2 text-muted-foreground">Encuentra rápidamente lo que necesitas.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.label}
            to={`/catalogo?cat=${c.label}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-elegant"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground transition-transform group-hover:scale-110">
              <c.icon className="h-6 w-6" />
            </span>
            <span className="font-semibold">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>

    {/* PRODUCTS */}
    <section className="container py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold">Productos destacados</h2>
          <p className="mt-2 text-muted-foreground">Lo más vendido esta semana.</p>
        </div>
        <Button asChild variant="outline" className="hidden md:inline-flex">
          <Link to="/catalogo">Ver todo</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container my-16">
      <div className="overflow-hidden rounded-2xl gradient-dark p-10 text-secondary-foreground md:p-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl text-balance">
              ¿Eres profesional o constructora?
            </h2>
            <p className="mt-4 text-secondary-foreground/80">
              Accede a precios mayoristas, despachos coordinados y atención dedicada en cualquiera de nuestras sucursales.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/sucursales">Contáctanos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default Home;
