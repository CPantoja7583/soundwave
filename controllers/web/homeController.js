const { Sequelize } = require("sequelize");
const { Artista, Cancion } = require("../../models");

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

function secondsToMinutes(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

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

exports.renderHome = async (req, res) => {
  const genero = String(req.query.genero || "").trim();
  const status = String(req.query.status || "").trim();
  const where = genero ? { genero } : undefined;

  const artistas = await Artista.findAll({
    where,
    include: [{ model: Cancion, as: "canciones" }],
    order: [["nombre", "ASC"]]
  });

  const generos = await Artista.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("genero")), "genero"]],
    order: [["genero", "ASC"]],
    raw: true
  });

  const topCanciones = await Cancion.findAll({
    include: [{ model: Artista, as: "artista" }],
    order: [["reproducciones", "DESC"], ["titulo", "ASC"]],
    limit: 10
  });

  const shuffle = await Cancion.findOne({
    include: [{ model: Artista, as: "artista" }],
    order: Sequelize.literal("RANDOM()")
  });

  return res.render("home", {
    pageTitle: "SoundWave",
    feedback: getHomeFeedback(status),
    artistas: artistas.map(enrichArtista),
    generos: generos.map((item) => item.genero),
    filtroGenero: genero,
    topCanciones: topCanciones.map((item, index) => ({
      ...item.get({ plain: true }),
      posicion: index + 1,
      duracionTexto: secondsToMinutes(item.duracion)
    })),
    shuffle: shuffle
      ? {
          ...shuffle.get({ plain: true }),
          duracionTexto: secondsToMinutes(shuffle.duracion)
        }
      : null
  });
};
