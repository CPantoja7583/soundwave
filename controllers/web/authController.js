const bcrypt = require("bcryptjs");
const passport = require("passport");
const { Usuario } = require("../../models");
const {
  AUTH_COOKIE_NAME,
  signAuthToken,
  getAuthCookieOptions
} = require("../../utils/auth");
const { hasGoogleConfig, hasMicrosoftConfig } = require("../../config/passport");

function getSafeNext(next) {
  // next indica a qu? URL volver despu?s del login.
  // Solo aceptamos rutas internas que empiezan con / para evitar open redirects
  // hacia sitios externos maliciosos.
  const value = String(next || "").trim();

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  // Evitamos redirigir nuevamente a pantallas de autenticaci?n.
  // Si permiti?ramos /login como next, el usuario podr?a quedar en un bucle raro.
  if (
    value.startsWith("/login") ||
    value.startsWith("/logout") ||
    value.startsWith("/register") ||
    value.startsWith("/auth/")
  ) {
    return "/";
  }

  return value;
}

function getOAuthViewFlags() {
  // Estas banderas permiten que las vistas muestren botones reales solo cuando
  // el proveedor est? configurado. Si falta configuraci?n, se muestra un estado
  // deshabilitado en vez de romper la p?gina.
  return {
    googleEnabled: hasGoogleConfig(),
    microsoftEnabled: hasMicrosoftConfig()
  };
}

function signInAndRedirect(res, usuario, next = "/") {
  // Punto com?n de entrada: sea login local, registro u OAuth, terminamos
  // firmando el mismo JWT y guard?ndolo en la misma cookie.
  const token = signAuthToken(usuario);
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return res.redirect(getSafeNext(next));
}

exports.renderLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("login", {
    pageTitle: "Iniciar sesi?n",
    next: getSafeNext(req.query.next),
    ...getOAuthViewFlags()
  });
};

exports.login = async (req, res) => {
  // Login local: buscamos por email y comparamos la contrase?a recibida contra
  // el hash guardado. Nunca se compara ni se guarda contrase?a en texto plano.
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const next = getSafeNext(req.body.next);

  const usuario = await Usuario.findOne({ where: { email } });
  const passwordOk = usuario?.passwordHash
    ? await bcrypt.compare(password, usuario.passwordHash)
    : false;

  if (!usuario || !passwordOk) {
    return res.status(401).render("login", {
      pageTitle: "Iniciar sesi?n",
      email,
      next,
      errorMessage: "Credenciales incorrectas.",
      ...getOAuthViewFlags()
    });
  }

  return signInAndRedirect(res, usuario, next);
};

exports.renderRegister = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("register", {
    pageTitle: "Crear cuenta",
    next: getSafeNext(req.query.next),
    ...getOAuthViewFlags()
  });
};

exports.register = async (req, res) => {
  // Registro local: validamos datos m?nimos, evitamos emails duplicados,
  // hasheamos la contrase?a y dejamos al usuario logueado al finalizar.
  const nombre = String(req.body.nombre || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const passwordConfirm = String(req.body.passwordConfirm || "");
  const next = getSafeNext(req.body.next);

  const viewData = {
    pageTitle: "Crear cuenta",
    nombre,
    email,
    next,
    ...getOAuthViewFlags()
  };

  if (nombre.length < 2) {
    return res.status(400).render("register", {
      ...viewData,
      errorMessage: "El nombre debe tener al menos 2 caracteres."
    });
  }

  if (password.length < 8) {
    return res.status(400).render("register", {
      ...viewData,
      errorMessage: "La contrase?a debe tener al menos 8 caracteres."
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).render("register", {
      ...viewData,
      errorMessage: "Las contrase?as no coinciden."
    });
  }

  const existingUser = await Usuario.findOne({ where: { email } });

  if (existingUser) {
    return res.status(409).render("register", {
      ...viewData,
      errorMessage: "Ya existe una cuenta con ese email."
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await Usuario.create({
    nombre,
    email,
    passwordHash,
    provider: "local",
    role: "user"
  });

  return signInAndRedirect(res, usuario, next);
};

exports.logout = (req, res) => {
  // Cerrar sesi?n aqu? significa borrar la cookie. Como usamos JWT stateless,
  // no hay sesi?n de servidor que destruir.
  res.clearCookie(AUTH_COOKIE_NAME);
  return res.redirect("/");
};

exports.startGoogleLogin = (req, res, next) => {
  if (!hasGoogleConfig()) {
    return res.status(503).render("login", {
      pageTitle: "Iniciar sesi?n",
      next: getSafeNext(req.query.next),
      errorMessage: "Google login is not configured yet.",
      ...getOAuthViewFlags()
    });
  }

  // state viaja hasta Google y vuelve al callback. Lo usamos para recordar
  // d?nde quer?a ir el usuario antes de iniciar OAuth.
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    state: getSafeNext(req.query.next)
  })(req, res, next);
};

exports.handleGoogleCallback = (req, res, next) => {
  // session:false porque no usamos sesi?n de Passport. Passport solo valida
  // el proveedor; luego nosotros creamos la cookie JWT con signInAndRedirect.
  return passport.authenticate("google", { session: false }, (error, usuario, info) => {
    if (error || !usuario) {
      return res.status(401).render("login", {
        pageTitle: "Iniciar sesi?n",
        errorMessage: "No fue posible iniciar sesi?n con Google.",
        ...getOAuthViewFlags()
      });
    }

    return signInAndRedirect(res, usuario, req.query.state);
  })(req, res, next);
};

exports.startMicrosoftLogin = (req, res, next) => {
  if (!hasMicrosoftConfig()) {
    return res.status(503).render("login", {
      pageTitle: "Iniciar sesi?n",
      next: getSafeNext(req.query.next),
      errorMessage: "Microsoft login is not configured yet.",
      ...getOAuthViewFlags()
    });
  }

  return passport.authenticate("microsoft", {
    state: getSafeNext(req.query.next)
  })(req, res, next);
};

exports.handleMicrosoftCallback = (req, res, next) => {
  return passport.authenticate("microsoft", { session: false }, (error, usuario, info) => {
    if (error || !usuario) {
      return res.status(401).render("login", {
        pageTitle: "Iniciar sesi?n",
        errorMessage: "No fue posible iniciar sesi?n con Microsoft.",
        ...getOAuthViewFlags()
      });
    }

    return signInAndRedirect(res, usuario, req.query.state);
  })(req, res, next);
};
