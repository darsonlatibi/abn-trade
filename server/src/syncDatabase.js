import db from "./config/database.js";
import User from "./models/User.js";

try {
  await db.authenticate();

  console.log("Database connection: OK");
  console.log("Synchronizing ABN Trade database...");

  await User.sync();

  console.log("User table synchronization: OK");

  const [tables] = await db.query("SHOW TABLES");
  console.log("");
  console.log("=== ABN TRADE TABLES ===");
  console.table(tables);

  await db.close();

  console.log("");
  console.log("Database connection closed.");
} catch (error) {
  console.error("Database synchronization failed:");
  console.error(error);

  try {
    await db.close();
  } catch {}

  process.exit(1);
}
