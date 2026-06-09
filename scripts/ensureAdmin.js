const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");

async function ensureAdminUser() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const nombre = String(process.env.ADMIN_NAME || "SoundWave Admin").trim();

  if (!email || !password) {
    console.warn("ADMIN_EMAIL and ADMIN_PASSWORD are not configured; admin login will not be available.");
    return;
  }

  const existingUser = await Usuario.findOne({ where: { email } });

  if (existingUser) {
    return;
  }

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
