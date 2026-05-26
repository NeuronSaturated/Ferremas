import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password) => {
  // Aqui se genera un salt unico por contrasena. En esta parte se evita guardar
  // la clave real; solo queda almacenado salt:hash en la base de datos.
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  // Aca se recalcula el hash de la clave ingresada y se compara de forma segura
  // con el hash guardado, reduciendo riesgos de comparaciones por tiempo.
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
};
