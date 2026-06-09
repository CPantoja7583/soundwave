const express = require("express");
const artistaController = require("../controllers/api/artistaController");
const cancionController = require("../controllers/api/cancionController");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * /api/genero/{genero}:
 *   get:
 *     summary: Buscar artistas por genero
 *     description: Devuelve los artistas que coinciden con el genero enviado en la URL.
 *     tags: [Artistas]
 *     parameters:
 *       - in: path
 *         name: genero
 *         required: true
 *         schema:
 *           type: string
 *         example: Alternativo
 *     responses:
 *       200:
 *         description: Lista de artistas encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Artista'
 *       404:
 *         description: No se encontraron artistas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/genero/:genero", artistaController.buscarPorGenero);

/**
 * @swagger
 * /api/artistas:
 *   get:
 *     summary: Listar artistas
 *     tags: [Artistas]
 *     responses:
 *       200:
 *         description: Lista completa de artistas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Artista'
 *   post:
 *     summary: Crear artista
 *     security:
 *       - bearerAuth: []
 *     tags: [Artistas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArtistaInput'
 *     responses:
 *       201:
 *         description: Artista creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Artista'
 *                 message:
 *                   type: string
 *                   example: Artista creado correctamente.
 *       400:
 *         description: Datos invalidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/artistas", artistaController.listarArtistas);
router.post("/artistas", requireAuth, artistaController.crearArtista);

/**
 * @swagger
 * /api/artistas/{id}:
 *   get:
 *     summary: Obtener artista con canciones
 *     tags: [Artistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Artista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ArtistaConCanciones'
 *       404:
 *         description: Artista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   put:
 *     summary: Actualizar artista
 *     security:
 *       - bearerAuth: []
 *     tags: [Artistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArtistaInput'
 *     responses:
 *       200:
 *         description: Artista actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Artista'
 *                 message:
 *                   type: string
 *                   example: Artista actualizado.
 *       400:
 *         description: Datos invalidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Artista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     summary: Eliminar artista
 *     security:
 *       - bearerAuth: []
 *     tags: [Artistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Artista eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Artista eliminado.
 *       404:
 *         description: Artista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/artistas/:id", artistaController.obtenerArtista);
router.put("/artistas/:id", requireAuth, artistaController.actualizarArtista);
router.delete("/artistas/:id", requireAuth, artistaController.eliminarArtista);

/**
 * @swagger
 * /api/artistas/{id}/canciones:
 *   get:
 *     summary: Listar canciones de un artista
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Canciones del artista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cancion'
 *       404:
 *         description: Artista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Crear cancion para un artista
 *     security:
 *       - bearerAuth: []
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancionInput'
 *     responses:
 *       201:
 *         description: Cancion creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cancion'
 *                 message:
 *                   type: string
 *                   example: Cancion creada correctamente.
 *       400:
 *         description: Datos invalidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Artista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/artistas/:id/canciones", cancionController.listarPorArtista);
router.post("/artistas/:id/canciones", requireAuth, cancionController.crearPorArtista);

/**
 * @swagger
 * /api/canciones/{id}:
 *   delete:
 *     summary: Eliminar cancion
 *     security:
 *       - bearerAuth: []
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cancion eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cancion eliminada.
 *       404:
 *         description: Cancion no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete("/canciones/:id", requireAuth, cancionController.eliminarCancion);

/**
 * @swagger
 * /api/canciones/{id}/play:
 *   post:
 *     summary: Registrar reproduccion
 *     tags: [Canciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reproduccion registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cancion'
 *                 message:
 *                   type: string
 *                   example: Reproduccion registrada.
 *       404:
 *         description: Cancion no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/canciones/:id/play", cancionController.reproducirCancion);

/**
 * @swagger
 * /api/canciones/shuffle:
 *   get:
 *     summary: Obtener cancion aleatoria
 *     tags: [Canciones]
 *     responses:
 *       200:
 *         description: Cancion aleatoria con su artista
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CancionConArtista'
 *       404:
 *         description: No hay canciones disponibles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get("/canciones/shuffle", cancionController.obtenerShuffle);

module.exports = router;
