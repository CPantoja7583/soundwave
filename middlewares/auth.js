const { AUTH_COOKIE_NAME, verifyAuthToken } = require("../utils/auth");

function readToken(req) {
  // La app web usa cookie HttpOnly. La API tambi?n acepta Authorization Bearer
  // para que herramientas como Postman puedan probar endpoints protegidos.
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return req.cookies?.[AUTH_COOKIE_NAME];
}

function attachCurrentUser(req, res, next) {
  // Este middleware corre antes de las rutas. Si encuentra un JWT v?lido,
  // deja el usuario disponible en req.user para controladores y en
  // res.locals.authUser para las vistas Handlebars.
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
    // Si el token expir? o fue modificado, borramos la cookie para evitar
    // que el usuario quede atrapado con una sesi?n inv?lida.
    res.clearCookie(AUTH_COOKIE_NAME);
  }

  return next();
}

function requireAuth(req, res, next) {
  // Protege acciones de administraci?n. No decide roles todav?a: por ahora
  // cualquier usuario autenticado puede colaborar.
  if (req.user) {
    return next();
  }

  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({
      ok: false,
      message: "Debes iniciar sesion para realizar esta accion."
    });
  }

  // En vistas web redirigimos a login y guardamos la URL original en next.
  // As?, despu?s de iniciar sesi?n, el usuario vuelve donde quer?a ir.
  return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

module.exports = {
  attachCurrentUser,
  requireAuth
};
