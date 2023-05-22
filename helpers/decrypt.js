const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const getCipherKey = require("./getCipherKey");

function decrypt({ file, password }) {
  return new Promise((resolve, reject) => {
    // First, get the initialization vector from the file.
    const readInitVect = fs.createReadStream(file, { end: 15 });

    let initVect;
    readInitVect.on("data", (chunk) => {
      initVect = chunk;
    });

    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on("close", () => {
      const cipherKey = getCipherKey(password);
      const readStream = fs.createReadStream(file, { start: 16 });
      const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
      const unzip = zlib.createUnzip();
      const originalFile = file.split(".enc")[0];
      const writeStream = fs.createWriteStream(originalFile);

      readStream.pipe(decipher).pipe(unzip).pipe(writeStream);

      writeStream.on("finish", () => {
        // delete original un-encrypted file
        console.log("writing to succeeded");
        console.log("--->  ", file + ".unenc");
        //const blob = fs.readFileSync(path.join(file + ".unenc"));
        const blob = path.join(originalFile);
        console.log(blob);
        resolve(blob);
      });
      writeStream.on("error", (err) => {
        console.log(err);
        reject(err);
      });
    });
  });
}

module.exports = decrypt;
