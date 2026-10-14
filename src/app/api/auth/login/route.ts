import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/domain/services/UserService";
import { UserRepository } from "@/infra/repositories/UserRepository";
import {
	signToken,
	COOKIE_NAME,
	TOKEN_TTL_SECONDS,
} from "@/lib/utils/jwt.utils";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email y password son requeridos" },
				{ status: 400 },
			);
		}

		const user = await UserRepository.findByEmail(email);
		if (!user) {
			return NextResponse.json(
				{ error: "Credenciales inválidas" },
				{ status: 401 },
			);
		}

		const isPasswordValid = await UserService.verifyPassword(
			password,
			user.hashedPassword,
		);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Credenciales inválidas" },
				{ status: 401 },
			);
		}

		const token = signToken({
			sub: user.id.toString(),
			email: user.email,
			name: user.name ?? "",
		});

		const response = NextResponse.json(
			{
				id: user.id,
				email: user.email,
				name: user.name,
				message: "Login exitoso",
			},
			{ status: 200 },
		);

		response.cookies.set(COOKIE_NAME, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // HTTPS only in prod
			sameSite: "lax",
			maxAge: TOKEN_TTL_SECONDS,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
