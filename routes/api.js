const express = require("express");
const artistaController = require("../controllers/api/artistaController");
const cancionController = require("../controllers/api/cancionController");

const router = express.Router();

router.get("/artistas", artistaController.listarArtistas);
router.get("/artistas/:id", artistaController.obtenerArtista);
router.post("/artistas", artistaController.crearArtista);
router.put("/artistas/:id", artistaController.actualizarArtista);
router.delete("/artistas/:id", artistaController.eliminarArtista);

router.get("/artistas/:id/canciones", cancionController.listarPorArtista);
router.post("/artistas/:id/canciones", cancionController.crearPorArtista);
router.delete("/canciones/:id", cancionController.eliminarCancion);
router.post("/canciones/:id/play", cancionController.reproducirCancion);
router.get("/canciones/shuffle", cancionController.obtenerShuffle);

module.exports = router;
