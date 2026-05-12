import { apiFetch, getSessionToken } from "@/lib/api";

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
  apiFetch<CreateWebpayResponse>("/api/payments/webpay/create", {
    method: "POST",
    token: getSessionToken(),
    body: JSON.stringify(payload),
  });

export const commitWebpayTransaction = async (token: string) =>
  apiFetch<CommitWebpayResponse>("/api/payments/webpay/commit", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const redirectToWebpay = (url: string, token: string) => {
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
