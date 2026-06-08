const { DataTypes } = require("sequelize");

// Define y exporta el modelo Artista
// Un modelo funciona como la plantilla de una tabla.
// DataTypes describe el tipo de dato que tendrá cada columna.
module.exports = (sequelize) => {
  return sequelize.define(
    "Artista",
    {
      // Nombre del artista, obligatorio y entre 2 y 120 caracteres
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 120]
        }
      },
      // Género musical del artista, obligatorio y entre 2 y 60 caracteres
      genero: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 60]
        }
      },
      // URL o ruta de la foto del artista, opcional
      foto: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // País de origen del artista, obligatorio y entre 2 y 80 caracteres
      pais: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 80]
        }
      }
    },
    {
      // Este será el nombre real de la tabla en PostgreSQL
      tableName: "artistas"
    }
  );
};