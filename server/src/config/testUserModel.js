import db from "./config/database.js";
import User from "./models/User.js";

try {
  console.log("Testing ABN Trade User model...");

  await db.authenticate();

  console.log("Database connection: OK");

  await User.sync();

  console.log("User model sync: OK");
  console.log("Table: users");

  const attributes = User.getAttributes();

  console.log("Columns:");

  for (const [name, attribute] of Object.entries(attributes)) {
    let type;

    if (attribute.type?.key === "ENUM") {
      type = `ENUM(${attribute.values.join(", ")})`;
    } else {
      type = attribute.type?.toString?.() || "UNKNOWN";
    }

    console.log(`- ${name}: ${type}`);
  }

  await db.close();

  console.log("Database connection closed.");
  console.log("User model test: SUCCESS");
} catch (error) {
  console.error("User model test failed:");
  console.error(error);

  try {
    await db.close();
  } catch {
    // Ignore database close errors
  }

  process.exit(1);
}
