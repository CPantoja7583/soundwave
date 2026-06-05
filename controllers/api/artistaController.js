const { Artista, Cancion } = require("../../models");

// Sequelize entrega errores bastante detallados.
// Esta funcion los resume para mostrar mensajes simples y legibles en la API.
function buildValidationMessage(error) {
  if (!error || !error.errors) {
    return "Datos invalidos.";
  }

  return error.errors.map((item) => item.message).join(" ");
}

// Normalizamos el body para trabajar siempre con strings limpios
// y evitar espacios accidentales al crear o actualizar artistas.
function normalizeArtistaPayload(body = {}) {
  return {
    nombre: String(body.nombre || "").trim(),
    genero: String(body.genero || "").trim(),
    pais: String(body.pais || "").trim()
  };
}

// GET /api/artistas
// findAll busca varios registros y res.json devuelve datos, no HTML.
exports.listarArtistas = async (req, res) => {
  const artistas = await Artista.findAll({
    order: [["nombre", "ASC"]]
  });

  return res.status(200).json({
    ok: true,
    data: artistas
  });
};

// GET /api/artistas/:id
// Flujo tipico de lectura:
// 1. buscar por id
// 2. incluir relaciones necesarias
// 3. devolver 404 si no existe
// 4. responder con el dato si todo va bien
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

// POST /api/artistas
// create inserta un nuevo registro en la tabla.
// Si el modelo detecta datos invalidos, respondemos 400.
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

// PUT /api/artistas/:id
// update modifica un registro ya existente.
// Primero comprobamos que el artista exista para no actualizar "nada".
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

// DELETE /api/artistas/:id
// destroy elimina el registro encontrado.
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

// GET /api/genero/:genero
// Ejemplo de busqueda filtrada.
// El patron se repite: buscar, revisar si hay resultados y responder.
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
        message: `No se encontraron artistas del genero ${genero}.`
      });
    }

    return res.status(200).json({
      ok: true,
      data: artistas
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al buscar artistas por genero."
    });
  }
};
