import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { formatCLP, type Product } from "@/data/products";
import { fetchProducts } from "@/lib/product-api";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  showStock?: boolean;
};

const hydrateProducts = async (matches: Array<Omit<Product, "image"> & { imageKey: string }>) => {
  const products = await fetchProducts();
  const byId = new Map(products.map((product) => [product.id, product]));
  return matches.map((product) => byId.get(product.id)).filter(Boolean) as Product[];
};

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hola, soy el asistente FERREMAS. Pregúntame por productos, pagos, retiro o despacho.",
    },
  ]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [loading, messages, open]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const response = await apiFetch<{
        reply: string;
        products: Array<Omit<Product, "image"> & { imageKey: string }>;
        showStock?: boolean;
      }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, customerName: user?.firstName }),
      });
      const products = await hydrateProducts(response.products);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.reply, products, showStock: Boolean(response.showStock) },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error instanceof Error ? error.message : "No pude responder en este momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[460px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-semibold">Asistente FERREMAS</p>
              <p className="text-xs text-muted-foreground">Catálogo, stock y pagos</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-10 bg-primary text-primary-foreground"
                    : "mr-6 bg-muted text-foreground"
                }`}
              >
                <p>{message.text}</p>
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.products.map((product) => (
                      <Link
                        key={product.id}
                        to={`/producto/${product.id}`}
                        className="flex items-center gap-2 rounded-md bg-background p-2 text-foreground hover:bg-card"
                        onClick={() => setOpen(false)}
                      >
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{product.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {message.showStock
                              ? `${formatCLP(product.price)} · Stock ${product.stock}`
                              : formatCLP(product.price)}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-sm text-muted-foreground">Escribiendo respuesta...</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Buscar taladro, despacho..."
              aria-label="Mensaje para el asistente"
            />
            <Button type="submit" size="icon" disabled={loading} aria-label="Enviar mensaje">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      )}

      <Button size="lg" className="h-12 rounded-full shadow-xl" onClick={() => setOpen((value) => !value)}>
        <MessageCircle className="mr-2 h-5 w-5" />
        Ayuda
      </Button>
    </div>
  );
};

export default ChatWidget;
