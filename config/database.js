const { Sequelize } = require("sequelize");

function buildDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  return {
    dialect: "postgres",
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "soundwave",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    logging: false
  };
}

const sequelize = new Sequelize(buildDatabaseConfig());

module.exports = sequelize;
