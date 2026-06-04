const { Artista, Cancion } = require("../../models");

function buildValidationMessage(error) {
  if (!error || !error.errors) {
    return "Datos invalidos.";
  }

  return error.errors.map((item) => item.message).join(" ");
}

function normalizeArtistaPayload(body = {}) {
  return {
    nombre: String(body.nombre || "").trim(),
    genero: String(body.genero || "").trim(),
    pais: String(body.pais || "").trim()
  };
}

exports.listarArtistas = async (req, res) => {
  const artistas = await Artista.findAll({
    order: [["nombre", "ASC"]]
  });

  return res.status(200).json({
    ok: true,
    data: artistas
  });
};

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

// Filtrado por género musical
exports.buscarPorGenero = async (req, res) => {
  try {
    const { genero } = req.params;

    const artistas = await Artista.findAll({
      where: { genero: genero.trim() },
      order: [["nombre", "ASC"]]
    });

    if (artistas.length === 0) {
      return res.status(404).json({
        ok: false,
        message: `No se encontraron artistas del género ${genero}.`
      });
    }

    return res.status(200).json({
      ok: true,
      data: artistas
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al buscar artistas por género."
    });
  }
};

// render para handlebars

exports.renderBuscarPorGenero = async (req, res) => {
  try {
    const { genero } = req.params;

    const artistasRaw = await Artista.findAll({
      where: { genero: genero.trim() },
      order: [["nombre", "ASC"]]
    });

    const artistas = artistasRaw.map(a => a.get({ plain: true }));

    // Renderizamos la vista pasándole los datos
    res.render("artistas/por_genero", { artistas, genero });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los artistas por género");
  }
};