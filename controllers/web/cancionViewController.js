const { Cancion, Album, Artista } = require("../../models");

// Convierte una duración en segundos a formato MM:SS
function secondsToMinutes(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// Renderiza la vista de detalle de una canción específica
exports.renderDetalleCancion = async (req, res) => {
  // Busca la canción por su ID incluyendo su álbum y artista asociados
  const cancion = await Cancion.findByPk(req.params.id, {
    include: [
      { model: Album, as: "album" },
      { model: Artista, as: "artista" }
    ]
  });

  // Si no existe la canción, redirige al inicio
  if (!cancion) {
    return res.redirect("/");
  }

  const data = cancion.get({ plain: true });

  // Obtiene otras canciones del mismo artista, ordenadas alfabéticamente
  const otrasCanciones = await Cancion.findAll({
    where: { artistaId: data.artistaId },
    include: [{ model: Album, as: "album" }],
    order: [["titulo", "ASC"]]
  });

  return res.render("cancion-detalle", {
    pageTitle: data.titulo,
    cancion: {
      ...data,
      duracionTexto: secondsToMinutes(data.duracion),
      youtubeEmbed: toYoutubeEmbed(data.youtube_url)
    },
    // Excluye la canción actual de la lista y formatea la duración de cada una
    otrasCanciones: otrasCanciones
      .filter(c => c.id !== data.id)
      .map(c => ({
        ...c.get({ plain: true }),
        duracionTexto: secondsToMinutes(c.duracion)
      }))
  });

  // Convierte una URL de YouTube a su versión embebida
  // Soporta los formatos: watch?v=, youtu.be/ y shorts/
  function toYoutubeEmbed(url) {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
};