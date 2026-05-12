import { Card } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";
import santiagoCentro from "@/assets/branch-santiago-centro.jpg";
import maipu from "@/assets/branch-maipu.jpg";
import providencia from "@/assets/branch-providencia.jpg";
import nunoa from "@/assets/branch-nunoa.jpg";
import vina from "@/assets/branch-vina.jpg";
import concepcion from "@/assets/branch-concepcion.jpg";
import laserena from "@/assets/branch-laserena.jpg";

const branches = [
  { name: "Santiago Centro", address: "Av. Libertador 1234, Santiago", phone: "+56 2 2345 6789", hours: "L-V 8:30–19:00 / S 9:00–14:00", region: "Metropolitana", image: santiagoCentro },
  { name: "Maipú", address: "Av. Pajaritos 5678, Maipú", phone: "+56 2 2456 7891", hours: "L-V 9:00–19:00 / S 9:00–14:00", region: "Metropolitana", image: maipu },
  { name: "Providencia", address: "Av. Providencia 2010, Providencia", phone: "+56 2 2567 8901", hours: "L-V 9:00–20:00", region: "Metropolitana", image: providencia },
  { name: "Ñuñoa", address: "Av. Irarrázaval 3456, Ñuñoa", phone: "+56 2 2678 9012", hours: "L-V 9:00–19:00 / S 9:00–14:00", region: "Metropolitana", image: nunoa },
  { name: "Viña del Mar", address: "Av. Libertad 890, Viña del Mar", phone: "+56 32 234 5678", hours: "L-V 9:00–19:00", region: "Valparaíso", image: vina },
  { name: "Concepción", address: "O'Higgins 654, Concepción", phone: "+56 41 222 3344", hours: "L-V 9:00–19:00", region: "Biobío", image: concepcion },
  { name: "La Serena", address: "Av. Francisco de Aguirre 321, La Serena", phone: "+56 51 221 1122", hours: "L-V 9:00–19:00", region: "Coquimbo", image: laserena },
];

const Branches = () => (
  <section className="container py-12">
    <header className="max-w-2xl">
      <h1 className="text-4xl font-extrabold">Sucursales FERREMAS</h1>
      <p className="mt-3 text-muted-foreground">
        4 sucursales en la Región Metropolitana y 3 en regiones, con planes de expansión a todo Chile.
      </p>
    </header>

    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {branches.map((b) => (
        <Card key={b.name} className="overflow-hidden transition-shadow hover:shadow-lg">
          <div className="aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={b.image}
              alt={`Sucursal FERREMAS ${b.name}`}
              loading="lazy"
              width={1024}
              height={640}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{b.name}</h3>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">{b.region}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b.address}</li>
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b.phone}</li>
              <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b.hours}</li>
            </ul>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

export default Branches;
