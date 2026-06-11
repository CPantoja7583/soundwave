const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");

async function ensureAdminUser() {
  // Este script se ejecuta al arrancar la aplicaci?n.
  // Su objetivo es que siempre exista al menos una cuenta administradora
  // sin tener que insertarla manualmente en PostgreSQL.
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const nombre = String(process.env.ADMIN_NAME || "SoundWave Admin").trim();

  if (!email || !password) {
    // No detenemos la app porque el cat?logo p?blico puede seguir funcionando.
    // Solo avisamos que no se podr? usar el login admin inicial.
    console.warn("ADMIN_EMAIL and ADMIN_PASSWORD are not configured; admin login will not be available.");
    return;
  }

  const existingUser = await Usuario.findOne({ where: { email } });

  if (existingUser) {
    return;
  }

  // Nunca guardamos la contrase?a plana. bcrypt genera un hash seguro que se
  // compara durante el login.
  const passwordHash = await bcrypt.hash(password, 12);

  await Usuario.create({
    nombre,
    email,
    passwordHash,
    role: "admin"
  });

  console.log(`Admin user created: ${email}`);
}

module.exports = {
  ensureAdminUser
};
