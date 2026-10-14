// src/lib/db.ts - REST API client (no direct ORM access)

export interface ApiUser {
	id: string;
	name: string;
	email: string;
	createdAt: string;
}

export interface CreateUserRequest {
	email: string;
	name: string;
	password: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
}

// Users API
export async function createUser(
	userData: CreateUserRequest,
): Promise<ApiUser> {
	const response = await fetch("/api/users", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to create user");
	}

	return response.json();
}

export async function getUsers(): Promise<ApiUser[]> {
	const response = await fetch("/api/users", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}

	return response.json();
}

// Auth API
export async function login(email: string, password: string) {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Login failed");
	}

	return response.json();
}

export async function logout() {
	const response = await fetch("/api/auth/logout", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		throw new Error("Failed to logout");
	}

	return response.json();
}

// Storage API
export async function uploadFile(file: File, userId: string) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("userId", userId);

	const response = await fetch("/api/storage/upload", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Failed to upload file");
	}

	return response.json();
}
