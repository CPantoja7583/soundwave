const express = require("express");
const homeController = require("../controllers/web/homeController");
const artistaViewController = require("../controllers/web/artistaViewController");
const cancionViewController = require("../controllers/web/cancionViewController");
const authController = require("../controllers/web/authController");
const { requireAuth } = require("../middlewares/auth");
const upload = require("../config/multer");
const router = express.Router();

// Estas rutas son las que usa el navegador al navegar por la interfaz.
// En vez de JSON, aquí solemos renderizar vistas o hacer redirects.

// ── Home ──────────────────────────────────────────────
router.get("/", homeController.renderHome);
router.get("/login", authController.renderLogin);
router.post("/login", authController.login);
router.get("/register", authController.renderRegister);
router.post("/register", authController.register);
router.get("/auth/google", authController.startGoogleLogin);
router.get("/auth/google/callback", authController.handleGoogleCallback);
router.get("/auth/microsoft", authController.startMicrosoftLogin);
router.get("/auth/microsoft/callback", authController.handleMicrosoftCallback);
router.post("/logout", authController.logout);

// Reutilizamos la home con filtro por género en vez de crear una vista aparte
router.get("/artistas/genero/:genero", (req, res) => {
  return res.redirect(`/?genero=${encodeURIComponent(req.params.genero)}`);
});

// ── Artistas ──────────────────────────────────────────
router.get("/artistas/nuevo",         requireAuth,               artistaViewController.renderNuevoArtista);
router.post("/artistas",              requireAuth, upload.single("foto"), artistaViewController.crearArtista);
router.get("/artistas/:id",                                      artistaViewController.renderDetalleArtista);
router.get("/artistas/:id/editar",    requireAuth,               artistaViewController.renderEditarArtista);
router.post("/artistas/:id/editar",   requireAuth, upload.single("foto"), artistaViewController.actualizarArtista);
router.post("/artistas/:id/eliminar", requireAuth,               artistaViewController.eliminarArtista);

// ── Canciones ─────────────────────────────────────────
router.post("/artistas/:id/canciones", requireAuth, upload.single("portada"), artistaViewController.crearCancion);
router.get("/canciones/:id",                                     cancionViewController.renderDetalleCancion);
router.get("/canciones/:id/editar",   requireAuth,               artistaViewController.renderEditarCancion);
router.post("/canciones/:id/editar",  requireAuth, upload.single("portada"), artistaViewController.actualizarCancion);
router.post("/canciones/:id/eliminar", requireAuth,              artistaViewController.eliminarCancion);
router.post("/canciones/:id/reproducir",                         artistaViewController.reproducirCancion);

// ── Álbumes ───────────────────────────────────────────
router.get("/albums/:id/editar",      requireAuth,               artistaViewController.renderEditarAlbum);
router.post("/albums/:id/editar",     requireAuth, upload.single("portada"), artistaViewController.actualizarAlbum);
router.post("/albums/:id/eliminar",   requireAuth,               artistaViewController.eliminarAlbum);

module.exports = router;
