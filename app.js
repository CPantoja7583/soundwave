require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { create } = require("express-handlebars");
const webRoutes = require("./routes/web");
const apiRoutes = require("./routes/api");
const { sequelize } = require("./models");
const { seedDatabase } = require("./scripts/seed");
const { ensureAdminUser } = require("./scripts/ensureAdmin");
const { swaggerUi, swaggerSpec } = require("./config/swagger");
const { attachCurrentUser } = require("./middlewares/auth");
const { configurePassport } = require("./config/passport");

// Creamos la aplicacion principal de Express.
// Desde aqui configuramos middlewares, rutas y el arranque del servidor.
const app = express();
const PORT = Number(process.env.PORT) || 3000;

configurePassport();

// Handlebars sera el motor de vistas del proyecto.
// El helper "eq" sirve para comparar valores dentro de las plantillas.
const hbs = create({
  extname: ".handlebars",
  helpers: {
    eq(left, right) {
      return left === right;
    },
    encodeURIComponent(value) {
      return encodeURIComponent(String(value || ""));
    }
  }
});

// Le indicamos a Express como renderizar vistas y donde encontrarlas.
app.engine(".handlebars", hbs.engine);
app.set("view engine", ".handlebars");
app.set("views", path.join(__dirname, "views"));

// Middlewares base:
// - express.json() lee cuerpos JSON
// - express.urlencoded() lee formularios HTML
// - express.static() expone CSS e imagenes al navegador
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(attachCurrentUser);
app.use(express.static(path.join(__dirname, "public")));

// Ruta de salud para comprobar rapido que la aplicacion esta levantada.
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "SoundWave arriba y sonando." });
});

// Swagger vive fuera del frontend Handlebars porque documenta la API REST.
app.get("/api-docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Separamos las rutas por responsabilidad:
// - "/" usa controladores web que renderizan vistas o redirigen
// - "/api" usa controladores REST que responden JSON
app.use("/", webRoutes);
app.use("/api", apiRoutes);

// Middleware global de errores.
// Si el fallo ocurre en la API devolvemos JSON.
// Si ocurre en la parte web devolvemos una vista amigable.
app.use((error, req, res, next) => {
  console.error(error);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(500).json({
      ok: false,
      message: "Ocurrio un error inesperado."
    });
  }

  return res.status(500).render("artista-form", {
    pageTitle: "Error interno",
    formTitle: "Algo salio mal",
    submitLabel: "Volver",
    formAction: "/",
    artist: {
      nombre: "",
      genero: "",
      pais: ""
    },
    errorMessage: "Ocurrio un error inesperado."
  });
});

async function startServer() {
  try {
    // alter:true ayuda a que este proyecto academico incorpore
    // nuevos campos y tablas sin migraciones manuales.
    await sequelize.sync({ alter: true });
    await ensureAdminUser();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`SoundWave disponible en http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar la aplicacion:", error.message);
    process.exit(1);
  }
}

// Esta condicion permite importar la app en pruebas sin iniciar el servidor
// automaticamente. Solo se levanta si ejecutamos "node app.js" directamente.
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};
