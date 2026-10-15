import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const requiredEnvironment = [
  "MONGODB_URI",
  "JWT_SECRET",
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]?.trim());

if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const server = app.listen(port, () => {
  console.log(`Portfolio API listening on port ${port}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function connectDatabaseWithRetry() {
  let attempt = 0;
  let retryDelayMs = 5_000;

  while (true) {
    try {
      await connectDatabase();
      return;
    } catch (error) {
      attempt += 1;
      const details = error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
      console.error(`MongoDB connection attempt ${attempt} failed: ${details}`);
      console.error(`Retrying in ${retryDelayMs / 1_000} seconds.`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      retryDelayMs = Math.min(retryDelayMs * 2, 60_000);
    }
  }
}

void connectDatabaseWithRetry();
