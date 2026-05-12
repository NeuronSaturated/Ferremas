import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, Address, PaymentMethod } from "@/context/AuthContext";
import { formatCLP } from "@/data/products";
import {
  formatRut,
  isValidRut,
  formatPhoneLocal,
  fullPhone,
  cleanPhone,
  formatCard,
  formatExpiry,
  maskCard,
} from "@/lib/format";
import { User, MapPin, CreditCard, Package, LogOut, Save, Database } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "data";
  const [tab, setTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== tab) setTab(currentTab);
  }, [searchParams, tab]);

  const handleTabChange = (value: string) => {
    setTab(value);
    setSearchParams(value === "data" ? {} : { tab: value }, { replace: true });
  };

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [rut, setRut] = useState(user?.rut ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [addr, setAddr] = useState<Address>(
    user?.address ?? { street: "", number: "", apt: "", commune: "", region: "", reference: "" }
  );
  const [pay, setPay] = useState<PaymentMethod>(
    user?.payment ?? { holder: "", number: "", expiry: "", type: "credito" }
  );

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setRut(user.rut);
    setPhone(user.phone);
    setAddr(
      user.address ?? { street: "", number: "", apt: "", commune: "", region: "", reference: "" }
    );
    setPay(user.payment ?? { holder: "", number: "", expiry: "", type: "credito" });
  }, [user]);

  if (!user) return null;

  const onSavePersonal = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidRut(rut)) return toast.error("RUT invalido");
    if (cleanPhone(phone).length !== 8) return toast.error("Telefono debe tener 8 digitos");
    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) return toast.error("Email invalido");

    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        email: emailTrimmed,
        rut: formatRut(rut),
        phone: cleanPhone(phone),
      });
    } finally {
      setSaving(false);
    }
  };

  const onSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!addr.street || !addr.number || !addr.commune || !addr.region) {
      return toast.error("Completa los campos obligatorios");
    }

    setSaving(true);
    try {
      await updateProfile({ address: addr });
    } finally {
      setSaving(false);
    }
  };

  const onSavePayment = async (e: FormEvent) => {
    e.preventDefault();
    const digits = pay.number.replace(/\s/g, "");
    if (digits.length < 13) return toast.error("Numero de tarjeta invalido");
    if (pay.expiry.length !== 5) return toast.error("Fecha de expiracion invalida (MM/AA)");
    if (!pay.holder.trim()) return toast.error("Ingresa el nombre del titular");

    setSaving(true);
    try {
      await updateProfile({ payment: pay });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <section className="container py-12">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground">
            <User className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold">Hola, {user.firstName}</h1>
            <p className="text-muted-foreground">
              {user.email} - {fullPhone(user.phone)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-primary" />
            Datos persistidos en SQLite
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesion
          </Button>
        </div>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="data">
            <User className="mr-2 h-4 w-4" />
            Datos
          </TabsTrigger>
          <TabsTrigger value="address">
            <MapPin className="mr-2 h-4 w-4" />
            Domicilio
          </TabsTrigger>
          <TabsTrigger value="card">
            <CreditCard className="mr-2 h-4 w-4" />
            Tarjeta
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-6">
          <Card className="p-8">
            <h2 className="mb-6 text-xl font-bold">Datos personales</h2>
            <form onSubmit={onSavePersonal} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">Nombre</Label>
                <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ln">Apellido</Label>
                <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  inputMode="text"
                  autoCapitalize="characters"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ph">Telefono movil</Label>
                <div className="flex max-w-xs">
                  <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                    +569
                  </span>
                  <Input
                    id="ph"
                    value={formatPhoneLocal(phone)}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="mt-6">
          <Card className="p-8">
            <h2 className="mb-6 text-xl font-bold">Direccion de despacho</h2>
            <form onSubmit={onSaveAddress} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="st">Calle *</Label>
                <Input id="st" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nm">Numero *</Label>
                <Input id="nm" value={addr.number} onChange={(e) => setAddr({ ...addr, number: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ap">Depto / Casa</Label>
                <Input id="ap" value={addr.apt} onChange={(e) => setAddr({ ...addr, apt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co">Comuna *</Label>
                <Input id="co" value={addr.commune} onChange={(e) => setAddr({ ...addr, commune: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg">Region *</Label>
                <Input id="rg" value={addr.region} onChange={(e) => setAddr({ ...addr, region: e.target.value })} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rf">Referencia (opcional)</Label>
                <Input id="rf" value={addr.reference} onChange={(e) => setAddr({ ...addr, reference: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar direccion"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="card" className="mt-6">
          <Card className="p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Datos bancarios</h2>
                <p className="text-sm text-muted-foreground">
                  Esta seccion queda como referencia local de tu cuenta. El cobro real se hace en
                  Webpay Plus de Transbank.
                </p>
              </div>
              {user.payment && (
                <Badge variant="secondary" className="font-mono">
                  {maskCard(user.payment.number)}
                </Badge>
              )}
            </div>
            <form onSubmit={onSavePayment} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="holder">Titular de la tarjeta</Label>
                <Input id="holder" value={pay.holder} onChange={(e) => setPay({ ...pay, holder: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="card">Numero de tarjeta</Label>
                <Input id="card" value={pay.number} onChange={(e) => setPay({ ...pay, number: formatCard(e.target.value) })} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Vencimiento</Label>
                <Input id="exp" value={pay.expiry} onChange={(e) => setPay({ ...pay, expiry: formatExpiry(e.target.value) })} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={pay.type}
                  onChange={(e) => setPay({ ...pay, type: e.target.value as "credito" | "debito" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="credito">Credito</option>
                  <option value="debito">Debito</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar tarjeta"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="p-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Historial de compras</h2>
                <p className="text-sm text-muted-foreground">
                  Tus pedidos ahora se guardan en la base de datos del backend.
                </p>
              </div>
              <Badge variant="outline">{user.orders.length} pedido(s)</Badge>
            </div>

            {user.orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-10 w-10 opacity-50" />
                Aun no tienes compras registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden border-border/70 p-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-5 py-4">
                      <div>
                        <p className="font-bold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.paymentStatus === "Confirmado" ? "default" : "secondary"}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge>{order.status}</Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.qty}x {item.name}
                            </span>
                            <span>{formatCLP(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">
                          {order.delivery === "retiro" ? `Retiro en tienda - ${order.branch}` : "Despacho a domicilio"} - {order.payment}
                        </span>
                        <span className="font-bold">{formatCLP(order.total)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Profile;
