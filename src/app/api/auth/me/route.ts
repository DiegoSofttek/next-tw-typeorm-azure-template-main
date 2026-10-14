import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/utils/jwt.utils";

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user extracted from the httpOnly
 * auth_token cookie set by POST /api/auth/login.
 *
 * Response:
 *   200 – { user: { id, email, name } }
 *   401 – { error: "No autenticado" }
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    // Token is invalid or expired – clear the stale cookie
    const response = NextResponse.json(
      { error: "Sesión expirada o inválida" },
      { status: 401 },
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    },
  });
}
