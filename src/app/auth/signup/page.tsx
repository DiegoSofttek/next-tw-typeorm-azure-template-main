"use client";

import { FormEvent, ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { emailRegex, passwordRegex } from "@/lib/utils/auth.utils";

type FormFields = {
	displayName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

const defaultFormFields: FormFields = {
	displayName: "",
	email: "",
	password: "",
	confirmPassword: "",
};

const Signup = () => {
	const router = useRouter();
	const [formFields, setFormFields] = useState<FormFields>(defaultFormFields);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetFormFields = () => setFormFields(defaultFormFields);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const field = target.id;
		const value = target.value;

		if (field === "email") {
			if (!value || emailRegex.test(value)) {
				setEmailError("");
			} else {
				setEmailError("Please enter a valid email address.");
			}
		}

		if (field === "password" || field === "confirmPassword") {
			if (!value || passwordRegex.test(value)) {
				setPasswordError("");
			} else {
				setPasswordError(
					"Password must be at least 8 characters, containing letters and digits.",
				);
			}
		}

		setFormFields((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		const { displayName, email, password, confirmPassword } = formFields;

		if (!displayName || !email || !password || !confirmPassword) {
			toast.warning("Please fill in all fields.");
			setIsSubmitting(false);
			return;
		}

		if (!emailRegex.test(email)) {
			toast.warning("Please enter a valid email address.");
			setIsSubmitting(false);
			return;
		}

		if (!passwordRegex.test(password)) {
			toast.warning(
				"Password must be at least 8 characters and contain letters and digits.",
			);
			setIsSubmitting(false);
			return;
		}

		if (password !== confirmPassword) {
			toast.warning("Passwords do not match.");
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password,
					name: displayName,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				const errorMessage = data.error?.message || "Signup failed";

				if (errorMessage.includes("already")) {
					toast.error("This email is already registered. Please log in.");
				} else {
					toast.error(errorMessage);
				}
				setIsSubmitting(false);
				return;
			}

			toast.success("Account created successfully! Please log in to continue.");
			resetFormFields();

			setTimeout(() => {
				router.push("/auth/login");
			}, 2000);
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("An unexpected error occurred. Please try again.");
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-lg mx-auto flex-1 flex flex-col justify-center px-4 py-12">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold">Create an account</h1>
				<p className="text-sm text-muted-foreground mt-2">
					Enter your information to get started
				</p>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="displayName">Full name</Label>
						<Input
							id="displayName"
							placeholder="John Doe"
							onChange={handleChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							onChange={handleChange}
							required
						/>
						{emailError && <p className="text-red-500 text-sm">{emailError}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							onChange={handleChange}
							required
						/>
						{passwordError && (
							<p className="text-red-500 text-sm">{passwordError}</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							onChange={handleChange}
							required
						/>
					</div>
					<Button
						type="submit"
						className="w-full cursor-pointer"
						disabled={emailError !== "" || passwordError !== "" || isSubmitting}
					>
						{isSubmitting ? "Creating Account..." : "Create Account"}
					</Button>
					<div className="text-center text-sm">
						Already have an account?{" "}
						<Link href="/auth/login" className="text-primary hover:underline">
							Log in
						</Link>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Signup;
