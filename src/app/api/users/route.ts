import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/infra/repositories/UserRepository";

export async function GET(req: NextRequest) {
	try {
		const users = await UserRepository.findAll();
		return NextResponse.json(users, { status: 200 });
	} catch (error) {
		console.error("Get users error:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
