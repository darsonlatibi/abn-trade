import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT || 5040),

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  wsPort: Number(process.env.WS_PORT || 5041),

  /* =======================================================
     DATABASE
     ======================================================= */

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || "abn_trade",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },

  /* =======================================================
     JWT
     ======================================================= */

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",

    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
};
