import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ExternalLink, Mail, MapPin, Navigation, Phone, Warehouse } from "lucide-react";
import santiagoCentro from "@/assets/branch-santiago-centro.jpg";
import maipu from "@/assets/branch-maipu.jpg";
import providencia from "@/assets/branch-providencia.jpg";
import nunoa from "@/assets/branch-nunoa.jpg";
import vina from "@/assets/branch-vina.jpg";
import concepcion from "@/assets/branch-concepcion.jpg";
import laserena from "@/assets/branch-laserena.jpg";

const branches = [
  // Aqui se guardan datos estaticos de sucursales para la demo.
  // En un proyecto mayor esta parte podria venir desde la base de datos.
  {
    slug: "santiago-centro",
    name: "Santiago Centro",
    address: "Av. Libertador Bernardo O'Higgins 1234, Santiago, Chile",
    phone: "+56 2 2345 6789",
    hours: "L-V 8:30-19:00 / S 9:00-14:00",
    region: "Metropolitana",
    image: santiagoCentro,
    manager: "Marcela Rojas",
    email: "santiago.centro@ferremas.cl",
    services: ["Retiro en tienda", "Meson constructor", "Corte de tableros", "Despacho programado"],
    note: "Sucursal principal para compras de alto volumen, herramientas electricas y materiales de obra.",
  },
  {
    slug: "maipu",
    name: "Maipu",
    address: "Av. Pajaritos 5678, Maipu, Chile",
    phone: "+56 2 2456 7891",
    hours: "L-V 9:00-19:00 / S 9:00-14:00",
    region: "Metropolitana",
    image: maipu,
    manager: "Diego Araya",
    email: "maipu@ferremas.cl",
    services: ["Retiro en tienda", "Pinturas preparadas", "Arriendo de herramientas", "Estacionamiento"],
    note: "Buena opcion para retiro rapido de pinturas, fijaciones, gasfiteria y herramientas de uso domestico.",
  },
  {
    slug: "providencia",
    name: "Providencia",
    address: "Av. Providencia 2010, Providencia, Chile",
    phone: "+56 2 2567 8901",
    hours: "L-V 9:00-20:00",
    region: "Metropolitana",
    image: providencia,
    manager: "Camila Fuentes",
    email: "providencia@ferremas.cl",
    services: ["Retiro en tienda", "Asesoria tecnica", "Electricidad", "Pagos Webpay"],
    note: "Pensada para compras rapidas, reposicion de insumos y asesoria en proyectos de mantencion.",
  },
  {
    slug: "nunoa",
    name: "Nunoa",
    address: "Av. Irarrazaval 3456, Nunoa, Chile",
    phone: "+56 2 2678 9012",
    hours: "L-V 9:00-19:00 / S 9:00-14:00",
    region: "Metropolitana",
    image: nunoa,
    manager: "Tomas Valdes",
    email: "nunoa@ferremas.cl",
    services: ["Retiro en tienda", "Ceramicas", "Gasfiteria", "Cotizaciones"],
    note: "Foco en terminaciones, banos, cocinas y materiales para remodelacion de departamentos.",
  },
  {
    slug: "vina-del-mar",
    name: "Vina del Mar",
    address: "Av. Libertad 890, Vina del Mar, Chile",
    phone: "+56 32 234 5678",
    hours: "L-V 9:00-19:00",
    region: "Valparaiso",
    image: vina,
    manager: "Javiera Morales",
    email: "vina@ferremas.cl",
    services: ["Retiro en tienda", "Despacho regional", "Seguridad industrial", "Materiales de exterior"],
    note: "Atiende pedidos para Vina del Mar, Valparaiso y comunas cercanas con despacho coordinado.",
  },
  {
    slug: "concepcion",
    name: "Concepcion",
    address: "O'Higgins 654, Concepcion, Chile",
    phone: "+56 41 222 3344",
    hours: "L-V 9:00-19:00",
    region: "Biobio",
    image: concepcion,
    manager: "Matias Cardenas",
    email: "concepcion@ferremas.cl",
    services: ["Retiro en tienda", "Venta empresa", "Obra gruesa", "Despacho programado"],
    note: "Sucursal orientada a constructoras, maestros y compras planificadas para obra.",
  },
  {
    slug: "la-serena",
    name: "La Serena",
    address: "Av. Francisco de Aguirre 321, La Serena, Chile",
    phone: "+56 51 221 1122",
    hours: "L-V 9:00-19:00",
    region: "Coquimbo",
    image: laserena,
    manager: "Valentina Pizarro",
    email: "laserena@ferremas.cl",
    services: ["Retiro en tienda", "Jardin", "Pinturas", "Despacho regional"],
    note: "Ideal para compras de hogar, jardin y mantencion con cobertura en La Serena y Coquimbo.",
  },
];

