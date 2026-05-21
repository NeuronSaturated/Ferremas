import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatCLP } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Package, Truck, ShieldCheck } from "lucide-react";
import { useProducts } from "@/lib/product-api";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

type DisplayCurrency = "CLP" | "USD" | "BRL" | "GBP";

type ExchangeConversion = {
  from: DisplayCurrency;
  to: "CLP";
  amount: number;
  rate: number;
  converted: number;
  date: string;
  source: string;
  series: string;
};

const currencyOptions = [
  { code: "CLP", flag: "🇨🇱", label: "Chile" },
  { code: "USD", flag: "🇺🇸", label: "Estados Unidos" },
  { code: "BRL", flag: "🇧🇷", label: "Brasil" },
  { code: "GBP", flag: "🇬🇧", label: "Reino Unido" },
] as const;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t } = useLanguage();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("CLP");
  const [exchangeResult, setExchangeResult] = useState<ExchangeConversion | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const displayPrice = useMemo(() => {
    if (!product) return "";
    if (displayCurrency === "CLP") return formatCLP(product.price);
    if (!exchangeResult?.rate) return formatCLP(product.price);

    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(product.price / exchangeResult.rate);
  }, [displayCurrency, exchangeResult, product]);

  useEffect(() => {
    if (!product || displayCurrency === "CLP") {
      setExchangeResult(null);
      setExchangeError(null);
      return;
    }

    const controller = new AbortController();

    const loadExchangeRate = async () => {
      setExchangeLoading(true);
      setExchangeError(null);

      try {
        // El producto conserva su precio base en CLP. La API BDE solo aporta
        // la tasa oficial para mostrar la misma cifra referencial en otra moneda.
        const response = await apiFetch<ExchangeConversion>(
          `/api/exchange/convert?from=${displayCurrency}&amount=1`,
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

    loadExchangeRate();

    return () => controller.abort();
  }, [displayCurrency, product]);

  if (!product) {
    return (
      <section className="container py-24 text-center">
        <h1 className="text-3xl font-bold">{t("productNotFound")}</h1>
        <Button asChild className="mt-6">
          <Link to="/catalogo">{t("backToCatalog")}</Link>
        </Button>
      </section>
    );
  }

  const handleAdd = () => {
    add(product);
  };

  return (
    <section className="container py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit bg-secondary text-secondary-foreground">{product.category}</Badge>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">{product.name}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("sku")}: <span className="font-mono">{product.sku}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-extrabold text-foreground">{displayPrice}</span>
            <span className="text-sm text-muted-foreground">
              {displayCurrency === "CLP" ? t("vatIncluded") : t("referenceRate")}
            </span>
            <div className="flex rounded-lg border border-border p-1" aria-label="Moneda de referencia">
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setDisplayCurrency(option.code)}
                  className={`flex h-9 w-10 items-center justify-center rounded-md text-lg transition-colors ${
                    displayCurrency === option.code ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  aria-label={`Ver precio en ${option.label}`}
                  title={option.label}
                >
                  {option.flag}
                </button>
              ))}
            </div>
          </div>

          {displayCurrency !== "CLP" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {exchangeLoading
                ? "Consultando Banco Central..."
                : exchangeResult
                  ? `1 ${displayCurrency} = ${formatCLP(exchangeResult.rate)}. ${t("finalPaymentClp")}`
                  : exchangeError}
            </p>
          )}

          <div className="mt-6 flex items-center gap-2">
            <Package className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              {product.stock > 0 ? `${product.stock} ${t("available")}` : t("outOfStock")}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-semibold">{t("description")}</h2>
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={handleAdd} disabled={product.stock === 0} className="flex-1 shadow-glow">
              <ShoppingCart className="mr-2 h-5 w-5" /> {t("addToCart")}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/catalogo">{t("keepBrowsing")}</Link>
            </Button>
          </div>

          <Card className="mt-8 grid gap-4 p-5 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t("shippingTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("shippingText")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t("warrantyTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("warrantyText")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t("pickupTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("pickupText")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
