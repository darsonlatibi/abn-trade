import bcrypt from "bcryptjs";

import db from "./config/database.js";
import User from "./models/User.js";

const username = "admin";
const email = "admin@abn.web.id";
const password = "Admin123456!";
const fullName = "ABN Trade Administrator";

try {
  await db.authenticate();

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    console.log("User already exists:");
    console.table([
      {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
      },
    ]);

    await db.close();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    username,
    email,
    password_hash: passwordHash,
    full_name: fullName,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin user created successfully.");
  console.table([
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  ]);

  await db.close();
} catch (error) {
  console.error("Failed to create admin user:");
  console.error(error);

  try {
    await db.close();
  } catch {}

  process.exit(1);
}
