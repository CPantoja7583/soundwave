const { DataTypes } = require("sequelize");

// Define y exporta el modelo Album
module.exports = (sequelize) => {
  return sequelize.define(
    "Album",
    {
      // Nombre del álbum, obligatorio y con un máximo de 120 caracteres
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 120]
        }
      },
      // URL o ruta de la imagen de portada, opcional
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