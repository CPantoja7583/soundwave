const sequelize = require("../config/database");
const buildArtista = require("./Artista");
const buildCancion = require("./Cancion");
const buildAlbum = require("./album");

// Construimos los modelos usando la misma conexion a la base.
const Artista = buildArtista(sequelize);
const Cancion = buildCancion(sequelize);
const Album = buildAlbum(sequelize);

// Declaramos las asociaciones en un solo lugar para tener
// un punto unico de verdad sobre las relaciones del proyecto.
//
// hasMany significa: una entidad puede tener muchas relacionadas.
// belongsTo significa: una entidad pertenece a otra.
// foreignKey indica la columna que conecta ambas tablas.
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

Artista.hasMany(Album, {
  foreignKey: "artistaId",
  as: "albums",
  onDelete: "CASCADE",
  hooks: true
});

Album.belongsTo(Artista, {
  foreignKey: "artistaId",
  as: "artista"
});

Album.hasMany(Cancion, {
  foreignKey: "albumId",
  as: "canciones",
  onDelete: "SET NULL",
  hooks: true
});

Cancion.belongsTo(Album, {
  foreignKey: "albumId",
  as: "album"
});

module.exports = {
  sequelize,
  Artista,
  Cancion,
  Album
};
