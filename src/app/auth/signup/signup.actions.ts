"use server";

export async function createUserInDatabase(userData: {
  email: string;
  name: string;
  password: string;
}) {
  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Failed to create user" };
  }
}
