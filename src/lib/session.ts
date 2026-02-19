export const SESSION_COOKIE_NAME = "tki_session";

type SessionPayload = {
  name?: string;
  email: string;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-only-change-this-secret";
}

function toBase64Url(input: ArrayBuffer | string) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function createSignature(payloadBase64: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadBase64),
  );

  return toBase64Url(signature);
}

export async function createSessionToken(payload: SessionPayload) {
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = await createSignature(payloadBase64, getSessionSecret());

  return `${payloadBase64}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [payloadBase64, signature] = token.split(".");

  if (!payloadBase64 || !signature) {
    return null;
  }

  const expected = await createSignature(payloadBase64, getSessionSecret());

  if (expected !== signature) {
    return null;
  }

  const payload = JSON.parse(
    new TextDecoder().decode(fromBase64Url(payloadBase64)),
  ) as SessionPayload;

  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    return null;
  }

  return payload;
}
