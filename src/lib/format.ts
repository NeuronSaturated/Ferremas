// Aqui viven formateadores chilenos usados por formularios de cliente.

/** En esta parte se limpia el RUT dejando solo digitos y K. */
export const cleanRut = (rut: string) =>
  rut.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);

/** Aqui se formatea un RUT como 12.345.678-9. */
export const formatRut = (raw: string) => {
  const c = cleanRut(raw);
  if (c.length <= 1) return c;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
};

/** Aca se calcula el digito verificador con modulo 11. */
export const computeDv = (body: string) => {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (sum % 11);
  if (r === 11) return "0";
  if (r === 10) return "K";
  return String(r);
};

/** Aqui se valida el formato general del RUT chileno. */
export const isValidRut = (rut: string) => {
  const c = cleanRut(rut);
  if (c.length < 2) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  return /^\d{1,8}$/.test(body) && /^[0-9K]$/.test(dv);
};

// En esta parte se trabaja telefono movil chileno: +569 XXXX XXXX.
// Aca el usuario solo escribe los 8 digitos posteriores al +569.

/** Aqui se devuelven solo los 8 digitos del movil, sin +569. */
export const cleanPhone = (raw: string) =>
  raw.replace(/\D/g, "").replace(/^569/, "").slice(0, 8);

/** En esta parte se formatea como "XXXX XXXX" dentro del input. */
export const formatPhoneLocal = (raw: string) => {
  const c = cleanPhone(raw);
  if (c.length <= 4) return c;
  return `${c.slice(0, 4)} ${c.slice(4)}`;
};

/** Aqui se devuelve el telefono completo "+569 XXXX XXXX". */
export const fullPhone = (local: string) => {
  const c = cleanPhone(local);
  if (!c) return "";
  return `+569 ${formatPhoneLocal(c)}`;
};

// Aqui se formatean datos de tarjeta guardados solo como dato de perfil demo.
export const formatCard = (raw: string) => {
  const c = raw.replace(/\D/g, "").slice(0, 16);
  return c.replace(/(.{4})/g, "$1 ").trim();
};
export const formatExpiry = (raw: string) => {
  const c = raw.replace(/\D/g, "").slice(0, 4);
  if (c.length <= 2) return c;
  return `${c.slice(0, 2)}/${c.slice(2)}`;
};
export const maskCard = (number: string) => {
  const c = number.replace(/\s/g, "");
  if (c.length < 4) return c;
  return `**** **** **** ${c.slice(-4)}`;
};
