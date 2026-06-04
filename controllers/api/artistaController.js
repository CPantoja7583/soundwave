const { Artista, Cancion } = require("../../models");

// Construye un mensaje de error legible a partir de errores de validación de Sequelize
function buildValidationMessage(error) {
  if (!error || !error.errors) {
    return "Datos invalidos.";
  }

  return error.errors.map((item) => item.message).join(" ");
}

// Normaliza y sanitiza los campos del body para crear o actualizar un artista
function normalizeArtistaPayload(body = {}) {
  return {
    nombre: String(body.nombre || "").trim(),
    genero: String(body.genero || "").trim(),
    pais: String(body.pais || "").trim()
  };
}

// GET /api/artistas — retorna todos los artistas ordenados por nombre
exports.listarArtistas = async (req, res) => {
  const artistas = await Artista.findAll({
    order: [["nombre", "ASC"]]
  });

  return res.status(200).json({
    ok: true,
    data: artistas
  });
};

// GET /api/artistas/:id — retorna un artista con sus canciones
exports.obtenerArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Cancion, as: "canciones" }],
    order: [[{ model: Cancion, as: "canciones" }, "titulo", "ASC"]]
  });

  if (!artista) {
    return res.status(404).json({
      ok: false,
      message: "Artista no encontrado."
    });
  }

  return res.status(200).json({
    ok: true,
    data: artista
  });
};

// POST /api/artistas — crea un nuevo artista
exports.crearArtista = async (req, res) => {
  const payload = normalizeArtistaPayload(req.body);

  try {
    const artista = await Artista.create(payload);

    return res.status(201).json({
      ok: true,
      data: artista,
      message: "Artista creado correctamente."
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: buildValidationMessage(error)
    });
  }
};

// PUT /api/artistas/:id — actualiza los datos de un artista existente
exports.actualizarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).json({
      ok: false,
      message: "Artista no encontrado."
    });
  }

  try {
    await artista.update(normalizeArtistaPayload(req.body));

    return res.status(200).json({
      ok: true,
      data: artista,
      message: "Artista actualizado."
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: buildValidationMessage(error)
    });
  }
};

// DELETE /api/artistas/:id — elimina un artista por su id
exports.eliminarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).json({
      ok: false,
      message: "Artista no encontrado."
    });
  }

  await artista.destroy();

  return res.status(200).json({
    ok: true,
    message: "Artista eliminado."
  });
};