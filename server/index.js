import "dotenv/config";
import express from "express";
import { randomUUID } from "node:crypto";
import {
  createSession,
  createTransferOrder,
  createUser,
  createWebpayOrderDraft,
  deleteSession,
  getAdminOrders,
  getDbPath,
  getOrderByWebpayToken,
  getProducts,
  getSession,
  getUserByEmail,
  getUserWithOrders,
  markWebpayOrderAuthorized,
  updateOrderAdminState,
  updateUserProfile,
  updateUserPassword,
} from "./db.js";
import { hashPassword, verifyPassword } from "./security.js";
import { getWebpayTransaction, isProductionTransbank } from "./transbank.js";
import { getExchangeRate, getSupportedExchangeCurrencies } from "./bcentral.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
const adminUser = process.env.ADMIN_USER || "admin";
const adminPass = process.env.ADMIN_PASS || "ferremas2026";
const allowedOrigins = new Set(
  [frontendUrl, ...(process.env.ALLOWED_ORIGINS || "").split(",")]
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
);

app.use((req, res, next) => {
  const origin = req.headers.origin?.replace(/\/$/, "");

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
};

const requireUserSession = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "Sesion requerida." });
  }

  try {
    const session = await getSession(token);
    if (!session || session.role !== "client" || !session.userId) {
      return res.status(401).json({ message: "Sesion invalida." });
    }

    const user = await getUserWithOrders(session.userId);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    req.sessionToken = token;
    req.session = session;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAdminSession = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: "Sesion de administrador requerida." });
  }

  try {
    const session = await getSession(token);
    if (!session || session.role !== "admin") {
      return res.status(401).json({ message: "Sesion de administrador invalida." });
    }

    req.sessionToken = token;
    req.session = session;
    return next();
  } catch (error) {
    return next(error);
  }
};

const sanitizeUserResponse = (user, token) => ({
  token,
  user,
});

const normalizeOrderPayload = async ({ items, shipping = 0, delivery, branch }) => {
  const products = await getProducts();
  const productById = new Map(products.map((product) => [product.id, product]));
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => ({
        id: String(item.id),
        name: productById.get(String(item.id))?.name || String(item.name),
        price: Number(productById.get(String(item.id))?.price ?? item.price),
        qty: Number(item.qty),
        image: productById.get(String(item.id))?.imageKey || String(item.image),
      }))
    : [];

  const hasInvalidItem = normalizedItems.some(
    (item) =>
      !item.id ||
      !productById.has(item.id) ||
      !item.name ||
      !Number.isFinite(item.price) ||
      item.price < 0 ||
      !Number.isFinite(item.qty) ||
      item.qty <= 0 ||
      !item.image
  );

  if (normalizedItems.length === 0 || hasInvalidItem) {
    throw new Error("Los productos del pedido son invalidos.");
  }

  const normalizedShipping = Number(shipping);
  const itemsTotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = itemsTotal + (Number.isFinite(normalizedShipping) ? normalizedShipping : 0);

  return {
    items: normalizedItems,
    shipping: Number.isFinite(normalizedShipping) ? normalizedShipping : 0,
    delivery: delivery === "despacho" ? "despacho" : "retiro",
    branch: typeof branch === "string" && branch.trim() ? branch.trim() : "Santiago Centro",
    total,
  };
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    environment: isProductionTransbank() ? "production" : "integration",
    database: getDbPath(),
  });
});

app.get("/api/products", async (_req, res, next) => {
  try {
    res.json({ products: await getProducts() });
  } catch (error) {
    next(error);
  }
});

app.get("/api/exchange/rate", async (req, res) => {
  try {
    // Endpoint usado por el frontend cuando solo necesita mostrar la tasa oficial
    // mas reciente publicada por Banco Central.
    const currency = String(req.query?.currency || "USD").trim().toUpperCase();
    const rate = await getExchangeRate(currency);
    return res.json({ rate, supported: getSupportedExchangeCurrencies() });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "No se pudo obtener el tipo de cambio.",
      supported: getSupportedExchangeCurrencies(),
    });
  }
});

