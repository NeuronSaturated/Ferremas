import { Link, useNavigate, useParams } from "react-router-dom";
import { formatCLP } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Package, Truck, ShieldCheck } from "lucide-react";
import { useProducts } from "@/lib/product-api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <section className="container py-24 text-center">
        <h1 className="text-3xl font-bold">Producto no encontrado</h1>
        <Button asChild className="mt-6">
          <Link to="/catalogo">Volver al catálogo</Link>
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <Badge className="w-fit bg-secondary text-secondary-foreground">{product.category}</Badge>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">{product.name}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            SKU: <span className="font-mono">{product.sku}</span>
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-foreground">{formatCLP(product.price)}</span>
            <span className="text-sm text-muted-foreground">IVA incluido</span>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Package className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
            </span>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-semibold">Descripción</h2>
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={handleAdd} disabled={product.stock === 0} className="flex-1 shadow-glow">
              <ShoppingCart className="mr-2 h-5 w-5" /> Agregar al carrito
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/catalogo">Seguir explorando</Link>
            </Button>
          </div>

          <Card className="mt-8 grid gap-4 p-5 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Despacho a todo Chile</p>
                <p className="text-xs text-muted-foreground">2 a 5 días hábiles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Garantía oficial</p>
                <p className="text-xs text-muted-foreground">12 meses fábrica</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Retiro en tienda</p>
                <p className="text-xs text-muted-foreground">Gratis en 6 sucursales</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
