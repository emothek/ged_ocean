// const multer = require("multer");
// const path = require("path");
// const uuidv4 = require("crypto").randomUUID;

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },

//   filename: function (req, file, cb) {
//     cb(null, uuidv4() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload.single("file");

const path = require("path");
const uuidv4 = require("crypto").randomUUID;
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: "https://fra1.digitaloceanspaces.com",
  region: "fra1",
  credentials: {
    accessKeyId: "DO00UELWM88379BL6FZE",
    secretAccessKey: "sJsYPeCLaNAJOn29E/g4LwTSrpQX/thznics4JQ18ck",
  },
});

const uploadCloud = multer({
  storage: multerS3({
    s3: s3,
    bucket: "dzarchive-bucket",
    acl: "public-read",
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    credentials: {
      accessKeyId: "DO00UELWM88379BL6FZE",
      secretAccessKey: "sJsYPeCLaNAJOn29E/g4LwTSrpQX/thznics4JQ18ck",
    },

    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log("\n\n === uploadcloud ");
      console.log(file);
      cb(null, file.originalname);
    },
  }),
}).single("file");

// const s3Client = new S3({
//     forcePathStyle: false, // Configures to use subdomain/virtual calling format.
//     endpoint: "https://fra1.digitaloceanspaces.com",
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: "DO00UELWM88379BL6FZE",
//         secretAccessKey: "sJsYPeCLaNAJOn29E/g4LwTSrpQX/thznics4JQ18ck",
//     }
// });

// Specifies the new Space's name.
// const bucketParams = { Bucket: "dzarchive-bucket" };

// Set S3 endpoint to DigitalOcean Spaces
// const spacesEndpoint = new aws.Endpoint("fra1.digitaloceanspaces.com");
// const s3 = new aws.S3({
//   endpoint: spacesEndpoint,
// });

// //Change bucket property to your Space name
// const uploadCloud = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "dzarchive-bucket",
//     acl: "public-read",
//     //egion: "us-east-1",
//     credentials: {
//       accessKeyId: "DO00UELWM88379BL6FZE",
//       secretAccessKey: "sJsYPeCLaNAJOn29E/g4LwTSrpQX/thznics4JQ18ck",
//     },
//     key: function (request, file, cb) {
//       console.log(file);
//       cb(null, file.originalname);
//     },
//   }),
// }).single("file");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single("file");

module.exports = { upload, uploadCloud };
