const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
        : {}
    })
  : new Sequelize(
      process.env.DB_NAME || "soundwave",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false
      }
    );

module.exports = sequelize;
