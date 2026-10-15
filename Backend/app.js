import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("This website origin is not allowed by the API."));
  },
}));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;
  response.status(isDatabaseReady ? 200 : 503).json({
    status: isDatabaseReady ? "ok" : "database unavailable",
  });
});

app.use("/api", (request, response, next) => {
  if (mongoose.connection.readyState === 1 || request.path === "/") {
    next();
    return;
  }

  response.status(503).json({
    error: "Database unavailable. Check the backend MongoDB connection.",
    status: "database unavailable",
  });
});

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
