const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Este modelo representa canciones.
  // Cada propiedad que definimos abajo terminara siendo una columna en la tabla.
  return sequelize.define(
    "Cancion",
    {
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 120]
        }
      },
      album: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 120]
        }
      },
      duracion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          // isInt exige un numero entero.
          // min obliga a que la duracion sea mayor que cero.
          isInt: true,
          min: 1
        }
      },
      reproducciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // defaultValue es el valor inicial si no enviamos uno manualmente.
        defaultValue: 0,
        validate: {
          isInt: true,
          min: 0
        }
      }
    },
    {
      tableName: "canciones"
    }
  );
};
