import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import User from "../models/User.js";

/* =========================================================
   ABN TRADE
   AUTHENTICATION MIDDLEWARE
   ========================================================= */

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header.",
      });
    }

    if (!env.jwt.accessSecret) {
      console.error("JWT_ACCESS_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, env.jwt.accessSecret);

    if (!decoded || decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
    }

    if (!decoded.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token payload.",
      });
    }

    const user = await User.findByPk(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "User account is not active.",
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
}
