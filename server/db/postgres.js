import { randomUUID } from "node:crypto";
import pg from "pg";
import { productSeed } from "../../shared/product-seed.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 5),
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    rut TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_json TEXT,
    payment_json TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL,
    delivery TEXT NOT NULL,
    payment TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    branch TEXT NOT NULL,
    date TEXT NOT NULL,
    webpay_token TEXT,
    webpay_session_id TEXT,
    authorization_code TEXT,
    card_last4 TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    image TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL,
    image_key TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const seedProducts = async () => {
  const now = new Date().toISOString();
  for (const [index, product] of productSeed.entries()) {
    await pool.query(
      `INSERT INTO products (id, sku, name, brand, category, price, stock, image_key, description, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         sku = EXCLUDED.sku,
         name = EXCLUDED.name,
         brand = EXCLUDED.brand,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         image_key = EXCLUDED.image_key,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
      [
        `p${index + 1}`,
        `FM-${String(index + 1).padStart(3, "0")}`,
        product.name,
        product.brand,
        product.category,
        product.price,
        product.stock,
        product.imageKey,
        product.description,
        now,
      ]
    );
  }
};

await seedProducts();

const parseJson = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const mapUserRow = (row, includePassword = false) => {
  if (!row) return null;

  const user = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    rut: row.rut,
    phone: row.phone,
    address: parseJson(row.address_json),
    payment: parseJson(row.payment_json),
    createdAt: row.created_at,
  };

  if (includePassword) {
    user.passwordHash = row.password_hash;
  }

  return user;
};

const mapProductRow = (row) => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  brand: row.brand,
  category: row.category,
  price: Number(row.price),
  stock: Number(row.stock),
  imageKey: row.image_key,
  description: row.description,
  date: row.updated_at,
});

export const getProducts = async () => {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY sku ASC");
  return rows.map(mapProductRow);
};

export const getProductById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0] ? mapProductRow(rows[0]) : null;
};

const assertAndNormalizeItems = async (client, items, { deductStock = false } = {}) => {
  const normalized = [];

  for (const item of items) {
    const { rows } = await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [
      item.id,
    ]);
    const product = rows[0] ? mapProductRow(rows[0]) : null;
    const qty = Number(item.qty);

    if (!product || !Number.isFinite(qty) || qty <= 0) {
      throw new Error("Los productos del pedido son invalidos.");
    }

    if (deductStock && product.stock < qty) {
      throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`);
    }

    normalized.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.imageKey,
    });
  }

  if (deductStock) {
    const now = new Date().toISOString();
    for (const item of normalized) {
      await client.query("UPDATE products SET stock = stock - $1, updated_at = $2 WHERE id = $3", [
        item.qty,
        now,
        item.id,
      ]);
    }
  }

  return normalized;
};

const restoreOrderStock = async (client, orderId) => {
  const items = await getOrderItemsByIds([orderId]);
  const now = new Date().toISOString();
  for (const item of items) {
    await client.query("UPDATE products SET stock = stock + $1, updated_at = $2 WHERE id = $3", [
      Number(item.qty),
      now,
      item.product_id,
    ]);
  }
};

const mapOrderRows = (orderRows, itemRows) =>
  orderRows.map((order) => ({
    id: order.id,
    date: order.date,
    total: Number(order.total),
    status: order.status,
    delivery: order.delivery,
    payment: order.payment,
    paymentStatus: order.payment_status,
    branch: order.branch,
    authorizationCode: order.authorization_code,
    cardLast4: order.card_last4,
    customer: order.customer,
    items: itemRows
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.product_id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty),
        image: item.image,
      })),
  }));

const getOrderItemsByIds = async (orderIds) => {
  if (orderIds.length === 0) return [];

  const { rows } = await pool.query(
    `SELECT order_id, product_id, name, price, qty, image
     FROM order_items
     WHERE order_id = ANY($1::text[])
     ORDER BY id ASC`,
    [orderIds]
  );

  return rows;
};

export const getDbPath = () => "postgres";

export const createUser = async ({ email, passwordHash, firstName, lastName, rut, phone }) => {
  const id = `usr_${Date.now()}`;
  const createdAt = new Date().toISOString();

  await pool.query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, rut, phone, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, email.toLowerCase(), passwordHash, firstName, lastName, rut, phone, createdAt]
  );

  return getUserById(id);
};

export const getUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return mapUserRow(rows[0], true);
};

export const getUserById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return mapUserRow(rows[0]);
};

export const createSession = async ({ userId = null, role }) => {
  const token = randomUUID();
  await pool.query(
    "INSERT INTO sessions (token, user_id, role, created_at) VALUES ($1, $2, $3, $4)",
    [token, userId, role, new Date().toISOString()]
  );
  return token;
};

export const getSession = async (token) => {
  const { rows } = await pool.query("SELECT * FROM sessions WHERE token = $1", [token]);
  const row = rows[0];
  if (!row) return null;
  return {
    token: row.token,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
  };
};

export const deleteSession = async (token) => {
  await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
};

