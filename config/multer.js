const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/actes/');
  },
  filename: (req, file, cb) => {
    const nomUnique = Date.now() + '-' + file.originalname;
    cb(null, nomUnique);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;