import { apiFetch, getSessionToken } from "@/lib/api";

// Helpers del frontend para Webpay Plus. Mantienen las llamadas Transbank
// concentradas en un solo archivo, aunque las credenciales y la logica real
// siempre viven en el backend.

type CreateWebpayResponse = {
  token: string;
  url: string;
  buyOrder: string;
  sessionId: string;
  amount: number;
};

type CommitWebpayResponse = {
  order: {
    id: string;
    total: number;
  };
  transaction: {
    status?: string;
    response_code?: number;
  };
};

export const createWebpayTransaction = async (payload: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
  }>;
  shipping: number;
  delivery: "retiro" | "despacho";
  branch: string;
}) =>
  // Crea la transaccion en el backend y recibe la URL/token_ws que exige Webpay.
  // El total se vuelve a validar en el servidor, asi el cliente no decide el monto.
  apiFetch<CreateWebpayResponse>("/api/payments/webpay/create", {
    method: "POST",
    token: getSessionToken(),
    body: JSON.stringify(payload),
  });

export const commitWebpayTransaction = async (token: string) =>
  // Confirma el token_ws despues del retorno de Transbank. El backend revisa si
  // fue autorizado antes de marcar el pedido como pagado.
  apiFetch<CommitWebpayResponse>("/api/payments/webpay/commit", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const redirectToWebpay = (url: string, token: string) => {
  // Webpay Plus espera recibir token_ws por POST, no como query param. Por eso
  // se crea un formulario temporal y se envia automaticamente al usuario.
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "token_ws";
  input.value = token;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
};
