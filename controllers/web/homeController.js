const { Sequelize } = require("sequelize");
const { Artista, Cancion, Album } = require("../../models");

// Retorna un objeto de feedback según el status recibido por query param
// Devuelve null si el status no corresponde a ningún caso conocido
function getHomeFeedback(status) {
  const feedbackByStatus = {
    "artist-created": {
      tone: "success",
      message: "Artista creado correctamente."
    },
    "artist-deleted": {
      tone: "success",
      message: "Artista eliminado correctamente."
    }
  };
  return feedbackByStatus[status] || null;
}

// Convierte una duración en segundos a formato MM:SS
function secondsToMinutes(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// Enriquece un artista con datos calculados: total de canciones y duración acumulada
function enrichArtista(artista) {
  const totalSeconds = artista.canciones.reduce(
    (sum, cancion) => sum + cancion.duracion,
    0
  );
  return {
    ...artista.get({ plain: true }),
    totalCanciones: artista.canciones.length,
    duracionTotal: secondsToMinutes(totalSeconds)
  };
}

// Renderiza la página principal con artistas, géneros, top canciones y canción aleatoria
exports.renderHome = async (req, res) => {
  // Lee los query params de filtro y feedback
  const genero = String(req.query.genero || "").trim();
  const status = String(req.query.status || "").trim();
  const where  = genero ? { genero } : undefined;

  // Obtiene todos los artistas (filtrados por género si aplica), con sus canciones
  const artistas = await Artista.findAll({
    where,
    include: [{ model: Cancion, as: "canciones" }],
    order: [["nombre", "ASC"]]
  });

  // Obtiene la lista de géneros únicos disponibles para el filtro
  const generos = await Artista.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("genero")), "genero"]],
    order: [["genero", "ASC"]],
    raw: true
  });

  // Obtiene las 10 canciones más reproducidas, incluyendo artista y álbum para mostrar portada
  const topCanciones = await Cancion.findAll({
    include: [
      { model: Artista, as: "artista" },
      { model: Album,   as: "album"   }
    ],
    order: [["reproducciones", "DESC"], ["titulo", "ASC"]],
    limit: 10
  });

  // Obtiene una canción aleatoria para la función de shuffle
  const shuffle = await Cancion.findOne({
    include: [{ model: Artista, as: "artista" }],
    order: Sequelize.literal("RANDOM()")
  });

  // Toma las reproducciones del primer resultado como referencia para calcular porcentajes
  const maxReproducciones = topCanciones.length > 0
    ? topCanciones[0].reproducciones
    : 1;

  return res.render("home", {
    pageTitle: "SoundWave",
    feedback: getHomeFeedback(status),
    artistas: artistas.map(enrichArtista),
    generos: generos.map((item) => item.genero),
    filtroGenero: genero,
    // Agrega posición, duración formateada, porcentaje de reproducciones y portada del álbum
    topCanciones: topCanciones.map((item, index) => ({
      ...item.get({ plain: true }),
      posicion: index + 1,
      duracionTexto: secondsToMinutes(item.duracion),
      porcentaje: Math.round((item.reproducciones / maxReproducciones) * 100),
      album: item.album ? item.album.get({ plain: true }) : null
    })),
    // Incluye duración formateada si existe canción aleatoria, de lo contrario null
    shuffle: shuffle
      ? {
          ...shuffle.get({ plain: true }),
          duracionTexto: secondsToMinutes(shuffle.duracion)
        }
      : null
  });
};