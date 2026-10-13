import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const COOKIE_NAME = "auth_token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface TokenPayload {
  sub: string; // user id
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Signs a simple HMAC-SHA256 token.
 * Format: base64url(payload) + "." + base64url(HMAC-SHA256(base64url(payload), secret))
 */
export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const full: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const encoded = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${sig}`;
}

/**
 * Verifies a token produced by signToken.
 * Returns the payload if valid, null otherwise.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;

    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(encoded)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    if (
      sig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, TOKEN_TTL_SECONDS };
