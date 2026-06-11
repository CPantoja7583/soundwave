const jwt = require("jsonwebtoken");

// Nombre de la cookie donde guardamos el JWT.
// Es mejor centralizarlo para que login, logout y middleware usen el mismo nombre.
const AUTH_COOKIE_NAME = "soundwave_token";
const TOKEN_EXPIRES_IN = "8h";
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000;

function getJwtSecret() {
  // JWT_SECRET es la llave privada con la que firmamos/verificamos tokens.
  // Si falta, preferimos fallar expl?citamente en vez de crear tokens inseguros.
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return secret;
}

function signAuthToken(usuario) {
  // El token no guarda la contrase?a. Solo guarda datos m?nimos para reconocer
  // al usuario en pr?ximas peticiones.
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: usuario.role
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function verifyAuthToken(token) {
  // Verificar significa comprobar firma y expiraci?n. Si algo falla,
  // jsonwebtoken lanza un error y el middleware borra la cookie.
  return jwt.verify(token, getJwtSecret());
}

function getAuthCookieOptions() {
  // httpOnly impide que JavaScript del navegador lea la cookie.
  // sameSite=lax protege contra varios ataques CSRF simples.
  // secure solo se activa en producci?n porque local normalmente usa HTTP.
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE
  };
}

module.exports = {
  AUTH_COOKIE_NAME,
  COOKIE_MAX_AGE,
  signAuthToken,
  verifyAuthToken,
  getAuthCookieOptions
};
