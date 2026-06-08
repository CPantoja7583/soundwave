const { DataTypes } = require("sequelize");

// Define y exporta el modelo Cancion
module.exports = (sequelize) => {
  return sequelize.define(
    "Cancion",
    {
      // Título de la canción, obligatorio y con un máximo de 120 caracteres
      titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 120]
        }
      },
      // Duración en segundos, obligatoria y con valor mínimo de 1
      duracion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1
        }
      },
      // Clave foránea al álbum al que pertenece la canción, opcional
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "albums",
          key: "id"
        }
      },
      // Contador de reproducciones, por defecto en 0 y sin admitir valores negativos
      reproducciones: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true,
          min: 0
        }
      },
      // URL de YouTube asociada a la canción, opcional y validada como URL
      youtube_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true
        }
      }
    },
    {
      // Nombre real de la tabla en PostgreSQL
      tableName: "canciones"
    }
  );
};