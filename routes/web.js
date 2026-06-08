const express = require("express");
const homeController = require("../controllers/web/homeController");
const artistaViewController = require("../controllers/web/artistaViewController");
const cancionViewController = require("../controllers/web/cancionViewController");
const upload = require("../config/multer");
const router = express.Router();

// Estas rutas son las que usa el navegador al navegar por la interfaz.
// En vez de JSON, aquí solemos renderizar vistas o hacer redirects.

// ── Home ──────────────────────────────────────────────
router.get("/", homeController.renderHome);

// Reutilizamos la home con filtro por género en vez de crear una vista aparte
router.get("/artistas/genero/:genero", (req, res) => {
  return res.redirect(`/?genero=${encodeURIComponent(req.params.genero)}`);
});

// ── Artistas ──────────────────────────────────────────
router.get("/artistas/nuevo",                                    artistaViewController.renderNuevoArtista);
router.post("/artistas",              upload.single("foto"),     artistaViewController.crearArtista);
router.get("/artistas/:id",                                      artistaViewController.renderDetalleArtista);
router.get("/artistas/:id/editar",                               artistaViewController.renderEditarArtista);
router.post("/artistas/:id/editar",   upload.single("foto"),     artistaViewController.actualizarArtista);
router.post("/artistas/:id/eliminar",                            artistaViewController.eliminarArtista);

// ── Canciones ─────────────────────────────────────────
router.post("/artistas/:id/canciones", upload.single("portada"), artistaViewController.crearCancion);
router.get("/canciones/:id",                                     cancionViewController.renderDetalleCancion);
router.get("/canciones/:id/editar",                              artistaViewController.renderEditarCancion);
router.post("/canciones/:id/editar",  upload.single("portada"),  artistaViewController.actualizarCancion);
router.post("/canciones/:id/eliminar",                           artistaViewController.eliminarCancion);
router.post("/canciones/:id/reproducir",                         artistaViewController.reproducirCancion);

// ── Álbumes ───────────────────────────────────────────
router.get("/albums/:id/editar",                                 artistaViewController.renderEditarAlbum);
router.post("/albums/:id/editar",     upload.single("portada"),  artistaViewController.actualizarAlbum);
router.post("/albums/:id/eliminar",                              artistaViewController.eliminarAlbum);

module.exports = router;