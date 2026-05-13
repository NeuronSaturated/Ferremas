import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCLP } from "@/data/products";
import { branches } from "@/data/operations";
import { useProducts } from "@/lib/product-api";
import {
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  Wallet,
  Users,
  Boxes,
  LogOut,
  RefreshCcw,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, clearAdminToken, getAdminToken } from "@/lib/api";

type OrderStatus = "Pendiente" | "Aprobado" | "Preparando" | "Listo" | "Despachado" | "Rechazado";
type PaymentStatus = "Confirmado" | "Pendiente";

type AdminOrder = {
  id: string;
  customer: string;
  items: { id: string; name: string; qty: number; price: number; image: string }[];
  total: number;
  delivery: "retiro" | "despacho";
  payment: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  date: string;
  branch: string;
};

const statusColors: Record<OrderStatus, string> = {
  Pendiente: "bg-warning text-warning-foreground",
  Aprobado: "bg-accent text-accent-foreground",
  Preparando: "bg-primary text-primary-foreground",
  Listo: "bg-accent text-accent-foreground",
  Despachado: "bg-success text-success-foreground",
  Rechazado: "bg-destructive text-destructive-foreground",
};

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
};

const StatCard = ({ icon: Icon, label, value, sub }: StatCardProps) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="mt-2 text-3xl font-extrabold">{value}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </Card>
);

