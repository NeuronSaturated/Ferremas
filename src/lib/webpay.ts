import { apiFetch, getSessionToken } from "@/lib/api";

// Aqui se concentran los helpers frontend de Webpay Plus.
// En esta parte solo se pide iniciar o confirmar el pago; las credenciales,
// validacion del monto y comunicacion real con Transbank viven en el backend.

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
  // Aqui se crea la transaccion en el backend y se recibe url + token_ws.
  // Aca el cliente no decide el monto final, porque el servidor lo recalcula.
  apiFetch<CreateWebpayResponse>("/api/payments/webpay/create", {
    method: "POST",
    token: getSessionToken(),
    body: JSON.stringify(payload),
  });

export const commitWebpayTransaction = async (token: string) =>
  // En esta parte se confirma token_ws despues del retorno de Transbank.
  // El backend revisa si fue autorizado antes de marcar el pedido como pagado.
  apiFetch<CommitWebpayResponse>("/api/payments/webpay/commit", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const redirectToWebpay = (url: string, token: string) => {
  // Webpay Plus espera token_ws por POST, no por query param. Aqui se crea un
  // formulario temporal para enviar al usuario al portal oficial de pago.
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
