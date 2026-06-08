// ── Configuración de Multer para subida de imágenes ──
// Multer es un middleware que maneja archivos enviados
// desde formularios con enctype="multipart/form-data".
const multer = require('multer');
const path   = require('path');

// Define dónde y cómo se guardan los archivos subidos.
// diskStorage guarda los archivos directamente en disco
// en vez de mantenerlos en memoria.
const storage = multer.diskStorage({

  // Carpeta de destino según el campo del formulario.
  // 'foto'    → imágenes de artistas
  // 'portada' → portadas de álbumes
  destination: (req, file, cb) => {
    if (file.fieldname === 'foto') {
      cb(null, 'public/uploads/artistas');
    } else if (file.fieldname === 'portada') {
      cb(null, 'public/uploads/albums');
    } else {
      cb(null, 'public/uploads/portadas');
    }
  },

  // Genera un nombre único para evitar colisiones entre archivos.
  // Combina timestamp + número aleatorio + extensión original.
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// Valida que el archivo sea una imagen permitida.
// Verifica tanto la extensión del nombre como el tipo MIME
// para evitar que se suban archivos disfrazados de imágenes.
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};

// Instancia de Multer con las opciones definidas arriba.
// Límite de 2MB por archivo para evitar subidas excesivas.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;