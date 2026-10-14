// Backend API to start workflows via Durable Functions
import { NextRequest, NextResponse } from "next/server";
import { HttpClient } from "@infra/http";

const durableFunctionsBase =
	process.env.DURABLE_FUNCTIONS_URL || "http://localhost:7071";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { workflowName, input } = body;

		// Call Durable Functions HTTP trigger
		const response = await HttpClient.post(
			`${durableFunctionsBase}/api/orchestrators/${workflowName}`,
			input,
		);

		return NextResponse.json(response);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 },
		);
	}
}
