import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const defaultDataDir = path.resolve("server", "data");
const configuredDbPath = process.env.SQLITE_PATH
  ? path.resolve(process.env.SQLITE_PATH)
  : null;
const dataDir = configuredDbPath
  ? path.dirname(configuredDbPath)
  : path.resolve(process.env.DATA_DIR || defaultDataDir);

mkdirSync(dataDir, { recursive: true });

const dbPath = configuredDbPath || path.join(dataDir, "ferremas.sqlite");
const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    image TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

const parseJson = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const mapOrderRows = (orderRows, itemRows) =>
  orderRows.map((order) => ({
    id: order.id,
    date: order.date,
    total: order.total,
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
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
  }));

const getOrderItemsByIds = (orderIds) => {
  if (orderIds.length === 0) return [];

  const placeholders = orderIds.map(() => "?").join(", ");
  return db
    .prepare(
      `SELECT order_id, product_id, name, price, qty, image
       FROM order_items
       WHERE order_id IN (${placeholders})
       ORDER BY id ASC`
    )
    .all(...orderIds);
};

export const getDbPath = () => dbPath;

export const createUser = ({ email, passwordHash, firstName, lastName, rut, phone }) => {
  const id = `usr_${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, rut, phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, email.toLowerCase(), passwordHash, firstName, lastName, rut, phone, createdAt);

  return getUserById(id);
};

export const getUserByEmail = (email) => {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    rut: row.rut,
    phone: row.phone,
    address: parseJson(row.address_json),
    payment: parseJson(row.payment_json),
    createdAt: row.created_at,
  };
};

export const getUserById = (id) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!row) return null;

  return {
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
};

export const createSession = ({ userId = null, role }) => {
  const token = randomUUID();
  db.prepare(
    "INSERT INTO sessions (token, user_id, role, created_at) VALUES (?, ?, ?, ?)"
  ).run(token, userId, role, new Date().toISOString());
  return token;
};

export const getSession = (token) => {
  const row = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
  if (!row) return null;
  return {
    token: row.token,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
  };
};

export const deleteSession = (token) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
};

export const getOrdersByUserId = (userId) => {
  const orderRows = db
    .prepare(
      `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`
    )
    .all(userId);

  const items = getOrderItemsByIds(orderRows.map((order) => order.id));
  return mapOrderRows(orderRows, items);
};

export const getUserWithOrders = (userId) => {
  const user = getUserById(userId);
  if (!user) return null;
  return {
    ...user,
    orders: getOrdersByUserId(userId),
  };
};

export const updateUserProfile = (userId, patch) => {
  const current = getUserById(userId);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    address: patch.address === undefined ? current.address : patch.address,
    payment: patch.payment === undefined ? current.payment : patch.payment,
  };

  db.prepare(
    `UPDATE users
     SET email = ?, first_name = ?, last_name = ?, rut = ?, phone = ?, address_json = ?, payment_json = ?
     WHERE id = ?`
  ).run(
    next.email.toLowerCase(),
    next.firstName,
    next.lastName,
    next.rut,
    next.phone,
    next.address ? JSON.stringify(next.address) : null,
    next.payment ? JSON.stringify(next.payment) : null,
    userId
  );

  return getUserWithOrders(userId);
};

const insertOrderRecord = ({
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
}) => {
  db.prepare(
    `INSERT INTO orders (
      id, user_id, total, status, delivery, payment, payment_status, branch, date,
      webpay_token, webpay_session_id, authorization_code, card_last4, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`
  ).run(
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
    new Date().toISOString()
  );
};

const insertOrderItems = (orderId, items) => {
  const stmt = db.prepare(
    `INSERT INTO order_items (order_id, product_id, name, price, qty, image)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  for (const item of items) {
    stmt.run(orderId, item.id, item.name, item.price, item.qty, item.image);
  }
};

export const createTransferOrder = ({
  userId,
  total,
  delivery,
  branch,
  items,
}) => {
  const id = `ORD-${Date.now()}`;
  const date = new Date().toISOString();

  insertOrderRecord({
    id,
    userId,
    total,
    status: "Pendiente",
    delivery,
    payment: "Transferencia bancaria",
    paymentStatus: "Pendiente",
    branch,
    date,
  });

  insertOrderItems(id, items);
  return getOrderById(id);
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
}) => {
  insertOrderRecord({
    id: orderId,
    userId,
    total,
    status: "Pendiente",
    delivery,
    payment: "Webpay Plus (Transbank)",
    paymentStatus: "Pendiente",
    branch,
    date: new Date().toISOString(),
    webpayToken,
    webpaySessionId: sessionId,
  });

  insertOrderItems(orderId, items);
  return getOrderById(orderId);
};

export const getOrderById = (orderId) => {
  const orderRows = db
    .prepare(
      `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ?`
    )
    .all(orderId);

  if (orderRows.length === 0) return null;
  const items = getOrderItemsByIds([orderId]);
  return mapOrderRows(orderRows, items)[0];
};

export const getOrderByWebpayToken = (token) => {
  const row = db.prepare("SELECT id FROM orders WHERE webpay_token = ?").get(token);
  if (!row) return null;
  return getOrderById(row.id);
};

export const markWebpayOrderAuthorized = ({
  orderId,
  paymentLabel,
  authorizationCode,
  cardLast4,
}) => {
  db.prepare(
    `UPDATE orders
     SET status = 'Aprobado',
         payment = ?,
         payment_status = 'Confirmado',
         authorization_code = ?,
         card_last4 = ?
     WHERE id = ?`
  ).run(paymentLabel, authorizationCode, cardLast4, orderId);

  return getOrderById(orderId);
};

export const updateOrderAdminState = ({ orderId, status, paymentStatus }) => {
  const current = db.prepare("SELECT status, payment_status FROM orders WHERE id = ?").get(orderId);
  if (!current) return null;

  db.prepare(
    `UPDATE orders
     SET status = ?, payment_status = ?
     WHERE id = ?`
  ).run(status ?? current.status, paymentStatus ?? current.payment_status, orderId);

  return getOrderById(orderId);
};

export const getAdminOrders = () => {
  const orderRows = db
    .prepare(
      `SELECT o.*, (u.first_name || ' ' || u.last_name) AS customer
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    )
    .all();

  const items = getOrderItemsByIds(orderRows.map((order) => order.id));
  return mapOrderRows(orderRows, items);
};
