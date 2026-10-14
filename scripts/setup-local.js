// scripts/setup-local.js
const { execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function runCommand(command, options = {}) {
	try {
		console.log(`> ${command}`);
		execSync(command, {
			stdio: "inherit",
			shell: true,
			cwd: options.cwd || projectRoot,
		});
	} catch (error) {
		console.error(`Command failed: ${command}`);
		if (!options.ignoreError) {
			throw error;
		}
	}
}

function checkDocker() {
	try {
		execSync("docker --version", { stdio: "pipe" });
		execSync("docker ps", { stdio: "pipe" });
		console.log("Docker is running\n");
	} catch (error) {
		throw new Error(
			"Docker is not running or not installed. Please start Docker and try again.",
		);
	}
}

async function main() {
	console.log("Setting up local development environment...\n");

	try {
		// 0. Check Docker
		console.log("Checking Docker...");
		checkDocker();

		// 1. Docker services
		console.log("Starting Docker services (SQL Server + Azurite)...");
		runCommand("docker-compose up -d");

		console.log("Waiting 15 seconds for services to start...");
		await new Promise((r) => setTimeout(r, 15000));

		// 2. Create database (optional fail)
		console.log("Creating database...");
		runCommand(
			'sqlcmd -S localhost -U sa -P "YourPassword123!" -C -Q "CREATE DATABASE myapp"',
			{ ignoreError: true },
		);

		// 3. Install dependencies
		console.log("Installing root dependencies...");
		runCommand("npm install");

		console.log("Installing Functions dependencies...");
		runCommand("npm install", { cwd: path.join(projectRoot, "functions") });

		// 4. Apply Prisma migrations ← NUEVO
		console.log("Applying Prisma migrations...");
		runCommand("npx prisma db push --skip-generate");

		console.log("\n✓ Setup complete!");
		console.log("\nNext steps:");
		console.log("  1. Verify .env.local with DATABASE_URL configured");
		console.log("  2. Run: npm run dev:all");
		console.log("\nCheck README.md for more details\n");
	} catch (error) {
		console.error("\nSetup failed:", error.message);
		console.error("\nTroubleshooting:");
		console.error("  - Ensure Docker Desktop is running");
		console.error("  - On Windows, use Docker Desktop (not WSL only)");
		console.error("  - Check ports 1433, 10000, 10001, 10002 are not in use");
		console.error("  - Verify DATABASE_URL in .env.local is correct");
		process.exit(1);
	}
}

main();
