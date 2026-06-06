const sequelize = require("../config/database");
const buildArtista = require("./Artista");
const buildCancion = require("./Cancion");

// Construimos los modelos usando la misma conexion a la base.
const Artista = buildArtista(sequelize);
const Cancion = buildCancion(sequelize);

// Declaramos las asociaciones en un solo lugar para que exista
// un punto unico de verdad sobre las relaciones del proyecto.
//
// hasMany significa: un artista puede tener muchas canciones.
// belongsTo significa: una cancion pertenece a un artista.
// foreignKey indica la columna que conecta ambas tablas.
// onDelete: "CASCADE" hace que si se elimina un artista,
// tambien se eliminen sus canciones relacionadas.
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
