const fs = require("fs");
const path = require("path");
const { Artista, Cancion, Album } = require("../../models");

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
    "song-updated": {
      tone: "success",
      message: "Cancion actualizada correctamente."
    },
    "album-updated": {
      tone: "success",
      message: "Album actualizado correctamente."
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
function normalizeArtistaPayload(body = {}, file = null) {
  const payload = {
    nombre: String(body.nombre || "").trim(),
    genero: String(body.genero || "").trim(),
    pais: String(body.pais || "").trim()
  };

  if (file) {
    payload.foto = file.filename;
  }

  return payload;
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
    await Artista.create(normalizeArtistaPayload(req.body, req.file));
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
  const artista = await Artista.findByPk(req.params.id, {
    include: [{ model: Album, as: "albums" }]
  });

  if (artista) {
    if (artista.foto) {
      const ruta = path.join(__dirname, "../../public/uploads/artistas", artista.foto);
      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    }

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

// Esta vista mezcla datos guardados en la base con datos calculados para mostrar.
exports.renderDetalleArtista = async (req, res) => {
  const status = String(req.query.status || "").trim();
  const artista = await Artista.findByPk(req.params.id, {
    include: [
      {
        model: Cancion,
        as: "canciones",
        include: [{ model: Album, as: "album" }]
      },
      {
        model: Album,
        as: "albums"
      }
    ],
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
    let albumId;

    if (req.body.albumId && req.body.albumId !== "nuevo") {
      albumId = Number(req.body.albumId);
    } else {
      const nuevoAlbum = await Album.create({
        nombre: String(req.body.nuevoAlbum || "").trim(),
        portada: req.file ? req.file.filename : null,
        artistaId: artista.id
      });
      albumId = nuevoAlbum.id;
    }

    await Cancion.create({
      titulo: String(req.body.titulo || "").trim(),
      duracion: Number(req.body.duracion),
      artistaId: artista.id,
      albumId
    });
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

exports.renderEditarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  return res.render("cancion-form", {
    pageTitle: "Editar cancion",
    formTitle: "Editar cancion",
    submitLabel: "Guardar cambios",
    formIntro: "Ajusta el titulo o la duracion de la cancion.",
    cancion: cancion.get({ plain: true }),
    formAction: `/canciones/${cancion.id}/editar`
  });
};

exports.actualizarCancion = async (req, res) => {
  const cancion = await Cancion.findByPk(req.params.id);

  if (!cancion) {
    return res.redirect("/");
  }

  try {
    await cancion.update({
      titulo: String(req.body.titulo || "").trim(),
      duracion: Number(req.body.duracion)
    });
    return res.redirect(`/artistas/${cancion.artistaId}?status=song-updated`);
  } catch (error) {
    return res.status(400).render("cancion-form", {
      pageTitle: "Editar cancion",
      formTitle: "Editar cancion",
      submitLabel: "Guardar cambios",
      formIntro: "Ajusta el titulo o la duracion de la cancion.",
      cancion: cancion.get({ plain: true }),
      formAction: `/canciones/${cancion.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos."
    });
  }
};

exports.renderEditarAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);

  if (!album) {
    return res.redirect("/");
  }

  return res.render("album-form", {
    pageTitle: "Editar album",
    formTitle: "Editar album",
    submitLabel: "Guardar cambios",
    formIntro: "Ajusta el nombre o la portada del album.",
    album: album.get({ plain: true }),
    formAction: `/albums/${album.id}/editar`
  });
};

exports.actualizarAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);

  if (!album) {
    return res.redirect("/");
  }

  if (req.file && album.portada) {
    const ruta = path.join(__dirname, "../../public/uploads/albums", album.portada);
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

  try {
    await album.update({
      nombre: String(req.body.nombre || "").trim(),
      portada: req.file ? req.file.filename : album.portada
    });
    return res.redirect(`/artistas/${album.artistaId}?status=album-updated`);
  } catch (error) {
    return res.status(400).render("album-form", {
      pageTitle: "Editar album",
      formTitle: "Editar album",
      submitLabel: "Guardar cambios",
      formIntro: "Ajusta el nombre o la portada del album.",
      album: album.get({ plain: true }),
      formAction: `/albums/${album.id}/editar`,
      errorMessage: "No pudimos guardar los cambios. Revisa los datos."
    });
  }
};
