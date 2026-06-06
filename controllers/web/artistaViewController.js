const { Artista, Cancion } = require("../../models");

// Igual que en home, traducimos estados cortos de la URL
// a mensajes que la interfaz pueda mostrar.
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

// Transformamos segundos a mm:ss para que la vista sea mas amigable.
function secondsToMinutes(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// Normalizar payloads evita repetir la misma limpieza de datos en varias acciones.
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

// render() se usa cuando queremos construir una pagina HTML en el servidor.
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

// En la parte web, despues de crear solemos usar redirect()
// para devolver al usuario a otra pagina del flujo.
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

// Antes de editar buscamos el registro y llenamos el formulario con sus datos actuales.
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

// update guarda cambios sobre un registro ya cargado desde la base.
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

// Si el artista existe lo eliminamos; si no, simplemente volvemos al inicio.
exports.eliminarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (artista) {
    await artista.destroy();
  }

  return res.redirect("/?status=artist-deleted");
};

// Esta vista mezcla datos guardados en la base con datos calculados para mostrar.
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

// Crear una cancion desde la web sigue este flujo:
// buscar artista, intentar guardar y redirigir con un estado final.
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

// Primero buscamos la cancion para saber a que artista pertenece.
exports.eliminarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  const artistaId = cancion.artistaId;
  await cancion.destroy();

  return res.redirect(`/artistas/${artistaId}?status=song-deleted`);
};

// increment tambien sirve en la parte web porque la reproduccion
// es solo un contador numerico.
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

    const topCanciones = await Cancion.findAll({ order: [["reproducciones", "DESC"]], limit: 10 }).then(res => res.map(c => c.get({ plain: true })));
    const shuffle = await Cancion.findOne().then(c => c ? c.get({ plain: true }) : null); 
    const generos = ["Rock", "Pop", "Jazz", "Trap"]; // O tu lógica para traer géneros

    res.render("home", { 
      artistas, 
      genero, 
      filtroGenero: genero, 
      generos,
      topCanciones,
      shuffle
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los artistas por género");
  }
};