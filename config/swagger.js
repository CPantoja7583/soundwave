const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// URL base del servidor para Swagger.
// Si existe la variable de entorno SWAGGER_SERVER_URL la usa,
// si no, construye la URL local con el puerto definido en .env.
const serverUrl = process.env.SWAGGER_SERVER_URL || `http://127.0.0.1:${Number(process.env.PORT) || 3000}`;

// Configuración principal de Swagger.
// Define la versión de OpenAPI, info del proyecto,
// servidor y los esquemas reutilizables de la API.
const options = {
  definition: {
    openapi: "3.0.0",

    // Información general visible en la UI de Swagger.
    info: {
      title: "SoundWave API",
      version: "1.0.0",
      description: "Documentacion REST de SoundWave para pruebas del equipo en Swagger y Postman."
    },

    // Servidor donde se ejecuta la API.
    servers: [
      {
        url: serverUrl,
        description: "Servidor local"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      // Esquemas reutilizables que describen la estructura
      // de los datos que devuelve y recibe la API.
      schemas: {

        // Representación completa de un artista en la DB.
        Artista: {
          type: "object",
          properties: {
            id:        { type: "integer",  example: 1 },
            nombre:    { type: "string",   example: "Bomba Estereo" },
            genero:    { type: "string",   example: "Alternativo" },
            pais:      { type: "string",   example: "Colombia" },
            createdAt: { type: "string",   format: "date-time" },
            updatedAt: { type: "string",   format: "date-time" }
          }
        },

        // Representación completa de una canción en la DB.
        Cancion: {
          type: "object",
          properties: {
            id:             { type: "integer", example: 1 },
            titulo:         { type: "string",  example: "To My Love" },
            album:          { type: "string",  example: "Amanecer" },
            duracion:       { type: "integer", example: 228, description: "Duracion en segundos" },
            reproducciones: { type: "integer", example: 1250 },
            artistaId:      { type: "integer", example: 1 },
            createdAt:      { type: "string",  format: "date-time" },
            updatedAt:      { type: "string",  format: "date-time" }
          }
        },

        // Canción con su artista anidado — usado en endpoints
        // que devuelven la canción con información del artista incluida.
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

        // Artista con su lista de canciones anidada — usado en
        // el endpoint de detalle del artista.
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

        // Esquema de entrada para crear o actualizar un artista.
        // Solo incluye los campos que el cliente puede enviar.
        ArtistaInput: {
          type: "object",
          required: ["nombre", "genero", "pais"],
          properties: {
            nombre: { type: "string", example: "Los Bunkers" },
            genero: { type: "string", example: "Rock" },
            pais:   { type: "string", example: "Chile" }
          }
        },

        // Esquema de entrada para crear o actualizar una canción.
        CancionInput: {
          type: "object",
          required: ["titulo", "album", "duracion"],
          properties: {
            titulo:   { type: "string",  example: "Llueve sobre la ciudad" },
            album:    { type: "string",  example: "Barrio Estacion" },
            duracion: { type: "integer", example: 243, description: "Duracion en segundos" }
          }
        },

        // Esquema estándar de error para respuestas fallidas de la API.
        ApiError: {
          type: "object",
          properties: {
            ok:      { type: "boolean", example: false },
            message: { type: "string",  example: "Artista no encontrado." }
          }
        }
      }
    }
  },

  // Ruta donde Swagger busca los comentarios JSDoc
  // con las definiciones de cada endpoint (@swagger).
  apis: [path.join(__dirname, "..", "routes", "api.js")]
};

// Genera el objeto de especificación OpenAPI a partir de las opciones.
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
