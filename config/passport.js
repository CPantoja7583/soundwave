const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const { Usuario } = require("../models");

// Passport es la librer?a que sabe hablar con proveedores externos.
// En este proyecto NO usamos sesiones de Passport; solo lo usamos para
// obtener el perfil de Google/Microsoft y luego emitimos nuestro propio JWT.

function hasGoogleConfig() {
  // Si falta una de estas variables, Google queda apagado a prop?sito.
  // Esto permite que el proyecto funcione localmente aunque nadie tenga
  // todav?a credenciales reales de Google Cloud.
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
}

function hasMicrosoftConfig() {
  // Misma idea para Microsoft: la estrategia solo se registra cuando
  // existen client id, secret y callback URL.
  return Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.MICROSOFT_CALLBACK_URL
  );
}

async function findOrCreateOAuthUser({ provider, providerId, email, nombre }) {
  // Normalizamos el email porque ser? el dato com?n entre login local,
  // Google y Microsoft. As? evitamos duplicados por may?sculas/min?sculas.
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const safeName = String(nombre || normalizedEmail || "SoundWave User").trim();

  if (!normalizedEmail) {
    throw new Error("OAuth provider did not return an email address.");
  }

  // Primero buscamos por provider + providerId. Ese par identifica de forma
  // estable al usuario dentro de Google o Microsoft.
  const existingByProvider = await Usuario.findOne({
    where: {
      provider,
      providerId: String(providerId)
    }
  });

  if (existingByProvider) {
    return existingByProvider;
  }

  // Si no encontramos por provider, intentamos unir con una cuenta local
  // que ya tenga el mismo email. As? un usuario puede registrarse con email
  // y despu?s entrar con Google sin crear dos cuentas.
  const existingByEmail = await Usuario.findOne({
    where: { email: normalizedEmail }
  });

  if (existingByEmail) {
    await existingByEmail.update({
      provider,
      providerId: String(providerId)
    });
    return existingByEmail;
  }

  // Si es un usuario nuevo, lo creamos sin passwordHash porque la contrase?a
  // la valida Google/Microsoft, no nuestra base de datos.
  return Usuario.create({
    nombre: safeName,
    email: normalizedEmail,
    passwordHash: null,
    provider,
    providerId: String(providerId),
    role: "user"
  });
}

function configurePassport() {
  // Esta funci?n se llama al arrancar la app. Registra las estrategias
  // disponibles seg?n las variables de entorno configuradas.
  if (hasGoogleConfig()) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const user = await findOrCreateOAuthUser({
              provider: "google",
              providerId: profile.id,
              email,
              nombre: profile.displayName
            });
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  if (hasMicrosoftConfig()) {
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          callbackURL: process.env.MICROSOFT_CALLBACK_URL,
          scope: ["user.read"]
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName;
            const user = await findOrCreateOAuthUser({
              provider: "microsoft",
              providerId: profile.id,
              email,
              nombre: profile.displayName
            });
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
}

module.exports = {
  configurePassport,
  hasGoogleConfig,
  hasMicrosoftConfig
};
