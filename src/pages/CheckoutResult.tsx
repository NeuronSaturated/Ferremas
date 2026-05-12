import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCLP } from "@/data/products";
import { commitWebpayTransaction } from "@/lib/webpay";
import { AlertCircle, CheckCircle2, LoaderCircle, ReceiptText } from "lucide-react";

const CheckoutResult = () => {
  const { user, refreshUser } = useAuth();
  const { clear } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [title, setTitle] = useState("Confirmando pago");
  const [description, setDescription] = useState(
    "Estamos validando la transaccion con Transbank."
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (!user || processedRef.current) return;
    processedRef.current = true;

    const aborted = searchParams.get("status") === "aborted";
    const token = searchParams.get("token_ws");

    if (aborted || !token) {
      setStatus("error");
      setTitle("Pago no completado");
      setDescription("La transaccion fue cancelada, expiro o no pudo volver correctamente.");
      return;
    }

    const finalizePayment = async () => {
      try {
        const response = await commitWebpayTransaction(token);
        await refreshUser();
        clear();
        setOrderId(response.order.id);
        setAmount(response.order.total);
        setStatus("success");
        setTitle("Pago aprobado");
        setDescription(`Tu compra fue autorizada por ${formatCLP(response.order.total)}.`);
      } catch (error) {
        setStatus("error");
        setTitle("No se pudo confirmar el pago");
        setDescription(
          error instanceof Error
            ? error.message
            : "Ocurrio un error al confirmar la transaccion."
        );
      }
    };

    void finalizePayment();
  }, [clear, refreshUser, searchParams, user]);

  return (
    <section className="container py-24">
      <Card className="mx-auto max-w-2xl overflow-hidden p-0 shadow-xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-10 text-center md:text-left">
            <div
              className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
                status === "success"
                  ? "bg-success/15 text-success"
                  : status === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : status === "error" ? (
                <AlertCircle className="h-8 w-8" />
              ) : (
                <LoaderCircle className="h-8 w-8 animate-spin" />
              )}
            </div>

            <h1 className="mt-6 text-3xl font-bold">{title}</h1>
            <p className="mt-3 max-w-md text-muted-foreground">{description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant={status === "success" ? "outline" : "default"}>
                <Link to="/catalogo">Seguir comprando</Link>
              </Button>
              <Button asChild>
                <Link to={status === "success" ? "/perfil?tab=orders" : "/carrito"}>
                  {status === "success" ? "Ver mis compras" : "Volver al carrito"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-l border-border bg-muted/30 p-10">
            <div className="flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Resumen del pago</h2>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="font-semibold">{status === "success" ? "Aprobado" : "No confirmado"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Pedido</dt>
                <dd className="font-semibold">{orderId ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Monto</dt>
                <dd className="font-semibold">{amount ? formatCLP(amount) : "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Medio</dt>
                <dd className="font-semibold">Webpay Plus</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default CheckoutResult;
