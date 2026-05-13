export const usingPostgres = Boolean(process.env.DATABASE_URL);

const adapter = usingPostgres
  ? await import("./db-postgres.js")
  : await import("./db-sqlite.js");

export const getDbPath = adapter.getDbPath;
export const getProducts = adapter.getProducts;
export const getProductById = adapter.getProductById;
export const createUser = adapter.createUser;
export const getUserByEmail = adapter.getUserByEmail;
export const getUserById = adapter.getUserById;
export const createSession = adapter.createSession;
export const getSession = adapter.getSession;
export const deleteSession = adapter.deleteSession;
export const getOrdersByUserId = adapter.getOrdersByUserId;
export const getUserWithOrders = adapter.getUserWithOrders;
export const updateUserProfile = adapter.updateUserProfile;
export const updateUserPassword = adapter.updateUserPassword;
export const createTransferOrder = adapter.createTransferOrder;
export const createWebpayOrderDraft = adapter.createWebpayOrderDraft;
export const getOrderById = adapter.getOrderById;
export const getOrderByWebpayToken = adapter.getOrderByWebpayToken;
export const markWebpayOrderAuthorized = adapter.markWebpayOrderAuthorized;
export const updateOrderAdminState = adapter.updateOrderAdminState;
export const getAdminOrders = adapter.getAdminOrders;