export const getOrdersByUserId = async (userId) => {
  const { rows: orderRows } = await pool.query(
    `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );

  const items = await getOrderItemsByIds(orderRows.map((order) => order.id));
  return mapOrderRows(orderRows, items);
};

export const getUserWithOrders = async (userId) => {
  const user = await getUserById(userId);
  if (!user) return null;
  return {
    ...user,
    orders: await getOrdersByUserId(userId),
  };
};

export const updateUserProfile = async (userId, patch) => {
  const current = await getUserById(userId);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    address: patch.address === undefined ? current.address : patch.address,
    payment: patch.payment === undefined ? current.payment : patch.payment,
  };

  await pool.query(
    `UPDATE users
     SET email = $1, first_name = $2, last_name = $3, rut = $4, phone = $5,
         address_json = $6, payment_json = $7
     WHERE id = $8`,
    [
      next.email.toLowerCase(),
      next.firstName,
      next.lastName,
      next.rut,
      next.phone,
      next.address ? JSON.stringify(next.address) : null,
      next.payment ? JSON.stringify(next.payment) : null,
      userId,
    ]
  );

  return getUserWithOrders(userId);
};

export const updateUserPassword = async (userId, passwordHash) => {
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
  return getUserWithOrders(userId);
};

const insertOrderRecord = async (
  client,
  {
    id,
    userId,
    total,
    status,
    delivery,
    payment,
    paymentStatus,
    branch,
    date,
    webpayToken = null,
    webpaySessionId = null,
  }
) => {
  await client.query(
    `INSERT INTO orders (
      id, user_id, total, status, delivery, payment, payment_status, branch, date,
      webpay_token, webpay_session_id, authorization_code, card_last4, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL, NULL, $12)`,
    [
      id,
      userId,
      total,
      status,
      delivery,
      payment,
      paymentStatus,
      branch,
      date,
      webpayToken,
      webpaySessionId,
      new Date().toISOString(),
    ]
  );
};

const insertOrderItems = async (client, orderId, items) => {
  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, name, price, qty, image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, item.id, item.name, item.price, item.qty, item.image]
    );
  }
};

const createOrder = async ({ id, userId, total, status, delivery, payment, paymentStatus, branch, date, items, webpayToken, webpaySessionId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    // Aqui se define cuando se descuenta stock. Transferencia reserva unidades
    // al crear el pedido; Webpay espera la autorizacion de Transbank antes de
    // descontar, porque el usuario podria abandonar o ser rechazado.
    const normalizedItems = await assertAndNormalizeItems(client, items, {
      deductStock: payment !== "Webpay Plus (Transbank)",
    });
    await insertOrderRecord(client, {
      id,
      userId,
      total,
      status,
      delivery,
      payment,
      paymentStatus,
      branch,
      date,
      webpayToken,
      webpaySessionId,
    });
    await insertOrderItems(client, id, normalizedItems);
    await client.query("COMMIT");
    return getOrderById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createTransferOrder = ({ userId, total, delivery, branch, items }) => {
  const id = `ORD-${Date.now()}`;
  return createOrder({
    id,
    userId,
    total,
    status: "Pendiente",
    delivery,
    payment: "Transferencia bancaria",
    paymentStatus: "Pendiente",
    branch,
    date: new Date().toISOString(),
    items,
  });
};

export const createWebpayOrderDraft = ({
  userId,
  orderId,
  total,
  delivery,
  branch,
  items,
  webpayToken,
  sessionId,
}) =>
  createOrder({
    id: orderId,
    userId,
    total,
    status: "Pendiente",
    delivery,
    payment: "Webpay Plus (Transbank)",
    paymentStatus: "Pendiente",
    branch,
    date: new Date().toISOString(),
    items,
    webpayToken,
    webpaySessionId: sessionId,
  });

export const getOrderById = async (orderId) => {
  const { rows: orderRows } = await pool.query(
    `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId]
  );

  if (orderRows.length === 0) return null;
  const items = await getOrderItemsByIds([orderId]);
  return mapOrderRows(orderRows, items)[0];
};

export const getOrderByWebpayToken = async (token) => {
  const { rows } = await pool.query("SELECT id FROM orders WHERE webpay_token = $1", [token]);
  if (!rows[0]) return null;
  return getOrderById(rows[0].id);
};

export const markWebpayOrderAuthorized = async ({
  orderId,
  paymentLabel,
  authorizationCode,
  cardLast4,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT payment_status FROM orders WHERE id = $1 FOR UPDATE", [
      orderId,
    ]);
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    if (rows[0].payment_status !== "Confirmado") {
      // En esta parte se evita descontar dos veces si el usuario refresca la
      // pantalla de resultado o si Transbank reintenta el retorno.
      const order = await getOrderById(orderId);
      await assertAndNormalizeItems(client, order.items, { deductStock: true });
    }

    await client.query(
      `UPDATE orders
       SET status = 'Aprobado',
           payment = $1,
           payment_status = 'Confirmado',
           authorization_code = $2,
           card_last4 = $3
       WHERE id = $4`,
      [paymentLabel, authorizationCode, cardLast4, orderId]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getOrderById(orderId);
};

export const updateOrderAdminState = async ({ orderId, status, paymentStatus }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT status, payment_status FROM orders WHERE id = $1 FOR UPDATE",
      [orderId]
    );
    const current = rows[0];
    if (!current) {
      await client.query("ROLLBACK");
      return null;
    }

    if (status === "Rechazado" && current.status !== "Rechazado") {
      await restoreOrderStock(client, orderId);
    }

    await client.query(
      `UPDATE orders
       SET status = $1, payment_status = $2
       WHERE id = $3`,
      [status ?? current.status, paymentStatus ?? current.payment_status, orderId]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getOrderById(orderId);
};

export const getAdminOrders = async () => {
  const { rows: orderRows } = await pool.query(
    `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );

  const items = await getOrderItemsByIds(orderRows.map((order) => order.id));
  return mapOrderRows(orderRows, items);
};
