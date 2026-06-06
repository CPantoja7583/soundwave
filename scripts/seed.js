require("dotenv").config();

const { Artista, Cancion, sequelize } = require("../models");

// Datos de ejemplo para que el proyecto no arranque vacio.
// Sirven para probar la aplicacion sin cargar artistas manualmente.
const seedData = [
  {
    nombre: "Bomba Estereo",
    genero: "Alternativo",
    pais: "Colombia",
    canciones: [
      { titulo: "To My Love", album: "Amanecer", duracion: 228, reproducciones: 1250 },
      { titulo: "Fuego", album: "Elegancia Tropical", duracion: 216, reproducciones: 980 }
    ]
  },
  {
    nombre: "Mon Laferte",
    genero: "Pop",
    pais: "Chile",
    canciones: [
      { titulo: "Tu falta de querer", album: "Mon Laferte Vol. 1", duracion: 250, reproducciones: 2200 },
      { titulo: "Amor completo", album: "Mon Laferte Vol. 1", duracion: 223, reproducciones: 1730 }
    ]
  },
  {
    nombre: "Zoe",
    genero: "Rock",
    pais: "Mexico",
    canciones: [
      { titulo: "Labios rotos", album: "Reptilectric", duracion: 294, reproducciones: 3100 },
      { titulo: "Azul", album: "Memo Rex Commander", duracion: 258, reproducciones: 1420 }
    ]
  }
];

// La semilla solo corre si la tabla de artistas esta vacia.
// Asi evitamos duplicar datos cada vez que reiniciamos la aplicacion.
async function seedDatabase() {
  const artistasCount = await Artista.count();

  if (artistasCount > 0) {
    return false;
  }

  for (const artista of seedData) {
    const { canciones, ...artistaData } = artista;
    const createdArtista = await Artista.create(artistaData);

    for (const cancion of canciones) {
      await Cancion.create({
        ...cancion,
        artistaId: createdArtista.id
      });
    }
  }

  return true;
}

// Este bloque permite ejecutar la semilla como script independiente.
async function runSeed() {
  try {
    await sequelize.sync();
    const seeded = await seedDatabase();

    console.log(seeded ? "Base inicial sembrada." : "La base ya tenia datos.");
  } catch (error) {
    console.error("No se pudo sembrar la base:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = {
  seedDatabase
};
