const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const { Usuario } = require("../models");

function hasGoogleConfig() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
}

function hasMicrosoftConfig() {
  return Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.MICROSOFT_CALLBACK_URL
  );
}

async function findOrCreateOAuthUser({ provider, providerId, email, nombre }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const safeName = String(nombre || normalizedEmail || "SoundWave User").trim();

  if (!normalizedEmail) {
    throw new Error("OAuth provider did not return an email address.");
  }

  const existingByProvider = await Usuario.findOne({
    where: {
      provider,
      providerId: String(providerId)
    }
  });

  if (existingByProvider) {
    return existingByProvider;
  }

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
