const path = require("path");
const { Sequelize } = require("sequelize");

const storagePath = path.resolve(
  __dirname,
  "..",
  process.env.DB_STORAGE || "./data/soundwave.sqlite"
);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false
});

module.exports = sequelize;
