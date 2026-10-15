import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/infra/repositories/UserRepository";

type Params = { params: { id: string } };

function getValidatedUserId(idParam: string) {
  const id = Number(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  return id;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = getValidatedUserId(params.id);
    if (userId instanceof NextResponse) {
      return userId;
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = getValidatedUserId(params.id);
    if (userId instanceof NextResponse) {
      return userId;
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email && !name) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 },
      );
    }

    const updatedUser = await UserRepository.update(userId, { email, name });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = getValidatedUserId(params.id);
    if (userId instanceof NextResponse) {
      return userId;
    }

    await UserRepository.delete(userId);
    return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
