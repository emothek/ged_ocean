const multer  = require('multer')
const path  = require('path')


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'logo/');
    },
  
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
  });
  
  
  const uploadLogo = multer({ storage: storage })


  module.exports = uploadLogo.single('file')