app.get("/api/exchange/convert", async (req, res) => {
  try {
    // La evaluacion pide convertir moneda extranjera a moneda nacional.
    // Por eso este endpoint recibe USD/EUR y devuelve su equivalente en CLP.
    const from = String(req.query?.from || "USD").trim().toUpperCase();
    const amount = Number(req.query?.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Ingresa un monto mayor a cero." });
    }

    const rate = await getExchangeRate(from);
    const converted = Math.round(amount * rate.rate);

    return res.json({
      from,
      to: "CLP",
      amount,
      rate: rate.rate,
      converted,
      date: rate.date,
      source: rate.source,
      series: rate.series,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "No se pudo convertir la moneda.",
      supported: getSupportedExchangeCurrencies(),
    });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const rut = String(req.body?.rut || "").trim();
    const phone = String(req.body?.phone || "").trim();

    if (!email || !password || !firstName || !lastName || !rut || !phone) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    if (await getUserByEmail(email)) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese email." });
    }

    const user = await createUser({
      email,
      passwordHash: hashPassword(password),
      firstName,
      lastName,
      rut,
      phone,
    });

    const token = await createSession({ userId: user.id, role: "client" });
    return res.status(201).json(sanitizeUserResponse(await getUserWithOrders(user.id), token));
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return res.status(500).json({ message: "No se pudo crear la cuenta." });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await getUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Email o contraseña incorrectos." });
    }

    const token = await createSession({ userId: user.id, role: "client" });
    return res.json(sanitizeUserResponse(await getUserWithOrders(user.id), token));
  } catch (error) {
    console.error("Error iniciando sesion:", error);
    return res.status(500).json({ message: "No se pudo iniciar sesion." });
  }
});

app.get("/api/auth/me", requireUserSession, (req, res) => {
  res.json(sanitizeUserResponse(req.user, req.sessionToken));
});

app.post("/api/auth/signout", requireUserSession, async (req, res) => {
  await deleteSession(req.sessionToken);
  res.status(204).send();
});

app.patch("/api/auth/profile", requireUserSession, async (req, res) => {
  try {
    const nextEmail = String(req.body?.email || req.user.email).trim().toLowerCase();
    const emailOwner = await getUserByEmail(nextEmail);

    if (emailOwner && emailOwner.id !== req.user.id) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese email." });
    }

    const updated = await updateUserProfile(req.user.id, {
      firstName: String(req.body?.firstName || req.user.firstName).trim(),
      lastName: String(req.body?.lastName || req.user.lastName).trim(),
      email: nextEmail,
      rut: String(req.body?.rut || req.user.rut).trim(),
      phone: String(req.body?.phone || req.user.phone).trim(),
      address: req.body?.address ?? req.user.address,
      payment: req.body?.payment ?? req.user.payment,
    });

    return res.json({ user: updated });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return res.status(500).json({ message: "No se pudo actualizar el perfil." });
  }
});

app.patch("/api/auth/password", requireUserSession, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const nextPassword = String(req.body?.nextPassword || "");
    const user = await getUserByEmail(req.user.email);

    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(401).json({ message: "La contraseña actual no es correcta." });
    }

    if (nextPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
    }

    const updated = await updateUserPassword(req.user.id, hashPassword(nextPassword));
    return res.json({ user: updated });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return res.status(500).json({ message: "No se pudo cambiar la contraseña." });
  }
});

app.post("/api/auth/recover", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const user = email ? await getUserByEmail(email) : null;

  if (!user) {
    return res.json({
      message: "Si el correo existe, se enviaran instrucciones para recuperar la contraseña.",
    });
  }

  return res.json({
    message:
      "Recuperacion simulada para demo: entra a tu perfil y usa Cambiar contraseña. En produccion se enviaria un correo con token seguro.",
  });
});

app.post("/api/orders/transfer", requireUserSession, async (req, res) => {
  try {
    const payload = await normalizeOrderPayload(req.body || {});
    const order = await createTransferOrder({
      userId: req.user.id,
      total: payload.total,
      delivery: payload.delivery,
      branch: payload.branch,
      items: payload.items,
    });

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "No se pudo registrar el pedido.",
    });
  }
});

