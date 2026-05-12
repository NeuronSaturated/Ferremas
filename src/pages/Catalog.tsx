import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const cats = ["Todos", "Herramientas", "Construcción", "Pinturas", "Eléctrico", "Seguridad"] as const;
const PAGE_SIZE = 8;

const Catalog = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("cat") ?? "Todos";
  const initialQ = params.get("q") ?? "";
  const [cat, setCat] = useState<string>(initial);
  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(1);

  // Sincroniza el input con el query param (cuando se busca desde el header)
  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const list = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "Todos" || p.category === cat) &&
        (q === "" || `${p.name} ${p.brand} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))
    );
  }, [cat, q]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setPage(1);
  }, [cat, q]);

  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="container py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold">Catálogo</h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} productos disponibles en línea · {totalPages} páginas
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto, SKU o marca..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <Button
              key={c}
              variant={cat === c ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCat(c);
                if (c === "Todos") params.delete("cat");
                else params.set("cat", c);
                setParams(params, { replace: true });
              }}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No se encontraron productos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.length)} de {list.length}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === page ? "default" : "outline"}
                  size="sm"
                  className="min-w-10"
                  onClick={() => goTo(n)}
                >
                  {n}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goTo(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Catalog;
