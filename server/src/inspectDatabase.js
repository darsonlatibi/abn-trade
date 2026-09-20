import db from "./config/database.js";

try {
  await db.authenticate();

  console.log("Database connection: OK");
  console.log("");
  console.log("=== ABN TRADE DATABASE TABLES ===");

  const [tables] = await db.query(`
    SHOW TABLES
  `);

  console.table(tables);

  await db.close();

  console.log("");
  console.log("Database connection closed.");
} catch (error) {
  console.error("Database inspection failed:");
  console.error(error);

  try {
    await db.close();
  } catch {}

  process.exit(1);
}
