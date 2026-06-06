const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'foto') {
      cb(null, 'public/uploads/artistas');
    } else if (file.fieldname === 'portada') {
      cb(null, 'public/uploads/albums');
    } else {
      cb(null, 'public/uploads/portadas');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;