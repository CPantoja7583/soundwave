const bcrypt = require("bcryptjs");
const { Usuario } = require("../../models");
const {
  AUTH_COOKIE_NAME,
  signAuthToken,
  getAuthCookieOptions
} = require("../../utils/auth");

function getSafeNext(next) {
  const value = String(next || "").trim();

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value.startsWith("/login") || value.startsWith("/logout")) {
    return "/";
  }

  return value;
}

exports.renderLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("login", {
    pageTitle: "Login admin",
    next: getSafeNext(req.query.next)
  });
};

exports.login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const next = getSafeNext(req.body.next);

  const usuario = await Usuario.findOne({ where: { email } });
  const passwordOk = usuario
    ? await bcrypt.compare(password, usuario.passwordHash)
    : false;

  if (!usuario || !passwordOk) {
    return res.status(401).render("login", {
      pageTitle: "Login admin",
      email,
      next,
      errorMessage: "Credenciales incorrectas."
    });
  }

  const token = signAuthToken(usuario);

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return res.redirect(next);
};

exports.logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  return res.redirect("/");
};
