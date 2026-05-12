export type OrderStatus = "Pendiente" | "Aprobado" | "Preparando" | "Listo" | "Despachado" | "Rechazado";
export type PaymentMethod = "Débito" | "Crédito" | "Transferencia";

export type Order = {
  id: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  delivery: "Retiro en tienda" | "Despacho a domicilio";
  payment: PaymentMethod;
  paymentStatus: "Confirmado" | "Pendiente";
  status: OrderStatus;
  date: string;
  branch: string;
};

export const orders: Order[] = [
  {
    id: "ORD-1042", customer: "Juan Pérez", date: "2026-04-19", branch: "Santiago Centro",
    items: [{ name: "Taladro Percutor 18V", qty: 1, price: 89990 }, { name: "Set Tornillos 200pz", qty: 2, price: 7990 }],
    total: 105970, delivery: "Despacho a domicilio", payment: "Crédito", paymentStatus: "Confirmado", status: "Pendiente",
  },
  {
    id: "ORD-1043", customer: "María González", date: "2026-04-19", branch: "Maipú",
    items: [{ name: "Casco + Antiparras", qty: 3, price: 9490 }],
    total: 28470, delivery: "Retiro en tienda", payment: "Transferencia", paymentStatus: "Pendiente", status: "Pendiente",
  },
  {
    id: "ORD-1044", customer: "Constructora ABC", date: "2026-04-18", branch: "Providencia",
    items: [{ name: "Esmeril 4½\"", qty: 4, price: 49990 }, { name: "Cable THHN 25m", qty: 6, price: 22490 }],
    total: 334900, delivery: "Despacho a domicilio", payment: "Transferencia", paymentStatus: "Confirmado", status: "Aprobado",
  },
  {
    id: "ORD-1045", customer: "Pedro Soto", date: "2026-04-18", branch: "Santiago Centro",
    items: [{ name: "Pintura Látex 5 Gal", qty: 2, price: 34990 }],
    total: 69980, delivery: "Retiro en tienda", payment: "Débito", paymentStatus: "Confirmado", status: "Preparando",
  },
  {
    id: "ORD-1046", customer: "Ana Rojas", date: "2026-04-17", branch: "Ñuñoa",
    items: [{ name: "Martillo 16oz", qty: 1, price: 12490 }, { name: "Esmalte Blanco", qty: 1, price: 18990 }],
    total: 31480, delivery: "Despacho a domicilio", payment: "Crédito", paymentStatus: "Confirmado", status: "Despachado",
  },
];

export const branches = ["Santiago Centro", "Maipú", "Providencia", "Ñuñoa", "Viña del Mar", "Concepción", "La Serena"];

export const roles = [
  { name: "Administrador", responsibilities: ["Generar informes de venta mensual", "Generar informes de desempeño de la tienda", "Desarrollar estrategias de ventas y promociones"] },
  { name: "Vendedor / Encargado", responsibilities: ["Asesorar a los clientes en la selección de productos", "Recibir y procesar pedidos", "Gestionar los pagos y facturación"] },
  { name: "Bodeguero", responsibilities: ["Preparar y entregar los productos a los vendedores para su venta", "Asegurar el adecuado almacenamiento de los materiales", "Aceptar y preparar pedidos"] },
  { name: "Contador", responsibilities: ["Llevar el registro de las transacciones de venta", "Confirmar pagos por transferencia", "Elaborar balances y reportes financieros"] },
];
