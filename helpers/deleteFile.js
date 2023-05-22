const fs = require("fs");

function deleteFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) {
        reject(err);
      }
      console.log("Delete File successfully.");
      resolve();
    });
  });
}

module.exports = deleteFile;
