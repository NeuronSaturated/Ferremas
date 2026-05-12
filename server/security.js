import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
};