const getMapsUrls = (address: string) => {
  // En esta parte se crean URLs de Google Maps: una para abrir ruta y otra para
  // mostrar el mapa embebido dentro de la pagina de detalle.
  const encodedAddress = encodeURIComponent(address);

  return {
    route: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    embed: `https://www.google.com/maps?q=${encodedAddress}&output=embed`,
  };
};

const Branches = () => (
  // Aqui se listan las sucursales como tarjetas navegables.
  <section className="container py-12">
    <header className="max-w-2xl">
      <h1 className="text-4xl font-extrabold">Sucursales FERREMAS</h1>
      <p className="mt-3 text-muted-foreground">
        4 sucursales en la Region Metropolitana y 3 en regiones, con retiro en tienda, soporte de venta y despacho
        programado.
      </p>
    </header>

    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {branches.map((branch) => (
        <Card key={branch.slug} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
          <Link to={`/sucursales/${branch.slug}`} className="block h-full">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={branch.image}
                alt={`Sucursal FERREMAS ${branch.name}`}
                loading="lazy"
                decoding="async"
                width={1024}
                height={640}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold">{branch.name}</h2>
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                  {branch.region}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {branch.address}
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {branch.phone}
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {branch.hours}
                </li>
              </ul>
              <span className="mt-5 inline-flex text-sm font-semibold text-primary">Ver informacion y mapa</span>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  </section>
);

export const BranchDetail = () => {
  // Aca se muestra una sucursal individual con datos, servicios y mapa.
  const { slug } = useParams();
  const branch = branches.find((item) => item.slug === slug);

  if (!branch) {
    return <Navigate to="/sucursales" replace />;
  }

  const mapsUrl = getMapsUrls(branch.address);

  return (
    <section className="container py-10">
      <Button asChild variant="ghost" className="mb-6 px-0 text-muted-foreground hover:text-foreground">
        <Link to="/sucursales">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a sucursales
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={branch.image}
              alt={`Sucursal FERREMAS ${branch.name}`}
              width={1024}
              height={640}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6">
            <Badge className="bg-secondary text-secondary-foreground">{branch.region}</Badge>
            <h1 className="mt-3 text-4xl font-extrabold">{branch.name}</h1>
            <p className="mt-3 text-muted-foreground">{branch.note}</p>

            <div className="mt-6">
              <Button asChild>
                <a href={mapsUrl.route} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir ruta en Google Maps
                </a>
              </Button>
            </div>

            <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">Direccion</dt>
                  <dd className="text-muted-foreground">{branch.address}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">Telefono</dt>
                  <dd className="text-muted-foreground">{branch.phone}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">Horario</dt>
                  <dd className="text-muted-foreground">{branch.hours}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Warehouse className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">Encargado</dt>
                  <dd className="text-muted-foreground">{branch.manager}</dd>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <dt className="font-semibold">Correo</dt>
                  <dd className="text-muted-foreground">{branch.email}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-2">
              {branch.services.map((service) => (
                <span key={service} className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </article>

        <aside className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Navigation className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-bold">Mapa interactivo</h2>
              <p className="text-sm text-muted-foreground">Puedes mover, acercar y abrir la ruta en Google Maps.</p>
            </div>
          </div>
          <iframe
            title={`Mapa sucursal FERREMAS ${branch.name}`}
            src={mapsUrl.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[560px] w-full border-0"
          />
        </aside>
      </div>
    </section>
  );
};

export default Branches;
