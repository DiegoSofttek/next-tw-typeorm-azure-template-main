import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/domain/services/UserService";
import { UserRepository } from "@/infra/repositories/UserRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y password son requeridos" },
        { status: 400 },
      );
    }

    // Validar email
    if (!UserService.validateEmail(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await UserService.hashPassword(password);

    // Crear usuario en base de datos
    const user = await UserRepository.create(email, name || "", hashedPassword);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        message: "Usuario creado exitosamente",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
