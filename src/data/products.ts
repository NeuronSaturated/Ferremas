import drill from "@/assets/product-drill.jpg";
import hammer from "@/assets/product-hammer.jpg";
import paint from "@/assets/product-paint.jpg";
import screws from "@/assets/product-screws.jpg";
import helmet from "@/assets/product-helmet.jpg";
import grinder from "@/assets/product-grinder.jpg";
import cable from "@/assets/product-cable.jpg";

// Imágenes específicas por producto
import saw from "@/assets/product-saw.jpg";
import screwdriverElectric from "@/assets/product-screwdriver-electric.jpg";
import toolbox from "@/assets/product-toolbox.jpg";
import wrench from "@/assets/product-wrench.jpg";
import screwdriverSet from "@/assets/product-screwdriver-set.jpg";
import heatgun from "@/assets/product-heatgun.jpg";
import benchDrill from "@/assets/product-bench-drill.jpg";
import sander from "@/assets/product-sander.jpg";
import pipewrench from "@/assets/product-pipewrench.jpg";
import cement from "@/assets/product-cement.jpg";
import sand from "@/assets/product-sand.jpg";
import brick from "@/assets/product-brick.jpg";
import osb from "@/assets/product-osb.jpg";
import mesh from "@/assets/product-mesh.jpg";
import nails from "@/assets/product-nails.jpg";
import adhesive from "@/assets/product-adhesive.jpg";
import plaster from "@/assets/product-plaster.jpg";
import tile from "@/assets/product-tile.jpg";
import enamel from "@/assets/product-enamel.jpg";
import latexBucket from "@/assets/product-latex-bucket.jpg";
import varnish from "@/assets/product-varnish.jpg";
import brush from "@/assets/product-brush.jpg";
import roller from "@/assets/product-roller.jpg";
import thinner from "@/assets/product-thinner.jpg";
import anticorrosive from "@/assets/product-anticorrosive.jpg";
import sealant from "@/assets/product-sealant.jpg";
import tray from "@/assets/product-tray.jpg";
import spray from "@/assets/product-spray.jpg";
import switchProd from "@/assets/product-switch.jpg";
import outlet from "@/assets/product-outlet.jpg";
import panel from "@/assets/product-panel.jpg";
import breaker from "@/assets/product-breaker.jpg";
import rcd from "@/assets/product-rcd.jpg";
import bulb from "@/assets/product-bulb.jpg";
import ledtube from "@/assets/product-ledtube.jpg";
import extension from "@/assets/product-extension.jpg";
import detector from "@/assets/product-detector.jpg";
import gloves from "@/assets/product-gloves.jpg";
import mask from "@/assets/product-mask.jpg";
import boots from "@/assets/product-boots.jpg";
import harness from "@/assets/product-harness.jpg";
import vest from "@/assets/product-vest.jpg";
import earplugs from "@/assets/product-earplugs.jpg";
import extinguisher from "@/assets/product-extinguisher.jpg";
import glasses from "@/assets/product-glasses.jpg";
import firstaid from "@/assets/product-firstaid.jpg";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: "Herramientas" | "Construcción" | "Pinturas" | "Eléctrico" | "Seguridad";
  price: number;
  stock: number;
  image: string;
  description: string;
};

