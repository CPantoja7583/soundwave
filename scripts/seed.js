require("dotenv").config();
 
const { Artista, Cancion, Album, sequelize } = require("../models");
 
// Datos de ejemplo para que el proyecto no arranque vacío.
// Las fotos y portadas usan rutas locales dentro de public/uploads/.
// Antes de correr el seed, asegúrate de tener las imágenes en:
//   public/uploads/artistas/  → fotos de artistas
//   public/uploads/albums/    → portadas de álbumes
const seedData = [
  {
    nombre: "Ronnie James Dio",
    genero: "Heavy Metal",
    pais: "EE.UU.",
    foto: "Dio.webp",
    albums: [
      {
        nombre: "Holy Diver",
        portada: "Holy-diver.jpg",
        canciones: [
          { titulo: "Holy Diver",              duracion: 341, reproducciones: 8900, youtube_url: "https://www.youtube.com/watch?v=2lvs2FzF64o" },
          { titulo: "Rainbow in the Dark",     duracion: 258, reproducciones: 7600, youtube_url: "https://www.youtube.com/watch?v=PrBUjXaRSUQ" },
          { titulo: "Don't Talk to Strangers", duracion: 406, reproducciones: 5200, youtube_url: "https://www.youtube.com/watch?v=15hYMIPQw84" }
        ]
      },
      {
        nombre: "The Last in Line",
        portada: "The-Last-In-Line.jpg",
        canciones: [
          { titulo: "We Rock",          duracion: 264, reproducciones: 6100, youtube_url: "https://www.youtube.com/watch?v=n5aPWmcyBRk" },
          { titulo: "The Last in Line", duracion: 318, reproducciones: 5800, youtube_url: "https://www.youtube.com/watch?v=OjvZvRVk8Z0" }
        ]
      }
    ]
  },
  {
    nombre: "The Beatles",
    genero: "Rock",
    pais: "Reino Unido",
    foto: "The-Beatles.jpg",
    albums: [
      {
        nombre: "Abbey Road",
        portada: "Abbey-Road.jpg",
        canciones: [
          { titulo: "Come Together",      duracion: 259, reproducciones: 9800, youtube_url: "https://www.youtube.com/watch?v=45cYwDMibGo" },
          { titulo: "Something",          duracion: 182, reproducciones: 8700, youtube_url: "https://www.youtube.com/watch?v=UelDrZ1aFeY" },
          { titulo: "Here Comes the Sun", duracion: 185, reproducciones: 9200, youtube_url: "https://www.youtube.com/watch?v=KQetemT1sWc" }
        ]
      },
      {
        nombre: "Let It Be",
        portada: "Let-it-Be.jpg",
        canciones: [
          { titulo: "Let It Be",                    duracion: 243, reproducciones: 8900, youtube_url: "https://www.youtube.com/watch?v=bBkHhbkHSnQ" },
          { titulo: "The Long and Winding Road",    duracion: 218, reproducciones: 7600, youtube_url: "https://www.youtube.com/watch?v=fR4HjTH_fTM" }
        ]
      }
    ]
  },
  {
    nombre: "Cuarteto de Nos",
    genero: "Rock Latino",
    pais: "Uruguay",
    foto: "Cuarteto-De-Nos.jpg",
    albums: [
      {
        nombre: "Raro",
        portada: "Raro.jpg",
        canciones: [
          { titulo: "Yendo a la casa de Damián",    duracion: 214, reproducciones: 5400, youtube_url: "https://www.youtube.com/watch?v=5y8WZ0dGqyo" },
          { titulo: "Me amo",                       duracion: 198, reproducciones: 4900, youtube_url: "https://www.youtube.com/watch?v=KQIJo57MLGg" },
          { titulo: "Hoy estoy raro" ,               duracion: 264, reproducciones: 4300, youtube_url: "https://www.youtube.com/watch?v=DazBMZf_i7w" }
        ]
      },
      {
        nombre: "Porfiado",
        portada: "porfiado.jpeg",
        canciones: [
          { titulo: "Lo malo de ser bueno", duracion: 241, reproducciones: 3800, youtube_url: "https://www.youtube.com/watch?v=S_roMeig-YQ" },
          { titulo: "Soló estoy sobreviviendo", duracion: 256, reproducciones: 3500, youtube_url: "https://www.youtube.com/watch?v=sX3T0SAhOug" }
        ]
      }
    ]
  },
  {
    nombre: "Marc Anthony",
    genero: "Salsa",
    pais: "EE.UU.",
    foto: "Marc-Anthony.jpg",
    albums: [
      {
        nombre: "Todo a Su Tiempo",
        portada: "Todo-a-su-Tiempo.jpg",
        canciones: [
          { titulo: "Hasta que te conocí", duracion: 276, reproducciones: 7200, youtube_url: "https://www.youtube.com/watch?v=yiFj0jMKdIU" },
          { titulo: "Te conozco bien",     duracion: 254, reproducciones: 6100, youtube_url: "https://www.youtube.com/watch?v=fs2dreh6PNI" }
        ]
      },
      {
        nombre: "Contra la Corriente",
        portada: "Contra-la-corriente.jpg",
        canciones: [
          { titulo: "Y hubo alguien", duracion: 261, reproducciones: 5800, youtube_url: "https://www.youtube.com/watch?v=zoszjpGg00Q" },
          { titulo: "No me conoces",  duracion: 238, reproducciones: 5300, youtube_url: "https://www.youtube.com/watch?v=w8oTmjQooxM" },
          { titulo: "Te necesito",    duracion: 249, reproducciones: 4900, youtube_url: "https://www.youtube.com/watch?v=sX3T0SAhOug" }
        ]
      }
    ]
  },
  {
    nombre: "Nirvana",
    genero: "Grunge",
    pais: "EE.UU.",
    foto: "Nirvana.jpg",
    albums: [
      {
        nombre: "Nevermind",
        portada: "Nevermind.jpg",
        canciones: [
          { titulo: "Smells Like Teen Spirit", duracion: 301, reproducciones: 12500, youtube_url: "https://www.youtube.com/watch?v=hTWKbfoikeg" },
          { titulo: "Come as You Are",         duracion: 219, reproducciones: 9800,  youtube_url: "https://www.youtube.com/watch?v=vabnZ9-ex7o" },
          { titulo: "Lithium",                 duracion: 256, reproducciones: 8400,  youtube_url: "https://www.youtube.com/watch?v=pkcJEvMcnEg" }
        ]
      },
      {
        nombre: "In Utero",
        portada: "In-Utero.jpg",
        canciones: [
          { titulo: "Heart-Shaped Box", duracion: 281, reproducciones: 7600, youtube_url: "https://www.youtube.com/watch?v=n6P0SitRwy8" },
          { titulo: "All Apologies",    duracion: 234, reproducciones: 6900, youtube_url: "https://www.youtube.com/watch?v=4Q0UPqoQoXo" }
        ]
      }
    ]
  },
  {
    nombre: "Queen",
    genero: "Rock",
    pais: "Reino Unido",
    foto: "Queen.jpg",
    albums: [
      {
        nombre: "A Night at the Opera",
        portada: "A-Night-At-The-Opera.jpg",
        canciones: [
          { titulo: "Bohemian Rhapsody",       duracion: 354, reproducciones: 15800, youtube_url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ" },
          { titulo: "Love of My Life",         duracion: 213, reproducciones: 9200,  youtube_url: "https://www.youtube.com/watch?v=_Jtpf8N5IDE" },
          { titulo: "You're My Best Friend",   duracion: 170, reproducciones: 7800,  youtube_url: "https://www.youtube.com/watch?v=t6RcOzJoMCc" }
        ]
      },
      {
        nombre: "News of the World",
        portada: "News-Of-The-World.jpg",
        canciones: [
          { titulo: "We Will Rock You",        duracion: 122, reproducciones: 14200, youtube_url: "https://www.youtube.com/watch?v=-tJYN-eG1zk" },
          { titulo: "We Are the Champions",    duracion: 179, reproducciones: 13600, youtube_url: "https://www.youtube.com/watch?v=04854XqcfCY" }
        ]
      }
    ]
  }
];
 
// La semilla solo corre si la tabla de artistas está vacía.
// Así evitamos duplicar datos cada vez que reiniciamos la aplicación.
async function seedDatabase() {
  const artistasCount = await Artista.count();
 
  if (artistasCount > 0) {
    return false;
  }
 
  for (const artistaData of seedData) {
    const { albums, ...datosArtista } = artistaData;
 
    const artista = await Artista.create(datosArtista);
 
    for (const albumData of albums) {
      const { canciones, ...datosAlbum } = albumData;
 
      const album = await Album.create({
        ...datosAlbum,
        artistaId: artista.id
      });
 
      for (const cancion of canciones) {
        await Cancion.create({
          ...cancion,
          artistaId: artista.id,
          albumId:   album.id
        });
      }
    }
  }
 
  return true;
}
 
// Este bloque permite ejecutar la semilla como script independiente.
async function runSeed() {
  try {
    await sequelize.sync();
    const seeded = await seedDatabase();
    console.log(seeded ? "Base inicial sembrada." : "La base ya tenía datos.");
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
 
module.exports = { seedDatabase };