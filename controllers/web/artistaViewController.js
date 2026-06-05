const { Artista, Cancion } = require("../../models");

function getDetailFeedback(status) {
  const feedbackByStatus = {
    "artist-updated": {
      tone: "success",
      message: "Artista actualizado correctamente."
    },
    "song-created": {
      tone: "success",
      message: "Cancion guardada correctamente."
    },
    "song-deleted": {
      tone: "success",
      message: "Cancion eliminada correctamente."
    },
    "song-played": {
      tone: "success",
      message: "Reproduccion registrada."
    },
    "song-error": {
      tone: "error",
      message: "No pudimos guardar la cancion. Revisa los datos e intentalo otra vez."
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

function normalizeArtistaPayload(body = {}) {
  return {
    nombre: String(body.nombre || "").trim(),
    genero: String(body.genero || "").trim(),
    pais: String(body.pais || "").trim()
  };
}

function normalizeCancionPayload(body = {}, artistaId) {
  return {
    titulo: String(body.titulo || "").trim(),
    album: String(body.album || "").trim(),
    duracion: Number(body.duracion),
    artistaId
  };
}

exports.renderNuevoArtista = (req, res) => {
  return res.render("artista-form", {
    pageTitle: "Nuevo artista",
    formTitle: "Crear artista",
    submitLabel: "Guardar artista",
    formIntro: "Completa los datos principales para sumar un artista al catalogo.",
    artist: {
      nombre: "",
      genero: "",
      pais: ""
    },
    formAction: "/artistas"
  });
};

exports.crearArtista = async (req, res) => {
  try {
    await Artista.create(normalizeArtistaPayload(req.body));
    return res.redirect("/?status=artist-created");
  } catch (error) {
    return res.status(400).render("artista-form", {
      pageTitle: "Nuevo artista",
      formTitle: "Crear artista",
      submitLabel: "Guardar artista",
      formIntro: "Completa los datos principales para sumar un artista al catalogo.",
      artist: normalizeArtistaPayload(req.body),
      formAction: "/artistas",
      errorMessage: "Revisa nombre, genero y pais antes de guardar."
    });
  }
};

exports.renderEditarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).render("artista-form", {
      pageTitle: "Artista no encontrado",
      formTitle: "Artista no encontrado",
      submitLabel: "Guardar artista",
      artist: {
        nombre: "",
        genero: "",
        pais: ""
      },
      formAction: "/artistas",
      errorMessage: "No encontramos el artista que quieres editar."
    });
  }

  return res.render("artista-form", {
    pageTitle: `Editar ${artista.nombre}`,
    formTitle: "Editar artista",
    submitLabel: "Guardar cambios",
    formIntro: "Ajusta nombre, genero o pais sin salir del flujo del catalogo.",
    artist: artista.get({ plain: true }),
    formAction: `/artistas/${artista.id}/editar`
  });
};

exports.actualizarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).redirect("/");
  }

  try {
    await artista.update(normalizeArtistaPayload(req.body));
    return res.redirect(`/artistas/${artista.id}?status=artist-updated`);
  } catch (error) {
    return res.status(400).render("artista-form", {
      pageTitle: `Editar ${artista.nombre}`,
      formTitle: "Editar artista",
      submitLabel: "Guardar cambios",
      formIntro: "Ajusta nombre, genero o pais sin salir del flujo del catalogo.",
      artist: {
        ...artista.get({ plain: true }),
        ...normalizeArtistaPayload(req.body)
      },
      formAction: `/artistas/${artista.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos."
    });
  }
};

exports.eliminarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (artista) {
    await artista.destroy();
  }

  return res.redirect("/?status=artist-deleted");
};

exports.renderDetalleArtista = async (req, res) => {
  const status = String(req.query.status || "").trim();
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Cancion, as: "canciones" }],
    order: [[{ model: Cancion, as: "canciones" }, "titulo", "ASC"]]
  });

  if (!artista) {
    return res.status(404).render("artista-detalle", {
      pageTitle: "Artista no encontrado",
      errorMessage: "No encontramos el artista solicitado.",
      artist: null
    });
  }

  const artist = artista.get({ plain: true });
  const totalSeconds = artist.canciones.reduce(
    (sum, cancion) => sum + cancion.duracion,
    0
  );

  return res.render("artista-detalle", {
    pageTitle: artist.nombre,
    feedback: getDetailFeedback(status),
    artist: {
      ...artist,
      duracionTotal: secondsToMinutes(totalSeconds),
      canciones: artist.canciones.map((cancion) => ({
        ...cancion,
        duracionTexto: secondsToMinutes(cancion.duracion)
      }))
    }
  });
};

exports.crearCancion = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).redirect("/");
  }

  try {
    await Cancion.create(normalizeCancionPayload(req.body, artista.id));
  } catch (error) {
    return res.status(400).redirect(`/artistas/${artista.id}?status=song-error`);
  }

  return res.redirect(`/artistas/${artista.id}?status=song-created`);
};

exports.eliminarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  const artistaId = cancion.artistaId;
  await cancion.destroy();

  return res.redirect(`/artistas/${artistaId}?status=song-deleted`);
};

exports.reproducirCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  await cancion.increment("reproducciones", { by: 1 });

  return res.redirect(`/artistas/${cancion.artistaId}?status=song-played`);
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