const seed: Omit<Product, "id" | "sku">[] = [
  // Herramientas
  { name: "Taladro Percutor Inalámbrico 18V", brand: "Bosch", category: "Herramientas", price: 89990, stock: 24, image: drill, description: "Taladro percutor profesional de 18V con batería de litio, ideal para trabajos pesados en madera, metal y concreto." },
  { name: "Martillo Carpintero 16oz", brand: "Stanley", category: "Herramientas", price: 12490, stock: 87, image: hammer, description: "Martillo de uña con mango de madera ergonómico, ideal para clavar y extraer clavos." },
  { name: "Esmeril Angular 4½\" 850W", brand: "Makita", category: "Herramientas", price: 49990, stock: 18, image: grinder, description: "Esmeril angular profesional para corte y desbaste, motor 850W, mango antivibración." },
  { name: "Sierra Circular 7¼\" 1400W", brand: "Bosch", category: "Herramientas", price: 79990, stock: 14, image: saw, description: "Sierra circular profesional con guía láser, ideal para cortes precisos en madera." },
  { name: "Atornillador Eléctrico 12V", brand: "Makita", category: "Herramientas", price: 39990, stock: 32, image: screwdriverElectric, description: "Atornillador inalámbrico compacto con torque ajustable y 2 baterías." },
  { name: "Caja de Herramientas 20 piezas", brand: "Stanley", category: "Herramientas", price: 24990, stock: 45, image: toolbox, description: "Set completo con destornilladores, llaves, alicates y martillo en estuche resistente." },
  { name: "Llave Inglesa Ajustable 12\"", brand: "Stanley", category: "Herramientas", price: 9990, stock: 73, image: wrench, description: "Llave inglesa cromada de alta resistencia, mordaza ajustable hasta 35mm." },
  { name: "Set Destornilladores 12pz", brand: "Bosch", category: "Herramientas", price: 14990, stock: 56, image: screwdriverSet, description: "Juego de destornilladores Phillips y planos con mango ergonómico antideslizante." },
  { name: "Pistola de Calor 2000W", brand: "Bosch", category: "Herramientas", price: 34990, stock: 22, image: heatgun, description: "Pistola de aire caliente con temperatura regulable de 50° a 600°C." },
  { name: "Taladro de Banco 350W", brand: "Makita", category: "Herramientas", price: 119990, stock: 8, image: benchDrill, description: "Taladro de columna con 5 velocidades, ideal para taller y trabajos de precisión." },
  { name: "Lijadora Orbital 240W", brand: "Bosch", category: "Herramientas", price: 44990, stock: 19, image: sander, description: "Lijadora orbital con sistema de aspiración y velocidad variable." },
  { name: "Llave de Tubo 14\"", brand: "Stanley", category: "Herramientas", price: 18990, stock: 41, image: pipewrench, description: "Llave Stillson de acero forjado para fontanería y trabajos pesados." },

  // Construcción
  { name: "Set de Tornillos Inox 200pz", brand: "Stanley", category: "Construcción", price: 7990, stock: 156, image: screws, description: "Surtido de tornillos y tuercas en acero inoxidable de distintas medidas." },
  { name: "Cemento Gris 25kg", brand: "Sika", category: "Construcción", price: 5990, stock: 200, image: cement, description: "Cemento de uso general para hormigones, morteros y estucos." },
  { name: "Saco de Arena Fina 25kg", brand: "FERREMAS", category: "Construcción", price: 2990, stock: 180, image: sand, description: "Arena seleccionada y tamizada para mezclas de mortero." },
  { name: "Ladrillo Fiscal (unidad)", brand: "FERREMAS", category: "Construcción", price: 390, stock: 1200, image: brick, description: "Ladrillo de arcilla cocida para muros estructurales y tabiques." },
  { name: "Plancha OSB 11mm 1.22x2.44m", brand: "FERREMAS", category: "Construcción", price: 18990, stock: 64, image: osb, description: "Tablero estructural de virutas orientadas para construcción y revestimiento." },
  { name: "Malla Acma C92 6x2.15m", brand: "FERREMAS", category: "Construcción", price: 22990, stock: 35, image: mesh, description: "Malla de acero electrosoldada para refuerzo de losas y radieres." },
  { name: "Clavo Punta París 3\" 1kg", brand: "Stanley", category: "Construcción", price: 3490, stock: 220, image: nails, description: "Clavo galvanizado para construcción y carpintería estructural." },
  { name: "Adhesivo de Construcción 600ml", brand: "Sika", category: "Construcción", price: 8990, stock: 78, image: adhesive, description: "Sellador adhesivo de poliuretano de alta resistencia para múltiples superficies." },
  { name: "Yeso 25kg", brand: "Sika", category: "Construcción", price: 4990, stock: 95, image: plaster, description: "Yeso para terminaciones interiores, fácil aplicación y rápido secado." },
  { name: "Cerámica Blanca 45x45 (caja)", brand: "FERREMAS", category: "Construcción", price: 14990, stock: 60, image: tile, description: "Cerámica esmaltada para piso y muro, rendimiento 1.62m² por caja." },

  // Pinturas
  { name: "Esmalte Sintético Blanco 1 Galón", brand: "Sika", category: "Pinturas", price: 18990, stock: 42, image: enamel, description: "Pintura esmalte de alta cobertura, acabado brillante, resistente a la intemperie." },
  { name: "Pintura Látex Interior 5 Gal", brand: "Sika", category: "Pinturas", price: 34990, stock: 21, image: latexBucket, description: "Pintura látex lavable de alta cobertura para interiores, terminación mate." },
  { name: "Látex Exterior 1 Galón", brand: "Sika", category: "Pinturas", price: 22990, stock: 38, image: paint, description: "Pintura acrílica exterior con protección UV y antihongos." },
  { name: "Barniz Marino 1 Litro", brand: "Sika", category: "Pinturas", price: 12990, stock: 47, image: varnish, description: "Barniz transparente con filtro UV, resistente al agua y la sal." },
  { name: "Brocha Profesional 3\"", brand: "FERREMAS", category: "Pinturas", price: 4990, stock: 120, image: brush, description: "Brocha de cerda mixta con mango ergonómico, ideal para esmaltes y látex." },
  { name: "Rodillo Antigota 22cm", brand: "FERREMAS", category: "Pinturas", price: 5990, stock: 95, image: roller, description: "Rodillo profesional con cubierta antigota, incluye marco metálico." },
  { name: "Diluyente para Esmalte 1L", brand: "Sika", category: "Pinturas", price: 4490, stock: 80, image: thinner, description: "Diluyente sintético para limpieza de herramientas y dilución de esmaltes." },
  { name: "Pintura Anticorrosiva Roja 1Gal", brand: "Sika", category: "Pinturas", price: 19990, stock: 28, image: anticorrosive, description: "Esmalte base óxido para protección de superficies metálicas." },
  { name: "Sellador Acrílico Blanco 280ml", brand: "Sika", category: "Pinturas", price: 3990, stock: 140, image: sealant, description: "Sellador para grietas y juntas en muros, pintable y flexible." },
  { name: "Bandeja para Pintura Plástica", brand: "FERREMAS", category: "Pinturas", price: 2990, stock: 110, image: tray, description: "Bandeja resistente compatible con rodillos hasta 25cm." },
  { name: "Spray Multicolor 400ml", brand: "Sika", category: "Pinturas", price: 5490, stock: 160, image: spray, description: "Aerosol de secado rápido para múltiples superficies, varios colores disponibles." },

  // Eléctrico
  { name: "Cable Eléctrico THHN 2.5mm 25m", brand: "Bosch", category: "Eléctrico", price: 22490, stock: 38, image: cable, description: "Rollo de cable eléctrico THHN para instalaciones residenciales e industriales." },
  { name: "Cable Eléctrico THHN 4mm 100m", brand: "Bosch", category: "Eléctrico", price: 79990, stock: 14, image: cable, description: "Cable de cobre con aislación termoplástica, ideal para instalaciones fijas." },
  { name: "Interruptor Simple 9/12", brand: "FERREMAS", category: "Eléctrico", price: 1990, stock: 220, image: switchProd, description: "Interruptor de empotrar con placa blanca, 10A 250V." },
  { name: "Enchufe Doble Schuko", brand: "FERREMAS", category: "Eléctrico", price: 3490, stock: 180, image: outlet, description: "Enchufe doble con tierra de protección para instalaciones modernas." },
  { name: "Tablero Eléctrico 12 Polos", brand: "Bosch", category: "Eléctrico", price: 39990, stock: 22, image: panel, description: "Caja de distribución con riel DIN para automáticos y diferenciales." },
  { name: "Automático 16A Curva C", brand: "Bosch", category: "Eléctrico", price: 6990, stock: 95, image: breaker, description: "Interruptor automático monopolar para protección de circuitos." },
  { name: "Diferencial 2x40A 30mA", brand: "Bosch", category: "Eléctrico", price: 24990, stock: 41, image: rcd, description: "Protector diferencial bipolar contra fugas a tierra." },
  { name: "Foco LED 9W E27 (pack 4)", brand: "FERREMAS", category: "Eléctrico", price: 9990, stock: 130, image: bulb, description: "Pack de 4 ampolletas LED luz cálida, equivalente 60W incandescente." },
  { name: "Tubo LED 18W 1.20m", brand: "FERREMAS", category: "Eléctrico", price: 7990, stock: 88, image: ledtube, description: "Tubo LED T8 alta eficiencia, vida útil 30.000 horas." },
  { name: "Alargador 5m con 4 Tomas", brand: "FERREMAS", category: "Eléctrico", price: 8990, stock: 72, image: extension, description: "Extensión eléctrica con interruptor y protección contra sobrecargas." },
  { name: "Multiherramienta Detector", brand: "Bosch", category: "Eléctrico", price: 49990, stock: 16, image: detector, description: "Detector de cables, metales y vigas en muros con pantalla LCD." },

  // Seguridad
  { name: "Casco de Seguridad + Antiparras", brand: "FERREMAS", category: "Seguridad", price: 9490, stock: 65, image: helmet, description: "Kit de protección personal certificado, casco amarillo y antiparras claras." },
  { name: "Guantes de Cuero Reforzado", brand: "FERREMAS", category: "Seguridad", price: 4990, stock: 180, image: gloves, description: "Guantes de cuero vacuno con refuerzo en palma, talla universal." },
  { name: "Mascarilla N95 (pack 10)", brand: "FERREMAS", category: "Seguridad", price: 12990, stock: 90, image: mask, description: "Respirador con filtro 95% de partículas, certificación NIOSH." },
  { name: "Zapatos de Seguridad Punta de Acero", brand: "FERREMAS", category: "Seguridad", price: 39990, stock: 48, image: boots, description: "Calzado industrial con punta de acero y suela antideslizante." },
  { name: "Arnés de Seguridad 4 Argollas", brand: "FERREMAS", category: "Seguridad", price: 49990, stock: 22, image: harness, description: "Arnés de cuerpo completo para trabajos en altura, certificado." },
  { name: "Chaleco Reflectante Naranjo", brand: "FERREMAS", category: "Seguridad", price: 4490, stock: 200, image: vest, description: "Chaleco de alta visibilidad con cintas reflectantes 360°." },
  { name: "Tapones Auditivos (par)", brand: "FERREMAS", category: "Seguridad", price: 1990, stock: 350, image: earplugs, description: "Protectores auditivos de silicona reutilizables, atenuación 27dB." },
  { name: "Extintor PQS 6kg ABC", brand: "FERREMAS", category: "Seguridad", price: 29990, stock: 35, image: extinguisher, description: "Extintor polvo químico seco para fuegos clase A, B y C." },
  { name: "Lentes Oscuros Industriales", brand: "FERREMAS", category: "Seguridad", price: 5990, stock: 140, image: glasses, description: "Lentes de seguridad con protección UV para soldadura ligera." },
  { name: "Botiquín Primeros Auxilios", brand: "FERREMAS", category: "Seguridad", price: 14990, stock: 60, image: firstaid, description: "Botiquín completo para obras y oficinas, 50 elementos." },
];

export const products: Product[] = seed.map((p, i) => ({
  ...p,
  id: `p${i + 1}`,
  sku: `FM-${String(i + 1).padStart(3, "0")}`,
}));

export const formatCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
