const { DataTypes } = require("sequelize");

// Admin user for the private management area.
// Public visitors can browse the catalog without an account.
module.exports = (sequelize) => {
  return sequelize.define(
    "Usuario",
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 120]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "local"
      },
      providerId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
      }
    },
    {
      tableName: "usuarios"
    }
  );
};
