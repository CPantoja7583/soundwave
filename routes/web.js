const express = require("express");
const homeController = require("../controllers/web/homeController");
const artistaViewController = require("../controllers/web/artistaViewController");

const router = express.Router();

router.get("/", homeController.renderHome);
router.get("/artistas/genero/:genero", artistasController.renderBuscarPorGenero);

router.get("/artistas/nuevo", artistaViewController.renderNuevoArtista);
router.post("/artistas", artistaViewController.crearArtista);
router.get("/artistas/:id", artistaViewController.renderDetalleArtista);
router.get("/artistas/:id/editar", artistaViewController.renderEditarArtista);
router.post("/artistas/:id/editar", artistaViewController.actualizarArtista);
router.post("/artistas/:id/eliminar", artistaViewController.eliminarArtista);

router.post("/artistas/:id/canciones", artistaViewController.crearCancion);
router.post("/canciones/:id/eliminar", artistaViewController.eliminarCancion);
router.post("/canciones/:id/reproducir", artistaViewController.reproducirCancion);

module.exports = router;
