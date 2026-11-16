import { makeId, normalizeEmail } from "./store.js";

const ITERATIONS = 150_000;
const ADMIN_CREDENTIALS_KEY = "rushmea-admin-credentials-v1";

export const ADMIN_USERNAME = "Rusaylah.CEO";

export function createAccessToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromBase64(salt), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toBase64(bits);
}

export function getAdminCredential() {
  const saved = window.localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (!saved) return null;

  let credential;
  try {
    credential = JSON.parse(saved);
  } catch {
    throw new Error("The saved administrator credentials are damaged. Clear the administrator credentials to set a new password.");
  }
  if (typeof credential?.passwordSalt !== "string" || typeof credential?.passwordHash !== "string") {
    throw new Error("The saved administrator credentials are incomplete. Clear the administrator credentials to set a new password.");
  }
  return credential;
}

export async function saveAdminPassword(password) {
  const passwordSalt = toBase64(crypto.getRandomValues(new Uint8Array(16)));
  const credential = {
    passwordSalt,
    passwordHash: await passwordHash(password, passwordSalt),
  };
  window.localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credential));
  return credential;
}

export async function verifyAdminPassword(credential, password) {
  const candidate = await passwordHash(password, credential.passwordSalt);
  return candidate === credential.passwordHash;
}

export async function createCustomer({ name, email, phone, password }) {
  const salt = toBase64(crypto.getRandomValues(new Uint8Array(16)));
  return {
    id: makeId(normalizeEmail(email)),
    name: name.trim(),
    email: normalizeEmail(email),
    phone: phone.trim(),
    passwordSalt: salt,
    passwordHash: await passwordHash(password, salt),
    createdAt: new Date().toISOString(),
    privateOffer: null,
  };
}

export async function verifyCustomerPassword(customer, password) {
  const candidate = await passwordHash(password, customer.passwordSalt);
  return candidate === customer.passwordHash;
}
