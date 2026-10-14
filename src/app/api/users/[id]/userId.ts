import { NextResponse } from "next/server";

export function parseUserId(idParam: string) {
  const id = Number(idParam);

  if (isNaN(id)) {
    return {
      errorResponse: NextResponse.json({ error: "ID inválido" }, { status: 400 }),
    };
  }

  return { id };
}
