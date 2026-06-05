const { Sequelize } = require("sequelize");

// En produccion algunos proveedores entregan una sola URL de conexion
// y exigen SSL para conectarse a PostgreSQL.
const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

// Sequelize es la herramienta que traduce operaciones de JavaScript
// a consultas SQL para PostgreSQL.
//
// La instancia "sequelize" representa la conexion principal del proyecto.
// Soportamos dos formas de configurarla:
// 1. DATABASE_URL: una cadena unica con toda la conexion
// 2. Variables separadas: host, puerto, base, usuario y password
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      // SSL suele ser necesario en servicios remotos, pero no en desarrollo local.
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
