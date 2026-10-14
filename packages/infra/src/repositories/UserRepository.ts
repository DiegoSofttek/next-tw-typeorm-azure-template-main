import { db } from "../database";

export class UserRepository {
	static async create(email: string, name: string, hashedPassword: string) {
		return db.user.create({
			data: { email, name, hashedPassword },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	static async findByEmail(email: string) {
		return db.user.findUnique({
			where: { email },
		});
	}

	static async findById(id: number) {
		return db.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	static async findAll() {
		return db.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	static async update(id: number, data: { email?: string; name?: string }) {
		return db.user.update({
			where: { id },
			data,
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	static async delete(id: number) {
		return db.user.delete({
			where: { id },
		});
	}
}
