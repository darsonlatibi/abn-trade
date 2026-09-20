import { DataTypes } from "sequelize";

import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "ADMIN",
        "TRADER",
        "ANALYST",
        "VIEWER",
      ),
      allowNull: false,
      defaultValue: "VIEWER",
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default User;
