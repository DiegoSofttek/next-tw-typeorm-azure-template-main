import bcrypt from "bcryptjs";

// Pure business logic, no framework deps
export class UserService {
  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Hash password using bcrypt
   * @param password - Raw password to hash
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param password - Raw password to verify
   * @param hash - Hashed password from database
   * @returns true if password matches, false otherwise
   */
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createUser(email: string, password: string) {
    if (!this.validateEmail(email)) {
      throw new Error("Invalid email");
    }
    return { email, hashedPassword: await this.hashPassword(password) };
  }
}
