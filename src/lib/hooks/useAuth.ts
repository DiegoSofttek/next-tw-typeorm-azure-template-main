"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
}

export interface AuthSession {
	user: AuthUser | null;
	isAuthenticated: boolean;
}

export function useAuth() {
	const [session, setSession] = useState<AuthSession>({
		user: null,
		isAuthenticated: false,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch current auth state from backend
		const fetchSession = async () => {
			try {
				const response = await fetch("/api/auth/me");

				if (!response.ok) {
					setSession({ user: null, isAuthenticated: false });
					setLoading(false);
					return;
				}

				const data = await response.json();
				setSession({
					user: data.user || null,
					isAuthenticated: !!data.user,
				});
			} catch (error) {
				console.error("Failed to fetch session:", error);
				setSession({ user: null, isAuthenticated: false });
			} finally {
				setLoading(false);
			}
		};

		fetchSession();
	}, []);

	return { ...session, loading };
}
