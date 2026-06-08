const fs   = require("fs");
const path = require("path");
const { Artista, Cancion, Album } = require("../../models");

// Traduce el estado de la URL a un mensaje visible en la interfaz.
// Por ejemplo: ?status=artist-updated → { tone: "success", message: "..." }
function getDetailFeedback(status) {
  const feedbackByStatus = {
    "artist-updated": { tone: "success", message: "Artista actualizado correctamente." },
    "song-created":   { tone: "success", message: "Cancion guardada correctamente." },
    "song-deleted":   { tone: "success", message: "Cancion eliminada correctamente." },
    "song-played":    { tone: "success", message: "Reproduccion registrada." },
    "song-updated":   { tone: "success", message: "Cancion actualizada correctamente." },
    "album-updated":  { tone: "success", message: "Album actualizado correctamente." },
    "album-deleted":  { tone: "success", message: "Album eliminado correctamente." },
    "song-error":     { tone: "error",   message: "No pudimos guardar la cancion. Revisa los datos e intentalo otra vez." }
  };

  return feedbackByStatus[status] || null;
}

// Convierte segundos a formato mm:ss para mostrar en la interfaz.
// Ejemplo: 228 → "03:48"
function secondsToMinutes(seconds) {
  const safeSeconds = Number(seconds) || 0;
  const minutes     = Math.floor(safeSeconds / 60);
  const remaining   = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// Limpia y normaliza los datos del formulario de artista.
// Si el género es "nuevo", usa el campo generoNuevo en vez del select.
// Si viene un archivo de imagen, agrega el nombre del archivo al payload.
function normalizeArtistaPayload(body = {}, file = null) {
  const genero = body.genero === "nuevo"
    ? String(body.generoNuevo || "").trim()
    : String(body.genero     || "").trim();

  const payload = {
    nombre: String(body.nombre || "").trim(),
    genero,
    pais: String(body.pais || "").trim()
  };

  if (file) {
    payload.foto = file.filename;
  }

  return payload;
}

// Obtiene los géneros únicos de todos los artistas en la DB.
// Se usa para poblar el select del formulario de artista.
async function getGenerosUnicos() {
  const artistas = await Artista.findAll({
    attributes: ["genero"],
    group: ["genero"]
  });
  return artistas.map(a => a.genero).filter(Boolean);
}

// Renderiza el formulario de creación de artista.
// Carga los géneros existentes para mostrarlos en el select.
exports.renderNuevoArtista = async (req, res) => {
  const generos = await getGenerosUnicos();

  return res.render("artista-form", {
    pageTitle:   "Nuevo artista",
    formTitle:   "Crear artista",
    submitLabel: "Guardar artista",
    formIntro:   "Completa los datos principales para sumar un artista al catalogo.",
    artist:      { nombre: "", genero: "", pais: "" },
    formAction:  "/artistas",
    generos
  });
};

// Procesa el formulario de creación de artista.
// Si hay error vuelve a renderizar el formulario con el mensaje correspondiente.
exports.crearArtista = async (req, res) => {
  try {
    await Artista.create(normalizeArtistaPayload(req.body, req.file));
    return res.redirect("/?status=artist-created");
  } catch (error) {
    const generos = await getGenerosUnicos();

    return res.status(400).render("artista-form", {
      pageTitle:    "Nuevo artista",
      formTitle:    "Crear artista",
      submitLabel:  "Guardar artista",
      formIntro:    "Completa los datos principales para sumar un artista al catalogo.",
      artist:       normalizeArtistaPayload(req.body),
      formAction:   "/artistas",
      errorMessage: "Revisa nombre, genero y pais antes de guardar.",
      generos
    });
  }
};

// Renderiza el formulario de edición cargado con los datos actuales del artista.
exports.renderEditarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).render("artista-form", {
      pageTitle:    "Artista no encontrado",
      formTitle:    "Artista no encontrado",
      submitLabel:  "Guardar artista",
      artist:       { nombre: "", genero: "", pais: "" },
      formAction:   "/artistas",
      errorMessage: "No encontramos el artista que quieres editar.",
      generos:      []
    });
  }

  const generos = await getGenerosUnicos();

  return res.render("artista-form", {
    pageTitle:   `Editar ${artista.nombre}`,
    formTitle:   "Editar artista",
    submitLabel: "Guardar cambios",
    formIntro:   "Ajusta nombre, genero o pais sin salir del flujo del catalogo.",
    artist:      artista.get({ plain: true }),
    formAction:  `/artistas/${artista.id}/editar`,
    generos
  });
};