const Panel = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [branchFilter, setBranchFilter] = useState("Todas");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const loadOrders = useCallback(async (showSpinner = false) => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    if (showSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiFetch<{ orders: AdminOrder[] }>("/api/admin/orders", {
        method: "GET",
        token,
      });
      setOrders(response.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el panel.");
      clearAdminToken();
      navigate("/admin", { replace: true });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const updateOrder = async (id: string, patch: Partial<Pick<AdminOrder, "status" | "paymentStatus">>, msg: string) => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const response = await apiFetch<{ order: AdminOrder }>(`/api/admin/orders/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(patch),
      });
      setOrders((prev) => prev.map((order) => (order.id === id ? response.order : order)));
      toast.success(msg);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el pedido.");
    }
  };

  const logout = async () => {
    const token = getAdminToken();

    try {
      if (token) {
        await apiFetch("/api/admin/logout", {
          method: "POST",
          token,
        });
      }
    } catch {
      // Si falla el logout remoto, igual limpiamos sesion local.
    } finally {
      clearAdminToken();
      toast.success("Sesion cerrada");
      navigate("/admin", { replace: true });
    }
  };

  const totalRevenue = useMemo(
    () => orders.filter((order) => order.status !== "Rechazado").reduce((sum, order) => sum + order.total, 0),
    [orders]
  );
  const displayedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (statusFilter === "Todos" || order.status === statusFilter) &&
          (paymentFilter === "Todos" || order.paymentStatus === paymentFilter) &&
          (branchFilter === "Todas" || order.branch === branchFilter)
      ),
    [branchFilter, orders, paymentFilter, statusFilter]
  );
  const lowStock = products.filter((product) => product.stock < 25);
  const realBranchStats = branches.map((branch) => {
    const branchOrders = orders.filter((order) => order.branch === branch);
    const approved = branchOrders.filter((order) => order.paymentStatus === "Confirmado").length;
    const ratio = branchOrders.length === 0 ? 0 : approved / branchOrders.length;
    return { branch, ratio, orders: branchOrders.length };
  });

  if (loading) {
    return (
      <section className="container py-16">
        <Card className="p-10 text-center text-muted-foreground">Cargando panel operativo...</Card>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              Panel persistente
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              Pedidos reales
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold">Panel de operaciones</h1>
          <p className="mt-2 text-muted-foreground">
            Esta vista ahora consume usuarios y compras reales guardadas en SQLite.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadOrders(true)} disabled={refreshing}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={() => void logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesion
          </Button>
        </div>
      </header>

      <Tabs defaultValue="vendedor" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="vendedor">Vendedor</TabsTrigger>
          <TabsTrigger value="bodeguero">Bodeguero</TabsTrigger>
          <TabsTrigger value="contador">Contador</TabsTrigger>
          <TabsTrigger value="admin">Administrador</TabsTrigger>
        </TabsList>

        <TabsContent value="vendedor" className="space-y-6">
          <Card className="grid gap-3 p-4 md:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {["Todos", "Pendiente", "Aprobado", "Preparando", "Listo", "Despachado", "Rechazado"].map((status) => (
                <option key={status} value={status}>
                  Estado: {status}
                </option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {["Todos", "Pendiente", "Confirmado"].map((status) => (
                <option key={status} value={status}>
                  Pago: {status}
                </option>
              ))}
            </select>
            <select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {["Todas", ...branches].map((branch) => (
                <option key={branch} value={branch}>
                  Sucursal: {branch}
                </option>
              ))}
            </select>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={ClipboardCheck} label="Pedidos pendientes" value={orders.filter((order) => order.status === "Pendiente").length} sub="Requieren tu aprobacion" />
            <StatCard icon={Package} label="En preparacion" value={orders.filter((order) => order.status === "Preparando" || order.status === "Aprobado").length} />
            <StatCard icon={Truck} label="Despachados" value={orders.filter((order) => order.status === "Despachado").length} />
          </div>

          <Card className="overflow-x-auto">
            <div className="border-b border-border p-4 font-semibold">Pedidos por aprobar</div>
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Entrega</th>
                  <th className="px-4 py-3">Sucursal</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.delivery === "retiro" ? "Retiro en tienda" : "Despacho a domicilio"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.branch}</td>
                    <td className="px-4 py-3 font-semibold">{formatCLP(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {order.status === "Pendiente" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                              Ver detalle
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => void updateOrder(order.id, { status: "Rechazado" }, `${order.id} rechazado`)}>
                              <XCircle className="mr-1 h-3 w-3" />
                              Rechazar
                            </Button>
                            <Button size="sm" onClick={() => void updateOrder(order.id, { status: "Aprobado" }, `${order.id} aprobado y enviado a bodega`)}>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Aprobar
                            </Button>
                          </>
                        )}
                        {order.status === "Listo" && (
                          <>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                            Ver detalle
                          </Button>
                          <Button size="sm" onClick={() => void updateOrder(order.id, { status: "Despachado" }, `${order.id} despachado al cliente`)}>
                            <Truck className="mr-1 h-3 w-3" />
                            Despachar
                          </Button>
                          </>
                        )}
                        {order.status !== "Pendiente" && order.status !== "Listo" && (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                            Ver detalle
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedOrders.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      No hay pedidos con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="bodeguero" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={Boxes} label="Productos en bodega" value={products.reduce((sum, product) => sum + product.stock, 0)} />
            <StatCard icon={Package} label="Por preparar" value={orders.filter((order) => order.status === "Aprobado").length} />
            <StatCard icon={ClipboardCheck} label="Stock bajo" value={lowStock.length} sub="< 25 unidades" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="border-b border-border p-4 font-semibold">Ordenes para preparar</div>
              <ul className="divide-y divide-border">
                {orders
                  .filter((order) => order.status === "Aprobado" || order.status === "Preparando")
                  .map((order) => (
                    <li key={order.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {order.id} - {order.customer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length} producto(s) - {order.branch}
                          </p>
                        </div>
                        <Badge className={statusColors[order.status]}>{order.status}</Badge>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {order.items.map((item) => (
                          <li key={`${order.id}-${item.id}`}>- {item.qty} x {item.name}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex gap-2">
                        {order.status === "Aprobado" && (
                          <Button size="sm" variant="outline" onClick={() => void updateOrder(order.id, { status: "Preparando" }, `Preparando ${order.id}`)}>
                            Iniciar preparacion
                          </Button>
                        )}
                        {order.status === "Preparando" && (
                          <Button size="sm" onClick={() => void updateOrder(order.id, { status: "Listo" }, `${order.id} listo para despacho`)}>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Marcar como listo
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                {orders.filter((order) => order.status === "Aprobado" || order.status === "Preparando").length === 0 && (
                  <li className="p-8 text-center text-sm text-muted-foreground">Sin ordenes pendientes.</li>
                )}
              </ul>
            </Card>

            <Card>
              <div className="border-b border-border p-4 font-semibold">Inventario de referencia</div>
              <ul className="divide-y divide-border">
                {products.slice(0, 6).map((product) => (
                  <li key={product.id} className="flex items-center gap-3 p-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <Badge className={product.stock < 25 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}>
                      {product.stock} u
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contador" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard icon={DollarSign} label="Ingresos del periodo" value={formatCLP(totalRevenue)} />
            <StatCard icon={Wallet} label="Pagos pendientes" value={orders.filter((order) => order.paymentStatus === "Pendiente").length} sub="Transferencias por confirmar" />
            <StatCard icon={CheckCircle2} label="Pagos confirmados" value={orders.filter((order) => order.paymentStatus === "Confirmado").length} />
          </div>

          <Card className="overflow-x-auto">
            <div className="border-b border-border p-4 font-semibold">Conciliacion de pagos</div>
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Metodo</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado pago</th>
                  <th className="px-4 py-3 text-right">Accion</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.payment}</td>
                    <td className="px-4 py-3 font-semibold">{formatCLP(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge className={order.paymentStatus === "Confirmado" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {order.paymentStatus === "Pendiente" && (
                        <Button size="sm" onClick={() => void updateOrder(order.id, { paymentStatus: "Confirmado" }, `Pago de ${order.id} confirmado`)}>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Confirmar pago
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard icon={DollarSign} label="Ventas registradas" value={formatCLP(totalRevenue)} />
            <StatCard icon={ClipboardCheck} label="Pedidos totales" value={orders.length} />
            <StatCard icon={Users} label="Sucursales activas" value={branches.length} />
            <StatCard icon={Boxes} label="SKU activos" value={products.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Desempeño por sucursal</h3>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <ul className="space-y-3">
                {realBranchStats.map((branchStat) => (
                  <li key={branchStat.branch}>
                    <div className="flex justify-between text-sm">
                      <span>{branchStat.branch}</span>
                      <span className="font-medium">
                        {branchStat.orders === 0 ? "Sin pedidos" : `${Math.round(branchStat.ratio * 100)}%`}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full gradient-primary" style={{ width: `${branchStat.ratio * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {branchStat.orders} pedido(s) registrado(s)
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Estado del sistema</h3>
              <ul className="space-y-3 text-sm">
                {[
                  {
                    title: "Base de datos SQLite local",
                    state: "Activa",
                    badge: "bg-success text-success-foreground",
                  },
                  {
                    title: "Checkout Webpay Plus",
                    state: "Conectado",
                    badge: "bg-success text-success-foreground",
                  },
                  {
                    title: "Usuarios con sesiones reales",
                    state: "Activa",
                    badge: "bg-success text-success-foreground",
                  },
                  {
                    title: "Despliegue productivo",
                    state: "Pendiente",
                    badge: "bg-warning text-warning-foreground",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-center justify-between rounded-md border border-border p-3">
                    <span>{item.title}</span>
                    <Badge className={item.badge}>{item.state}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle {selectedOrder.id}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedOrder.customer}</p>
                  <p className="mt-3 text-xs uppercase text-muted-foreground">Entrega</p>
                  <p>
                    {selectedOrder.delivery === "retiro" ? "Retiro en tienda" : "Despacho a domicilio"} ·{" "}
                    {selectedOrder.branch}
                  </p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Pago</p>
                  <p className="font-semibold">{selectedOrder.payment}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                    <Badge className={selectedOrder.paymentStatus === "Confirmado" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-border">
                <div className="border-b border-border p-3 font-semibold">Productos</div>
                <div className="divide-y divide-border">
                  {selectedOrder.items.map((item) => (
                    <div key={`${selectedOrder.id}-${item.id}`} className="flex items-center justify-between gap-3 p-3 text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.qty} unidad(es) · {formatCLP(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCLP(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-border p-3 font-bold">
                  <span>Total</span>
                  <span>{formatCLP(selectedOrder.total)}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {selectedOrder.paymentStatus === "Pendiente" && (
                  <Button onClick={() => void updateOrder(selectedOrder.id, { paymentStatus: "Confirmado" }, `Pago de ${selectedOrder.id} confirmado`)}>
                    Confirmar pago
                  </Button>
                )}
                {selectedOrder.status === "Pendiente" && (
                  <Button onClick={() => void updateOrder(selectedOrder.id, { status: "Aprobado" }, `${selectedOrder.id} aprobado`)}>
                    Aprobar pedido
                  </Button>
                )}
                {selectedOrder.status === "Aprobado" && (
                  <Button onClick={() => void updateOrder(selectedOrder.id, { status: "Preparando" }, `Preparando ${selectedOrder.id}`)}>
                    Iniciar preparación
                  </Button>
                )}
                {selectedOrder.status === "Preparando" && (
                  <Button onClick={() => void updateOrder(selectedOrder.id, { status: "Listo" }, `${selectedOrder.id} listo`)}>
                    Marcar listo
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Panel;
