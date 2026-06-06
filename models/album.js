const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Album",
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 120]
        }
      },
      portada: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "albums"
    }
  );
};