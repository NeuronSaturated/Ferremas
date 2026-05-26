import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCLP } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  MapPin,
  CreditCard,
  Copy,
  Building2,
  ShieldCheck,
  Store,
  Globe2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fullPhone } from "@/lib/format";
import { createWebpayTransaction, redirectToWebpay } from "@/lib/webpay";
import { apiFetch, getSessionToken } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

const branches = [
  "Santiago Centro",
  "Maipu",
  "Providencia",
  "Nunoa",
  "Vina del Mar",
  "Concepcion",
  "La Serena",
];

type ExchangeConversion = {
  from: string;
  to: "CLP";
  amount: number;
  rate: number;
  converted: number;
  date: string;
  source: string;
  series: string;
};

const Cart = () => {
  // Aqui se completa el checkout: entrega, sucursal, pago, resumen y conversion.
  const { items, remove, setQty, total, clear } = useCart();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"retiro" | "despacho">("retiro");
  const [payment, setPayment] = useState<"webpay" | "transferencia">("webpay");
  const [done, setDone] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [branch, setBranch] = useState("Santiago Centro");
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  const [exchangeCurrency, setExchangeCurrency] = useState<"USD" | "BRL" | "GBP">("USD");
  const [exchangeResult, setExchangeResult] = useState<ExchangeConversion | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const shipping = delivery === "despacho" ? 4990 : 0;
  const finalTotal = total + shipping;
  const estimatedForeignTotal = useMemo(() => {
    // Aqui la API entrega "cuantos CLP vale 1 unidad extranjera"; para mostrar
    // el total en USD/BRL/GBP se hace la operacion inversa sobre el total oficial.
    if (!exchangeResult?.rate) return null;
    return finalTotal / exchangeResult.rate;
  }, [exchangeResult, finalTotal]);

  useEffect(() => {
    if (!exchangeEnabled) {
      setExchangeResult(null);
      setExchangeError(null);
      return;
    }

    const controller = new AbortController();

    const convertForeignCurrency = async () => {
      setExchangeLoading(true);
      setExchangeError(null);

      try {
        // En esta parte el backend mantiene las credenciales del Banco Central
        // ocultas y entrega el valor oficial de 1 moneda extranjera en CLP.
        // Aca solo se muestra referencia: Webpay cobra el total real en CLP.
        const response = await apiFetch<ExchangeConversion>(
          `/api/exchange/convert?from=${exchangeCurrency}&amount=1`,
          { signal: controller.signal }
        );
        setExchangeResult(response);
      } catch (error) {
        if (controller.signal.aborted) return;
        setExchangeResult(null);
        setExchangeError(error instanceof Error ? error.message : "No se pudo consultar Banco Central.");
      } finally {
        if (!controller.signal.aborted) {
          setExchangeLoading(false);
        }
      }
    };

    const debounce = window.setTimeout(convertForeignCurrency, 450);

    return () => {
      controller.abort();
      window.clearTimeout(debounce);
    };
  }, [exchangeCurrency, exchangeEnabled]);

  const validateCheckout = () => {
    if (!user) return false;
    if (items.length === 0) return false;

    if (delivery === "despacho" && !user.address) {
      toast.error("Debes agregar una direccion en tu perfil");
      navigate("/perfil?tab=address");
      return false;
    }

    return true;
  };

  const orderPayload = {
    items: items.map((it) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      qty: it.qty,
      image: it.image,
    })),
    shipping,
    delivery,
    branch,
  };

  const createTransferOrder = async () => {
    const token = getSessionToken();
    if (!token) return;

    setProcessing(true);

    try {
      const response = await apiFetch<{ order: { id: string } }>("/api/orders/transfer", {
        method: "POST",
        token,
        body: JSON.stringify(orderPayload),
      });

      await refreshUser();
      clear();
      setDone(response.order.id);
      toast.success(`Pedido ${response.order.id} registrado correctamente`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el pedido.");
    } finally {
      setProcessing(false);
    }
  };

  const startWebpayCheckout = async () => {
    setProcessing(true);

    try {
      // Aqui la pantalla no cobra directamente. Primero solicita al backend una
      // transaccion y luego envia al usuario a Webpay con el token_ws de Transbank.
      const response = await createWebpayTransaction(orderPayload);
      redirectToWebpay(response.url, response.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
      toast.error(message);
      setProcessing(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    if (payment === "transferencia") {
      setTransferOpen(true);
      return;
    }

    await startWebpayCheckout();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} ${t("copied")}`),
      () => toast.error(t("copyFailed"))
    );
  };

  if (done) {
    return (
      <section className="container py-24">
        <Card className="mx-auto max-w-lg p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">{t("orderRegistered")}</h1>
          <p className="mt-2 text-muted-foreground">
            <strong>{done}</strong>: {t("pendingManualPayment")}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/catalogo">{t("keepShopping")}</Link>
            </Button>
            <Button asChild>
              <Link to="/perfil?tab=orders">{t("seeMyOrders")}</Link>
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="container py-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold">{t("cartTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("cartSubtitle")}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{t("securePurchase")}</p>
          <p>{t("orderInHistory")}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="mt-10 p-16 text-center">
          <p className="text-lg text-muted-foreground">{t("emptyCart")}</p>
          <Button asChild className="mt-6">
            <Link to="/catalogo">{t("goToCatalog")}</Link>
          </Button>
        </Card>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((it) => (
              <Card key={it.id} className="flex gap-4 p-4">
                <img src={it.image} alt={it.name} className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">{it.brand}</p>
                      <h3 className="font-semibold">{it.name}</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(it.id)}
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(it.id, it.qty - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{it.qty}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(it.id, it.qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold">{formatCLP(it.price * it.qty)}</span>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t("contactData")}</h2>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <Link to="/perfil">{t("edit")}</Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{t("name")}</Label>
                  <Input value={`${user.firstName} ${user.lastName}`} disabled />
                </div>
                <div>
                  <Label>{t("email")}</Label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <Label>{t("phone")}</Label>
                  <Input value={fullPhone(user.phone)} disabled />
                </div>
                <div>
                  <Label>{t("rut")}</Label>
                  <Input value={user.rut} disabled />
                </div>
              </div>
            </Card>

            {delivery === "despacho" && (
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4" />
                    {t("dispatchAddress")}
                  </h2>
                  <Button type="button" variant="ghost" size="sm" asChild>
                    <Link to="/perfil?tab=address">{user.address ? t("edit") : t("addAddress")}</Link>
                  </Button>
                </div>
                {user.address ? (
                  <p className="text-sm text-muted-foreground">
                    {user.address.street} {user.address.number}
                    {user.address.apt ? `, ${user.address.apt}` : ""}, {user.address.commune},{" "}
                    {user.address.region}
                  </p>
                ) : (
                  <p className="text-sm text-destructive">
                    {t("missingAddress")}
                  </p>
                )}
              </Card>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
            <Card className="p-6">
              <h2 className="mb-4 font-semibold">{t("delivery")}</h2>
              <RadioGroup
                value={delivery}
                onValueChange={(value) => setDelivery(value as "retiro" | "despacho")}
                className="space-y-2"
              >
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-border p-3">
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value="retiro" id="retiro" />
                    <span>{t("storePickupOption")}</span>
                  </span>
                  <span className="text-sm text-success">{t("free")}</span>
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-border p-3">
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value="despacho" id="despacho" />
                    <span>{t("homeShipping")}</span>
                  </span>
                  <span className="text-sm">{formatCLP(4990)}</span>
                </label>
              </RadioGroup>
            </Card>

            {delivery === "retiro" && (
              <Card className="p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <Store className="h-4 w-4" />
                  {t("pickupBranch")}
                </h2>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {branches.map((branchName) => (
                    <option key={branchName} value={branchName}>
                      {branchName}
                    </option>
                  ))}
                </select>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4" />
                {t("paymentMethod")}
              </h2>
              <RadioGroup
                value={payment}
                onValueChange={(value) => setPayment(value as "webpay" | "transferencia")}
                className="space-y-2"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="webpay" id="webpay" className="mt-1" />
                  <div>
                    <p className="font-medium">{t("webpayName")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("webpayText")}
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="transferencia" id="transferencia" className="mt-1" />
                  <div>
                    <p className="font-medium">{t("bankTransfer")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("bankTransferText")}
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-muted-foreground">
                  {t("cardsHandledByWebpay")}
                </p>
              </div>

              <div className="mb-4 rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-semibold">
                      <Globe2 className="h-4 w-4 text-primary" />
                      {t("internationalPurchase")}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("internationalPurchaseText")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={exchangeEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExchangeEnabled((current) => !current)}
                  >
                    {exchangeEnabled ? t("hide") : t("seeTotal")}
                  </Button>
                </div>

                {exchangeEnabled && (
                  <div className="mt-4 rounded-md bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{t("totalIn")}</span>
                      <select
                        value={exchangeCurrency}
                        onChange={(event) => setExchangeCurrency(event.target.value as "USD" | "BRL" | "GBP")}
                        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        aria-label="Moneda extranjera"
                      >
                        <option value="USD">USD</option>
                        <option value="BRL">BRL</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>

                    <div className="mt-3 text-sm">
                      {exchangeLoading ? (
                        <p className="text-muted-foreground">{t("consultingCentralBank")}</p>
                      ) : exchangeResult && estimatedForeignTotal !== null ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{t("officialTotalToPay")}</p>
                          <p className="text-lg font-extrabold">{formatCLP(finalTotal)} CLP</p>
                          <p className="font-semibold text-primary">
                            {t("reference")}: {exchangeCurrency}{" "}
                            {estimatedForeignTotal.toLocaleString("es-CL", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1 {exchangeCurrency} = {formatCLP(exchangeResult.rate)}. {t("centralBankDate")}:{" "}
                            {exchangeResult.date}.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-destructive">{exchangeError}</p>
                      )}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  {t("foreignCurrencyNote")}
                </p>
              </div>

              <h2 className="mb-4 font-semibold">{t("summary")}</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("subtotal")}</dt>
                  <dd>{formatCLP(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("homeShipping")}</dt>
                  <dd>{formatCLP(shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("branches")}</dt>
                  <dd>{branch}</dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
                  <dt>{t("total")}</dt>
                  <dd>{formatCLP(finalTotal)}</dd>
                </div>
              </dl>
              <Button type="submit" size="lg" className="mt-6 w-full shadow-glow" disabled={processing}>
                {processing ? t("processing") : payment === "webpay" ? t("payWithTransbank") : t("confirmOrder")}
              </Button>
            </Card>
          </aside>
        </form>
      )}

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t("toTransfer")}
            </DialogTitle>
            <DialogDescription>
              {t("transferInstructions")}{" "}
              <strong className="text-foreground">{formatCLP(finalTotal)}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            {[
              { label: t("bank"), value: "Banco de Chile" },
              { label: t("accountType"), value: "Cuenta Corriente" },
              { label: t("accountNumber"), value: "001-23456-78" },
              { label: "RUT", value: "76.123.456-7" },
              { label: t("businessName"), value: "FERREMAS SpA" },
              { label: t("email"), value: "pagos@ferremas.cl" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-semibold">{row.value}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(row.value, row.label)}
                  aria-label={`Copiar ${row.label}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("amountToTransfer")}</p>
                <p className="text-lg font-extrabold text-primary">{formatCLP(finalTotal)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(String(finalTotal), t("amountToTransfer"))}
                aria-label="Copiar monto"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              {t("transferRutNote")} <strong>{user.rut}</strong>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={processing}
              onClick={async () => {
                setTransferOpen(false);
                await createTransferOrder();
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t("transferDone")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Cart;