// Guarda los cambios del formulario de edición.
// Si el artista subió una nueva foto, elimina la anterior del disco.
exports.actualizarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).redirect("/");
  }

  // Borra la foto anterior si se subió una nueva.
  if (req.file && artista.foto) {
    const ruta = path.join(__dirname, "../../public/uploads/artistas", artista.foto);
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

  try {
    await artista.update(normalizeArtistaPayload(req.body, req.file));
    return res.redirect(`/artistas/${artista.id}?status=artist-updated`);
  } catch (error) {
    const generos = await getGenerosUnicos();

    return res.status(400).render("artista-form", {
      pageTitle:    `Editar ${artista.nombre}`,
      formTitle:    "Editar artista",
      submitLabel:  "Guardar cambios",
      formIntro:    "Ajusta nombre, genero o pais sin salir del flujo del catalogo.",
      // Mezclamos los datos actuales con los del formulario para no perder
      // los campos que el usuario no modificó.
      artist:       { ...artista.get({ plain: true }), ...normalizeArtistaPayload(req.body) },
      formAction:   `/artistas/${artista.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos.",
      generos
    });
  }
};

// Elimina el artista junto con su foto y las portadas de sus álbumes del disco.
// Secuelize se encarga de eliminar las canciones asociadas por la relación en cascada.
exports.eliminarArtista = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Album, as: "albums" }]
  });

  if (artista) {
    // Elimina la foto del artista si existe.
    if (artista.foto) {
      const ruta = path.join(__dirname, "../../public/uploads/artistas", artista.foto);
      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    }

    // Elimina las portadas de cada álbum del artista.
    for (const album of artista.albums) {
      if (album.portada) {
        const ruta = path.join(__dirname, "../../public/uploads/albums", album.portada);
        if (fs.existsSync(ruta)) {
          fs.unlinkSync(ruta);
        }
      }
    }

    await artista.destroy();
  }

  return res.redirect("/?status=artist-deleted");
};

// Renderiza la página de detalle del artista con sus canciones y álbumes.
// Calcula la duración total sumando los segundos de todas las canciones.
exports.renderDetalleArtista = async (req, res) => {
  const status  = String(req.query.status || "").trim();
  const artista = await Artista.findByPk(req.params.id, {
    include: [
      {
        model: Cancion,
        as: "canciones",
        include: [{ model: Album, as: "album" }]
      },
      { model: Album, as: "albums" }
    ],
    order: [[{ model: Cancion, as: "canciones" }, "titulo", "ASC"]]
  });

  if (!artista) {
    return res.status(404).render("artista-detalle", {
      pageTitle:    "Artista no encontrado",
      errorMessage: "No encontramos el artista solicitado.",
      artist:       null
    });
  }

  const artist       = artista.get({ plain: true });
  const totalSeconds = artist.canciones.reduce(
    (sum, cancion) => sum + cancion.duracion, 0
  );

  return res.render("artista-detalle", {
    pageTitle: artist.nombre,
    feedback:  getDetailFeedback(status),
    artist: {
      ...artist,
      duracionTotal: secondsToMinutes(totalSeconds),
      // Agregamos duracionTexto a cada cancion para mostrarla en la vista.
      canciones: artist.canciones.map((cancion) => ({
        ...cancion,
        duracionTexto: secondsToMinutes(cancion.duracion)
      }))
    }
  });
};

// Crea una canción asociada al artista.
// Si el usuario eligió "nuevo" en el select de álbum, crea el álbum primero
// y luego asocia la canción a ese nuevo álbum.
exports.crearCancion = async (req, res) => {
  const artista = await Artista.findByPk(req.params.id);

  if (!artista) {
    return res.status(404).redirect("/");
  }

  try {
    let albumId;

    if (req.body.albumId && req.body.albumId !== "nuevo") {
      // Usa un álbum existente.
      albumId = Number(req.body.albumId);
    } else {
      // Crea un álbum nuevo con los datos del formulario.
      const nuevoAlbum = await Album.create({
        nombre:    String(req.body.nuevoAlbum || "").trim(),
        portada:   req.file ? req.file.filename : null,
        artistaId: artista.id
      });
      albumId = nuevoAlbum.id;
    }

    await Cancion.create({
      titulo:      String(req.body.titulo || "").trim(),
      duracion:    Number(req.body.duracion),
      artistaId:   artista.id,
      albumId,
      youtube_url: String(req.body.youtube_url || "").trim()
    });
  } catch (error) {
    return res.status(400).redirect(`/artistas/${artista.id}?status=song-error`);
  }

  return res.redirect(`/artistas/${artista.id}?status=song-created`);
};

// Elimina la canción y redirige al detalle del artista.
exports.eliminarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  const artistaId = cancion.artistaId;
  await cancion.destroy();

  return res.redirect(`/artistas/${artistaId}?status=song-deleted`);
};

// Incrementa el contador de reproducciones y redirige
// a la vista de detalle de la canción.
exports.reproducirCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  await cancion.increment("reproducciones", { by: 1 });

  return res.redirect(`/canciones/${cancion.id}`);
};

// Renderiza el formulario de edición de canción
// con los datos actuales precargados.
exports.renderEditarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  return res.render("cancion-form", {
    pageTitle:   "Editar cancion",
    formTitle:   "Editar cancion",
    submitLabel: "Guardar cambios",
    formIntro:   "Ajusta el titulo o la duracion de la cancion.",
    cancion:     cancion.get({ plain: true }),
    formAction:  `/canciones/${cancion.id}/editar`
  });
};

// Guarda los cambios de la canción editada.
exports.actualizarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  try {
    await cancion.update({
      titulo:      String(req.body.titulo || "").trim(),
      duracion:    Number(req.body.duracion),
      youtube_url: String(req.body.youtube_url || "").trim()
    });
    return res.redirect(`/artistas/${cancion.artistaId}?status=song-updated`);
  } catch (error) {
    return res.status(400).render("cancion-form", {
      pageTitle:    "Editar cancion",
      formTitle:    "Editar cancion",
      submitLabel:  "Guardar cambios",
      formIntro:    "Ajusta el titulo o la duracion de la cancion.",
      cancion:      cancion.get({ plain: true }),
      formAction:   `/canciones/${cancion.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos."
    });
  }
};

// Renderiza el formulario de edición de álbum
// con los datos actuales precargados.
exports.renderEditarAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);

  if (!album) {
    return res.redirect("/");
  }

  return res.render("album-form", {
    pageTitle:   "Editar album",
    formTitle:   "Editar album",
    submitLabel: "Guardar cambios",
    formIntro:   "Ajusta el nombre o la portada del album.",
    album:       album.get({ plain: true }),
    formAction:  `/albums/${album.id}/editar`
  });
};

