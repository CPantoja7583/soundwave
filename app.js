require("dotenv").config();

const path = require("path");
const express = require("express");
const { create } = require("express-handlebars");
const webRoutes = require("./routes/web");
const apiRoutes = require("./routes/api");
const { sequelize } = require("./models");
const { seedDatabase } = require("./scripts/seed");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const hbs = create({
  extname: ".handlebars",
  helpers: {
    eq(left, right) {
      return left === right;
    }
  }
});

app.engine(".handlebars", hbs.engine);
app.set("view engine", ".handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "SoundWave arriba y sonando." });
});

app.use("/", webRoutes);
app.use("/api", apiRoutes);

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
    await sequelize.sync();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`SoundWave disponible en http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar la aplicacion:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};
