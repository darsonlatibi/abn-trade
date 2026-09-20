import db from "./config/database.js";

/* =========================================================
   ABN TRADE
   INSPECT USERS
   ========================================================= */

try {
  await db.authenticate();

  console.log("Database connection: OK");
  console.log("");
  console.log("=== USERS ===");

  const [users] = await db.query(`
    SELECT
      id,
      username,
      email,
      full_name,
      role,
      status,
      tenant_id,
      last_login_at
    FROM users
    ORDER BY id ASC
  `);

  console.table(users);

  await db.close();

  console.log("");
  console.log("Database connection closed.");
  console.log("Users inspection: SUCCESS");
} catch (error) {
  console.error("");
  console.error("Users inspection failed:");
  console.error(error);

  try {
    await db.close();
  } catch {
    // Ignore close error
  }

  process.exit(1);
}
