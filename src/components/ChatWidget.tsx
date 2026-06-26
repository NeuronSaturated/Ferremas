import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { formatCLP, type Product } from "@/data/products";
import { fetchProducts } from "@/lib/product-api";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useMachineTranslation } from "@/hooks/useMachineTranslation";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  showStock?: boolean;
};

const hydrateProducts = async (matches: Array<Omit<Product, "image"> & { imageKey: string }>) => {
  // Aqui el backend responde productos sin depender de imagenes importadas por Vite.
  // En esta parte se hidratan con el catalogo del frontend para mostrar tarjetas
  // bonitas dentro del chat sin duplicar rutas de assets en el servidor.
  const products = await fetchProducts();
  const byId = new Map(products.map((product) => [product.id, product]));
  return matches.map((product) => byId.get(product.id)).filter(Boolean) as Product[];
};

const ChatWidget = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionKeyRef = useRef(user?.id ?? "guest");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: t("chatWelcome"),
    },
  ]);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].role === "assistant"
        ? [{ ...prev[0], text: t("chatWelcome") }]
        : prev
    );
  }, [language, t]);

  useEffect(() => {
    // Aqui se reinicia la conversacion cuando cambia la sesion. Si un invitado
    // consulta algo y luego inicia sesion, el asistente parte limpio y puede
    // saludar usando el nombre del cliente autenticado.
    const sessionKey = user?.id ?? "guest";
    if (sessionKeyRef.current === sessionKey) return;

    sessionKeyRef.current = sessionKey;
    setMessages([
      {
        role: "assistant",
        text: t("chatWelcome"),
      },
    ]);
    setInput("");
    setLoading(false);
  }, [user?.id, t]);

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
        // Aqui se envia el nombre solo para personalizar saludos. El asistente no
        // persiste conversaciones ni usa este dato para decisiones sensibles.
        body: JSON.stringify({ message: text, customerName: user?.firstName, language }),
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
              <p className="font-semibold">{t("chatTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("chatSubtitle")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t("closeChat")}>
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
                      <ChatProductLink
                        key={product.id}
                        product={product}
                        showStock={Boolean(message.showStock)}
                        onOpenChange={setOpen}
                        stockLabel={t("stockLabel")}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-sm text-muted-foreground">{t("chatTyping")}</p>}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("chatPlaceholder")}
              aria-label={t("chatInputLabel")}
            />
            <Button type="submit" size="icon" disabled={loading} aria-label={t("sendMessage")}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      )}

      <Button size="lg" className="h-12 rounded-full shadow-xl" onClick={() => setOpen((value) => !value)}>
        <MessageCircle className="mr-2 h-5 w-5" />
        {t("help")}
      </Button>
    </div>
  );
};

const ChatProductLink = ({
  product,
  showStock,
  onOpenChange,
  stockLabel,
}: {
  product: Product;
  showStock: boolean;
  onOpenChange: (open: boolean) => void;
  stockLabel: string;
}) => {
  const [translatedName] = useMachineTranslation([product.name]);

  return (
    <Link
      to={`/producto/${product.id}`}
      className="flex items-center gap-2 rounded-md bg-background p-2 text-foreground hover:bg-card"
      onClick={() => onOpenChange(false)}
    >
      <img src={product.image} alt={translatedName} className="h-10 w-10 rounded object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{translatedName}</span>
        <span className="block text-xs text-muted-foreground">
          {showStock ? `${formatCLP(product.price)} - ${stockLabel} ${product.stock}` : formatCLP(product.price)}
        </span>
      </span>
    </Link>
  );
};

export default ChatWidget;

