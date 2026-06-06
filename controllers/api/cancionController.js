const { Sequelize } = require("sequelize");
const { Artista, Cancion, Album } = require("../../models");

// Para la API aceptamos dos estrategias:
// - albumId: usar un album ya existente
// - album: crear o reutilizar un album por nombre
function normalizeCancionPayload(body = {}, artistaId) {
  return {
    titulo: String(body.titulo || "").trim(),
    duracion: Number(body.duracion),
    artistaId,
    albumId: body.albumId ? Number(body.albumId) : null,
    albumNombre: String(body.album || "").trim()
  };
}

// Centralizamos el formato de errores de validacion para no repetir logica.
function buildValidationMessage(error) {
  if (!error || !error.errors) {
    return "Datos invalidos.";
  }

  return error.errors.map((item) => item.message).join(" ");
}

// GET /api/artistas/:id/canciones
// Primero buscamos el artista padre para poder responder 404
// si el id no existe.
exports.listarPorArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Cancion, as: "canciones", include: [{ model: Album, as: "album" }] }]
  });

  if (!artista) {
    return res.status(404).json({ ok: false, message: "Artista no encontrado." });
  }

  return res.status(200).json({ ok: true, data: artista.canciones });
};

// POST /api/artistas/:id/canciones
// Antes de crear una cancion validamos que el artista exista.
exports.crearPorArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).json({ ok: false, message: "Artista no encontrado." });
  }

  try {
    const payload = normalizeCancionPayload(req.body, artista.id);
    let albumId = payload.albumId;

    if (!albumId && payload.albumNombre) {
      const [album] = await Album.findOrCreate({
        where: {
          nombre: payload.albumNombre,
          artistaId: artista.id
        },
        defaults: {
          nombre: payload.albumNombre,
          artistaId: artista.id
        }
      });
      albumId = album.id;
    }

    const cancion = await Cancion.create({
      titulo: payload.titulo,
      duracion: payload.duracion,
      artistaId: payload.artistaId,
      albumId
    });

    return res.status(201).json({ ok: true, data: cancion, message: "Cancion creada correctamente." });
  } catch (error) {
    return res.status(400).json({ ok: false, message: buildValidationMessage(error) });
  }
};

// DELETE /api/canciones/:id
// destroy elimina una cancion segun su id.
exports.eliminarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.status(404).json({ ok: false, message: "Cancion no encontrada." });
  }

  await cancion.destroy();

  return res.status(200).json({ ok: true, message: "Cancion eliminada." });
};

// POST /api/canciones/:id/play
// increment suma 1 directamente en la base de datos.
// reload vuelve a leer el registro para devolver el valor actualizado.
exports.reproducirCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.status(404).json({ ok: false, message: "Cancion no encontrada." });
  }

  await cancion.increment("reproducciones", { by: 1 });
  await cancion.reload();

  return res.status(200).json({ ok: true, data: cancion, message: "Reproduccion registrada." });
};

// GET /api/canciones/shuffle
// RANDOM() le pide a PostgreSQL una cancion aleatoria.
exports.obtenerShuffle = async (req, res) => {
  const cancion = await Cancion.findOne({
    include: [
      { model: Artista, as: "artista" },
      { model: Album, as: "album" }
    ],
    order: Sequelize.literal("RANDOM()")
  });

  if (!cancion) {
    return res.status(404).json({ ok: false, message: "No hay canciones disponibles." });
  }

  return res.status(200).json({ ok: true, data: cancion });
};
