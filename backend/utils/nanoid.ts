import crypto from "crypto";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Make URL safe ids, using for public form links
export const nanoid = (size: number = 12): string => {
  const bytes = crypto.randomBytes(size);

  let id = "";
  for (const byte of bytes) {
    id += ALPHABET[byte % ALPHABET.length];
  }

  return id;
};
