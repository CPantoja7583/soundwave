const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "soundwave_token";
const TOKEN_EXPIRES_IN = "8h";
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return secret;
}

function signAuthToken(usuario) {
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
  return jwt.verify(token, getJwtSecret());
}

function getAuthCookieOptions() {
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
