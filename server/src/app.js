import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { startWebSocketServer } from "./websocket/index.js";
import { connectDatabase } from "./config/database.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/AuthRoute.js";
import userRoutes from "./routes/UserRoute.js";

const app = express();

app.set("trust proxy", 1);

// ======================================================
// PATH CONFIGURATION
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/src/app.js
//          ↓ ../../
// abn-trade/client/dist

const clientDist = path.resolve(__dirname, "../../client/dist");

console.log(`React client: ${clientDist}`);

// ======================================================
// SECURITY
// ======================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

// ======================================================
// LOGGER
// ======================================================

app.use(morgan("dev"));

// ======================================================
// API ROUTES
// ======================================================

app.use("/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

// ======================================================
// REACT STATIC FILES
// ======================================================

app.use(express.static(clientDist));

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// ======================================================
// REACT SPA FALLBACK
// ======================================================

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  if (req.path === "/health" || req.path.startsWith("/health/")) {
    return next();
  }

  if (req.method !== "GET") {
    return next();
  }

  res.sendFile(path.join(clientDist, "index.html"));
});

// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer(app);
    startWebSocketServer(env.wsPort);
    server.listen(env.port, "0.0.0.0", () => {
      console.log(`ABN Trade server running on port ${env.port}`);
      console.log(`Local: http://localhost:${env.port}`);
      console.log(`Public: ${env.domain || "https://trade.abn.web.id"}`);
      console.log(`React: ${clientDist}`);
    });
  } catch (error) {
    console.error("Failed to start ABN Trade server:", error);
    process.exit(1);
  }
};

startServer();
