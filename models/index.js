const sequelize = require("../config/database");
const buildArtista = require("./Artista");
const buildCancion = require("./Cancion");
const buildAlbum = require("./album");

// Construimos los modelos usando la misma conexión a la base.
const Artista = buildArtista(sequelize);
const Cancion = buildCancion(sequelize);
const Album = buildAlbum(sequelize);

// Declaramos las asociaciones en un solo lugar para tener
// un punto único de verdad sobre las relaciones del proyecto.
//
// hasMany significa: una entidad puede tener muchas relacionadas.
// belongsTo significa: una entidad pertenece a otra.
// foreignKey indica la columna que conecta ambas tablas.
// onDelete define qué ocurre con los registros hijos al eliminar el padre.

// Un artista puede tener muchas canciones.
// Al eliminar el artista, sus canciones se eliminan en cascada.
Artista.hasMany(Cancion, {
  foreignKey: "artistaId",
  as: "canciones",
  onDelete: "CASCADE",
  hooks: true
});

// Una canción pertenece a un artista.
Cancion.belongsTo(Artista, {
  foreignKey: "artistaId",
  as: "artista"
});

// Un artista puede tener muchos álbumes.
// Al eliminar el artista, sus álbumes se eliminan en cascada.
Artista.hasMany(Album, {
  foreignKey: "artistaId",
  as: "albums",
  onDelete: "CASCADE",
  hooks: true
});

// Un álbum pertenece a un artista.
Album.belongsTo(Artista, {
  foreignKey: "artistaId",
  as: "artista"
});

// Un álbum puede tener muchas canciones.
// Al eliminar el álbum, el albumId de sus canciones se pone en NULL.
Album.hasMany(Cancion, {
  foreignKey: "albumId",
  as: "canciones",
  onDelete: "SET NULL",
  hooks: true
});

// Una canción pertenece a un álbum (opcional).
Cancion.belongsTo(Album, {
  foreignKey: "albumId",
  as: "album"
});

// Exporta la conexión y los modelos para usarlos en el resto del proyecto
module.exports = {
  sequelize,
  Artista,
  Cancion,
  Album
};