const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const serverUrl = process.env.SWAGGER_SERVER_URL || `http://127.0.0.1:${Number(process.env.PORT) || 3000}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundWave API",
      version: "1.0.0",
      description: "Documentacion REST de SoundWave para pruebas del equipo en Swagger y Postman."
    },
    servers: [
      {
        url: serverUrl,
        description: "Servidor local"
      }
    ],
    components: {
      schemas: {
        Artista: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Bomba Estereo" },
            genero: { type: "string", example: "Alternativo" },
            pais: { type: "string", example: "Colombia" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Cancion: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            titulo: { type: "string", example: "To My Love" },
            album: { type: "string", example: "Amanecer" },
            duracion: { type: "integer", example: 228, description: "Duracion en segundos" },
            reproducciones: { type: "integer", example: 1250 },
            artistaId: { type: "integer", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        CancionConArtista: {
          allOf: [
            { $ref: "#/components/schemas/Cancion" },
            {
              type: "object",
              properties: {
                artista: { $ref: "#/components/schemas/Artista" }
              }
            }
          ]
        },
        ArtistaConCanciones: {
          allOf: [
            { $ref: "#/components/schemas/Artista" },
            {
              type: "object",
              properties: {
                canciones: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Cancion" }
                }
              }
            }
          ]
        },
        ArtistaInput: {
          type: "object",
          required: ["nombre", "genero", "pais"],
          properties: {
            nombre: { type: "string", example: "Los Bunkers" },
            genero: { type: "string", example: "Rock" },
            pais: { type: "string", example: "Chile" }
          }
        },
        CancionInput: {
          type: "object",
          required: ["titulo", "album", "duracion"],
          properties: {
            titulo: { type: "string", example: "Llueve sobre la ciudad" },
            album: { type: "string", example: "Barrio Estacion" },
            duracion: { type: "integer", example: 243, description: "Duracion en segundos" }
          }
        },
        ApiError: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            message: { type: "string", example: "Artista no encontrado." }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, "..", "routes", "api.js")]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