app.post("/api/payments/webpay/create", requireUserSession, async (req, res) => {
  try {
    const payload = await normalizeOrderPayload(req.body || {});
    const orderId = `ORD-${Date.now()}`;
    const sessionId = randomUUID();
    const returnUrl = `${backendUrl}/api/payments/webpay/return`;

    const transaction = getWebpayTransaction();
    const response = await transaction.create(orderId, sessionId, payload.total, returnUrl);

    await createWebpayOrderDraft({
      userId: req.user.id,
      orderId,
      total: payload.total,
      delivery: payload.delivery,
      branch: payload.branch,
      items: payload.items,
      webpayToken: response.token,
      sessionId,
    });

    return res.json({
      token: response.token,
      url: response.url,
      buyOrder: orderId,
      sessionId,
      amount: payload.total,
    });
  } catch (error) {
    console.error("Error creando transaccion Webpay Plus:", error);
    return res.status(500).json({
      message: "No se pudo iniciar el pago con Transbank.",
    });
  }
});

app.post("/api/payments/webpay/commit", async (req, res) => {
  try {
    const token = String(req.body?.token_ws || req.body?.token || "");

    if (!token) {
      return res.status(400).json({ message: "Falta token_ws para confirmar la transaccion." });
    }

    const order = await getOrderByWebpayToken(token);
    if (!order) {
      return res.status(404).json({ message: "No existe una orden asociada a ese pago." });
    }

    const transaction = getWebpayTransaction();
    const response = await transaction.commit(token);

    const isAuthorized =
      response.status === "AUTHORIZED" && Number(response.response_code ?? -1) === 0;

    if (!isAuthorized) {
      return res.status(400).json({
        message: "Transbank no autorizo el pago.",
        order,
        transaction: response,
      });
    }

    const paymentLabel = response.card_detail?.card_number
      ? `Webpay Plus - terminada en ${response.card_detail.card_number}`
      : "Webpay Plus (Transbank)";

    const updatedOrder = await markWebpayOrderAuthorized({
      orderId: order.id,
      paymentLabel,
      authorizationCode: String(response.authorization_code || ""),
      cardLast4: response.card_detail?.card_number || null,
    });

    return res.json({
      order: updatedOrder,
      transaction: response,
    });
  } catch (error) {
    console.error("Error confirmando transaccion Webpay Plus:", error);
    return res.status(500).json({
      message: "No se pudo confirmar el pago con Transbank.",
    });
  }
});

app.all("/api/payments/webpay/return", (req, res) => {
  const token = req.method === "POST" ? req.body?.token_ws : req.query?.token_ws;
  const tbkToken = req.method === "POST" ? req.body?.TBK_TOKEN : req.query?.TBK_TOKEN;
  const tbkOrder =
    req.method === "POST" ? req.body?.TBK_ORDEN_COMPRA : req.query?.TBK_ORDEN_COMPRA;

  if (!token) {
    const abortedUrl = new URL("/checkout/resultado", frontendUrl);
    abortedUrl.searchParams.set("status", "aborted");

    if (tbkToken) abortedUrl.searchParams.set("TBK_TOKEN", String(tbkToken));
    if (tbkOrder) abortedUrl.searchParams.set("TBK_ORDEN_COMPRA", String(tbkOrder));

    return res.redirect(abortedUrl.toString());
  }

  const successUrl = new URL("/checkout/resultado", frontendUrl);
  successUrl.searchParams.set("token_ws", String(token));
  return res.redirect(successUrl.toString());
});

