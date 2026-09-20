const TOKEN_KEY = "sapling_token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Decodes a JWT payload without verifying the signature (verification
// happens server-side on every request). Used only to read role/email/exp
// for client-side routing decisions.
export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = decodeURIComponent(
      atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(payload) {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}
