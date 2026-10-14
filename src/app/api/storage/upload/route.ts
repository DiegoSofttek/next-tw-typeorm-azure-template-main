// src/app/api/storage/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "@/lib/utils/jwt.utils";
import { getBlobSasUrl, uploadBlob } from "@/infra/storage";

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get(COOKIE_NAME)?.value;

		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const containerName = (formData.get("container") as string) || "uploads";

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"application/pdf",
			"text/plain",
		];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "File type not allowed" },
				{ status: 400 },
			);
		}

		// 4. Validar tamaño (máx 5MB)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: "File too large (max 5MB)" },
				{ status: 400 },
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(7);
		const fileExtension = file.name.split(".").pop();
		const blobName = `${payload.sub}/${timestamp}-${random}.${fileExtension}`;

		const blobUrl = await uploadBlob(containerName, blobName, buffer);

		const expiration = new Date(new Date().valueOf() + 3600 * 1000);

		const downloadUrl = await getBlobSasUrl(
			containerName,
			blobName,
			expiration, // 1 hora
		);

		return NextResponse.json(
			{
				success: true,
				url: downloadUrl,
				blobName,
				containerName,
				size: file.size,
				type: file.type,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 },
		);
	}
}
