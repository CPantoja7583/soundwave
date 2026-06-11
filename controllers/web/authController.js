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
  const value = String(next || "").trim();

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

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
  return {
    googleEnabled: hasGoogleConfig(),
    microsoftEnabled: hasMicrosoftConfig()
  };
}

function signInAndRedirect(res, usuario, next = "/") {
  const token = signAuthToken(usuario);
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return res.redirect(getSafeNext(next));
}

exports.renderLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("login", {
    pageTitle: "Iniciar sesión",
    next: getSafeNext(req.query.next),
    ...getOAuthViewFlags()
  });
};

exports.login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const next = getSafeNext(req.body.next);

  const usuario = await Usuario.findOne({ where: { email } });
  const passwordOk = usuario?.passwordHash
    ? await bcrypt.compare(password, usuario.passwordHash)
    : false;

  if (!usuario || !passwordOk) {
    return res.status(401).render("login", {
      pageTitle: "Iniciar sesión",
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
      errorMessage: "La contraseña debe tener al menos 8 caracteres."
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).render("register", {
      ...viewData,
      errorMessage: "Las contraseñas no coinciden."
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
  res.clearCookie(AUTH_COOKIE_NAME);
  return res.redirect("/");
};

exports.startGoogleLogin = (req, res, next) => {
  if (!hasGoogleConfig()) {
    return res.status(503).render("login", {
      pageTitle: "Iniciar sesión",
      next: getSafeNext(req.query.next),
      errorMessage: "Google login is not configured yet.",
      ...getOAuthViewFlags()
    });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    state: getSafeNext(req.query.next)
  })(req, res, next);
};

exports.handleGoogleCallback = (req, res, next) => {
  return passport.authenticate("google", { session: false }, (error, usuario, info) => {
    if (error || !usuario) {
      return res.status(401).render("login", {
        pageTitle: "Iniciar sesión",
        errorMessage: "No fue posible iniciar sesión con Google.",
        ...getOAuthViewFlags()
      });
    }

    return signInAndRedirect(res, usuario, req.query.state);
  })(req, res, next);
};

exports.startMicrosoftLogin = (req, res, next) => {
  if (!hasMicrosoftConfig()) {
    return res.status(503).render("login", {
      pageTitle: "Iniciar sesión",
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
        pageTitle: "Iniciar sesión",
        errorMessage: "No fue posible iniciar sesión con Microsoft.",
        ...getOAuthViewFlags()
      });
    }

    return signInAndRedirect(res, usuario, req.query.state);
  })(req, res, next);
};