// Guarda los cambios del álbum.
// Si se subió una nueva portada, elimina la anterior del disco.
exports.actualizarAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);

  if (!album) {
    return res.redirect("/");
  }

  // Borra la portada anterior si se subió una nueva.
  if (req.file && album.portada) {
    const ruta = path.join(__dirname, "../../public/uploads/albums", album.portada);
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

  try {
    await album.update({
      nombre:  String(req.body.nombre || "").trim(),
      // Si no se subió nueva portada, conserva la existente.
      portada: req.file ? req.file.filename : album.portada
    });
    return res.redirect(`/artistas/${album.artistaId}?status=album-updated`);
  } catch (error) {
    return res.status(400).render("album-form", {
      pageTitle:    "Editar album",
      formTitle:    "Editar album",
      submitLabel:  "Guardar cambios",
      formIntro:    "Ajusta el nombre o la portada del album.",
      album:        album.get({ plain: true }),
      formAction:   `/albums/${album.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos."
    });
  }
};

// Elimina el álbum y su portada del disco si existe.
// Redirige al detalle del artista al que pertenecía el álbum.
exports.eliminarAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);

  if (!album) {
    return res.redirect("/");
  }

  const artistaId = album.artistaId;

  // Borra la portada del álbum del disco si existe.
  if (album.portada) {
    const ruta = path.join(__dirname, "../../public/uploads/albums", album.portada);
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

  await album.destroy();

  return res.redirect(`/artistas/${artistaId}?status=album-deleted`);
};