app.post("/api/admin/login", async (req, res) => {
  const user = String(req.body?.user || "").trim();
  const pass = String(req.body?.pass || "");

  if (user !== adminUser || pass !== adminPass) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
  }

  const token = await createSession({ role: "admin" });
  return res.json({ token });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const products = await getProducts();

  if (!message) {
    return res.status(400).json({ message: "Escribe una pregunta para el asistente." });
  }

  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const normalizedMessage = normalize(message);
  const rawTerms = normalizedMessage.split(/[^a-z0-9]+/).filter(Boolean);
  const hasAny = (words) => words.some((word) => rawTerms.includes(word));

  if (rawTerms.length <= 2 && hasAny(["hola", "buenas", "buenos", "hey"])) {
    return res.json({
      reply:
        "Hola, soy el asistente de FERREMAS. Puedo ayudarte a encontrar productos, comparar precios, revisar stock, medios de pago, retiro y despacho.",
      products: [],
      showStock: false,
    });
  }

  if (hasAny(["webpay", "transbank", "pago", "pagos", "transferencia", "tarjeta"])) {
    return res.json({
      reply:
        "Puedes pagar con Webpay Plus o dejar el pedido por transferencia bancaria. En Webpay, el pago se confirma automáticamente al volver a FERREMAS.",
      products: [],
      showStock: false,
    });
  }

  if (hasAny(["despacho", "despachos", "envio", "envios", "retiro", "retirar", "sucursal", "sucursales"])) {
    return res.json({
      reply:
        "Puedes elegir retiro en tienda gratis o despacho a domicilio. Si eliges retiro, seleccionas la sucursal antes de confirmar el pedido.",
      products: [],
      showStock: false,
    });
  }

  const asksStock = hasAny(["stock", "disponible", "disponibles", "queda", "quedan", "tienen", "tiene", "hay"]);
  const stopwords = new Set([
    "ando",
    "buscando",
    "buscar",
    "busco",
    "comprar",
    "compro",
    "cotizar",
    "cotizo",
    "como",
    "consultar",
    "consulta",
    "de",
    "del",
    "el",
    "en",
    "estoy",
    "este",
    "esta",
    "funciona",
    "funcionan",
    "hola",
    "la",
    "las",
    "lo",
    "los",
    "me",
    "necesito",
    "saber",
    "para",
    "por",
    "quiero",
    "un",
    "una",
    "va",
    "ver",
    "y",
  ]);
  const terms = rawTerms.filter((term) => term.length >= 3 && !stopwords.has(term));

  const matches = products
    .map((product) => {
      const tokenize = (value) => normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
      const nameTerms = tokenize(product.name);
      const brandTerms = tokenize(product.brand);
      const categoryTerms = tokenize(product.category);
      const skuTerms = tokenize(product.sku);
      const descriptionTerms = tokenize(product.description);
      const hasTerm = (tokens, term) => {
        const tokenSet = new Set(tokens);
        return (
          tokenSet.has(term) ||
          tokenSet.has(term.replace(/s$/, "")) ||
          tokens.some((candidate) => candidate.startsWith(term) && term.length >= 5)
        );
      };
      const score = terms.reduce(
        (sum, term) =>
          sum +
          (hasTerm(nameTerms, term) ? 5 : 0) +
          (nameTerms[0] === term || nameTerms[0] === term.replace(/s$/, "") ? 4 : 0) +
          (hasTerm(categoryTerms, term) ? 3 : 0) +
          (hasTerm(brandTerms, term) ? 2 : 0) +
          (hasTerm(skuTerms, term) ? 2 : 0) +
          (hasTerm(descriptionTerms, term) ? 1 : 0),
        0
      );
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.product.stock - a.product.stock)
    .map(({ product }) => product)
    .slice(0, 3);

  if (matches.length > 0) {
    const first = matches[0];
    const price = new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(first.price);
    const stockText = first.stock > 0 ? `Sí, tenemos stock disponible: ${first.stock} unidad(es).` : "Por ahora aparece sin stock disponible.";

    return res.json({
      reply: asksStock
        ? `${stockText} La opción más cercana es ${first.name}, marca ${first.brand}, a ${price}.`
        : `Encontré ${matches.length} opción(es). La más cercana es ${first.name}, marca ${first.brand}, a ${price}.`,
      products: matches,
      showStock: asksStock,
    });
  }

  return res.json({
    reply:
      "No encontré un producto exacto. Prueba con una palabra clave como taladro, martillo, pintura, cable, casco o cemento.",
    products: [],
    showStock: false,
  });
});

app.post("/api/admin/logout", requireAdminSession, async (req, res) => {
  await deleteSession(req.sessionToken);
  res.status(204).send();
});

app.get("/api/admin/orders", requireAdminSession, async (_req, res) => {
  res.json({ orders: await getAdminOrders() });
});

app.patch("/api/admin/orders/:id", requireAdminSession, async (req, res) => {
  const order = await updateOrderAdminState({
    orderId: req.params.id,
    status: req.body?.status,
    paymentStatus: req.body?.paymentStatus,
  });

  if (!order) {
    return res.status(404).json({ message: "Pedido no encontrado." });
  }

  return res.json({ order });
});

app.listen(port, () => {
  console.log(`Backend FERREMAS escuchando en ${backendUrl}`);
});
