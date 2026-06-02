require("dotenv").config();

const { Artista, Cancion, sequelize } = require("../models");

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
    nombre: "Zoé",
    genero: "Rock",
    pais: "Mexico",
    canciones: [
      { titulo: "Labios rotos", album: "Reptilectric", duracion: 294, reproducciones: 3100 },
      { titulo: "Azul", album: "Memo Rex Commander", duracion: 258, reproducciones: 1420 }
    ]
  }
];

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
