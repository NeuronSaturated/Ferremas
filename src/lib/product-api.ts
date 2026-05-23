import { apiFetch } from "@/lib/api";
import { products as fallbackProducts, type Product } from "@/data/products";
import { useEffect, useState } from "react";

type ProductsResponse = {
  products: Array<Omit<Product, "image"> & { imageKey: string }>;
};

const fallbackById = new Map(fallbackProducts.map((product) => [product.id, product]));

const hydrateProduct = (product: ProductsResponse["products"][number]): Product => ({
  // Aqui se convierte el producto de base de datos al formato del frontend.
  // La base guarda imageKey, mientras React necesita una ruta real de imagen.
  ...product,
  image: product.imageKey?.startsWith("http") || product.imageKey?.startsWith("/")
    ? product.imageKey
    : product.imageKey
      ? `/catalog/${product.imageKey}`
      : fallbackById.get(product.id)?.image ?? fallbackProducts[0].image,
});

export const fetchProducts = async () => {
  try {
    // Aca se intenta usar el catalogo real del backend.
    const response = await apiFetch<ProductsResponse>("/api/products", { method: "GET" });
    return response.products.map(hydrateProduct);
  } catch {
    // Si el backend esta dormido o falla, aqui queda un catalogo local de respaldo.
    return fallbackProducts;
  }
};

export const getFallbackProducts = () => fallbackProducts;

export const useProducts = () => {
  // Aqui se expone el catalogo como hook para componentes y paginas.
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchProducts().then((nextProducts) => {
      if (mounted) {
        setProducts(nextProducts);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading };
};
