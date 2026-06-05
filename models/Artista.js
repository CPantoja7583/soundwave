const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Un modelo funciona como la plantilla de una tabla.
  // DataTypes describe el tipo de dato que tendra cada columna.
  return sequelize.define(
    "Artista",
    {
      nombre: {
        type: DataTypes.STRING,
        // allowNull evita valores null.
        // validate agrega reglas que Sequelize revisa antes de guardar.
        allowNull: false,
        validate: {
          // notEmpty evita cadenas vacias.
          // len exige una longitud minima y maxima.
          notEmpty: true,
          len: [2, 120]
        }
      },
      genero: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 60]
        }
      },
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
      // Este sera el nombre real de la tabla en PostgreSQL.
      tableName: "artistas"
    }
  );
};
