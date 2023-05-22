const multer = require("multer");
const path = require("path");
const uuidv4 = require("crypto").randomUUID;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "snapshot/uploads/"); // packaged verion
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload.single("file");
