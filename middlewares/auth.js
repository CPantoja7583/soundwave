const { AUTH_COOKIE_NAME, verifyAuthToken } = require("../utils/auth");

function readToken(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return req.cookies?.[AUTH_COOKIE_NAME];
}

function attachCurrentUser(req, res, next) {
  const token = readToken(req);

  req.user = null;
  res.locals.authUser = null;

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    res.locals.authUser = payload;
  } catch (error) {
    res.clearCookie(AUTH_COOKIE_NAME);
  }

  return next();
}

function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }

  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({
      ok: false,
      message: "Debes iniciar sesion para realizar esta accion."
    });
  }

  return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

module.exports = {
  attachCurrentUser,
  requireAuth
};
