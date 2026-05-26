import type { Product } from "@/data/products";
import { formatCLP } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useMachineTranslation } from "@/hooks/useMachineTranslation";
import { Link, useNavigate } from "react-router-dom";

const getCategoryKey = (category: Product["category"]) => {
  if (category === "Herramientas") return "categoryTools";
  if (category === "Construcción") return "categoryConstruction";
  if (category === "Pinturas") return "categoryPaints";
  if (category === "Eléctrico") return "categoryElectrical";
  return "categorySafety";
};

const ProductCard = ({ product }: { product: Product }) => {
  // Aqui cada producto del catalogo se muestra como tarjeta clickeable.
  const { add } = useCart();
  const { t } = useLanguage();
  const [translatedName] = useMachineTranslation([product.name]);
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/producto/${product.id}`);

  return (
    <article
      onClick={goToDetail}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant focus-within:ring-2 focus-within:ring-primary"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">{t(getCategoryKey(product.category))}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug hover:text-primary">
          <Link to={`/producto/${product.id}`} onClick={(e) => e.stopPropagation()}>
            {translatedName}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("sku")}: {product.sku} - {t("stock")}: {product.stock}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-extrabold text-foreground">{formatCLP(product.price)}</span>
          <Button
            size="sm"
            disabled={product.stock === 0}
            onClick={(e) => {
              // En esta parte se detiene el click de la tarjeta para agregar al
              // carrito sin navegar al detalle del producto.
              e.stopPropagation();
              add(product);
            }}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {t("add")}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
