const { Sequelize } = require("sequelize");
const { Artista, Cancion } = require("../../models");

function normalizeCancionPayload(body = {}, artistaId) {
  return {
    titulo: String(body.titulo || "").trim(),
    album: String(body.album || "").trim(),
    duracion: Number(body.duracion),
    artistaId
  };
}

function buildValidationMessage(error) {
  if (!error || !error.errors) {
    return "Datos invalidos.";
  }

  return error.errors.map((item) => item.message).join(" ");
}

exports.listarPorArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Cancion, as: "canciones" }]
  });

  if (!artista) {
    return res.status(404).json({
      ok: false,
      message: "Artista no encontrado."
    });
  }

  return res.status(200).json({
    ok: true,
    data: artista.canciones
  });
};

exports.crearPorArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).json({
      ok: false,
      message: "Artista no encontrado."
    });
  }

  try {
    const cancion = await Cancion.create(normalizeCancionPayload(req.body, artista.id));

    return res.status(201).json({
      ok: true,
      data: cancion,
      message: "Cancion creada correctamente."
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: buildValidationMessage(error)
    });
  }
};

exports.eliminarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.status(404).json({
      ok: false,
      message: "Cancion no encontrada."
    });
  }

  await cancion.destroy();

  return res.status(200).json({
    ok: true,
    message: "Cancion eliminada."
  });
};

exports.reproducirCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.status(404).json({
      ok: false,
      message: "Cancion no encontrada."
    });
  }

  await cancion.increment("reproducciones", { by: 1 });
  await cancion.reload();

  return res.status(200).json({
    ok: true,
    data: cancion,
    message: "Reproduccion registrada."
  });
};

exports.obtenerShuffle = async (req, res) => {
  const cancion = await Cancion.findOne({
    include: [{ model: Artista, as: "artista" }],
    order: Sequelize.literal("RANDOM()")
  });

  if (!cancion) {
    return res.status(404).json({
      ok: false,
      message: "No hay canciones disponibles."
    });
  }

  return res.status(200).json({
    ok: true,
    data: cancion
  });
};
