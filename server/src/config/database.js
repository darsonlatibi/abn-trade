import { Sequelize } from "sequelize";
import { env } from "./env.js";

/* =========================================================
   ABN TRADE
   DATABASE CONNECTION
   ========================================================= */

const db = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",

  logging: false,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/* =========================================================
   DATABASE EXPORTS
   ========================================================= */

export default db;

export { db };

export const sequelize = db;

/* =========================================================
   DATABASE CONNECTION TEST
   ========================================================= */

export async function connectDatabase() {
  await db.authenticate();

  console.log("ABN Trade database connection: OK");
}
