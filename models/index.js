const sequelize = require("../config/database");
const buildArtista = require("./Artista");
const buildCancion = require("./Cancion");

const Artista = buildArtista(sequelize);
const Cancion = buildCancion(sequelize);

// Declaramos las asociaciones aqui para tener un punto unico de verdad.
// Esto evita repetir relaciones dentro de cada archivo de modelo.
Artista.hasMany(Cancion, {
  foreignKey: "artistaId",
  as: "canciones",
  onDelete: "CASCADE",
  hooks: true
});

Cancion.belongsTo(Artista, {
  foreignKey: "artistaId",
  as: "artista"
});

module.exports = {
  sequelize,
  Artista,
  Cancion
};
