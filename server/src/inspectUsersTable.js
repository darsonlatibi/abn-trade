import db from "./config/database.js";

/* =========================================================
   ABN TRADE
   INSPECT USERS TABLE
   ========================================================= */

try {
  await db.authenticate();

  console.log("Database connection: OK");
  console.log("");
  console.log("=== USERS TABLE STRUCTURE ===");

  const [results] = await db.query(`
    SHOW CREATE TABLE users
  `);

  if (!results.length) {
    throw new Error("Table 'users' was not found.");
  }

  console.log(results[0]["Create Table"]);

  await db.close();

  console.log("");
  console.log("Database connection closed.");
  console.log("Users table inspection: SUCCESS");
} catch (error) {
  console.error("");
  console.error("Schema inspection failed:");
  console.error(error);

  try {
    await db.close();
  } catch {
    // Ignore close error
  }

  process.exit(1);
}
