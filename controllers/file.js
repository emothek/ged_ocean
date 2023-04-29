const { PrismaClient } = require("@prisma/client");
const tesseract = require("node-tesseract-ocr");
const path = require("path");
const exec = require("child_process").exec;
const { readdir } = require("fs").promises;
const fs = require("fs");
const nodemailer = require("nodemailer");
//schema validator
const { validateFile } = require("../utils/ShemaValidator");
//const pdfjsLib = require('pdfjs-dist');
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { writeFileSync, writeFile } = require("fs");

const s3 = new S3Client({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: "https://fra1.digitaloceanspaces.com",
  region: "fra1",
  credentials: {
    accessKeyId: "DO00UELWM88379BL6FZE",
    secretAccessKey: "sJsYPeCLaNAJOn29E/g4LwTSrpQX/thznics4JQ18ck",
  },
});

//get files from 'images' directory

const getFileList = async (dirName) => {
  let files = [];
  const items = await readdir(dirName, { withFileTypes: true });
  for (const i of items) {
    if (i.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${i.name}`))];
    } else {
      files.push(`${dirName}/${i.name}`);
    }
  }
  return files;
};

//delete files from 'images' directory after extraction
const deleteFileList = (dirName) => {
  getFileList(dirName).then((files) => {
    for (const file of files) {
      fs.unlinkSync(file);
    }
  });
};

const prisma = new PrismaClient();

// save file to database

exports.createFile = async (data) => {
  await prisma.file.create({
    data: data,
  });
};

//extract text from uploaded file and save it to db

exports.uploadFile = async (req, res, next) => {
  // console.log(req);
  console.log("\n\n\n post processing .... ------");
  console.log(req.body);
  console.log(req.file);
  console.log(req.files?.file);
  const { file } = req;
  let title = "";
  if (req.body.title) {
    title = req.body.title;
  } else {
    title = file.originalname;
  }
  let user = req.user;

  const nArticle = req.body.nArticle;
  const description = req.body.description;
  const dateExtreme = req.body.dateExtreme;
  const dateElimination = req.body.dateElimination;
  const observation = req.body.observation;
  const boiteId = req.body.boiteId;

  if (user && file) {
    data = {
      title: title + "." + file.originalname.split(".").pop(),
      content: "",
      nArticle: nArticle,
      path: req.file.location,
      description: description,
      dateExtreme: new Date(dateExtreme),
      dateElimination: new Date(dateElimination),
      observation: observation,
      boiteId: parseInt(boiteId),
      authorId: user.id,
    };
    console.log(data);
    const valid = validateFile(data);
    if (!valid) {
      console.log(validateFile.errors);
      res.status(400).send(validateFile.errors);
      return false;
    }
    const config = {
      lang: "fra+ara+eng",
      oem: 1,
      psm: 3,
    };
    mt = file.mimetype.split("/")[0];

    type = file.originalname.split(".").pop();
    //let numPages;
    const boite = await prisma.boite.findUnique({
      where: {
        id: data.boiteId,
      },
      include: {
        bordereauVersement: true,
        files: true,
      },
    });
    if (boite && boite.files.length < boite.bordereauVersement.nbr_articles) {
      try {
        if (type == "pdf") {
          let dir = path.join(__dirname, "/images");
          const outputFile = path.join(dir, "/test");
          /*pdfjsLib.getDocument(data.path).promise.then(function (doc) {
                     numPages = doc.numPages;
                    
                    console.log('Number of Pages: ' + numPages);
                })*/
          cmd = `pdftoppm ${data.path} ${outputFile} -png`;
          exec(await cmd, (err, stdout, stderr) => {
            if (err) {
              console.error(`exec error: ${err}`);
              return;
            } else {
              getFileList(dir).then((files) => {
                tesseract
                  .recognize(files, config)
                  .then((text) => {
                    data.content = text;

                    console.log("extraction done");
                    if (
                      this.createFile(data)
                        .then(() => {
                          return res.status(201).json({
                            status: "success",
                            data: {
                              message: "Fichier crée.",
                            },
                            statusCode: res.statusCode,
                          });
                        })
                        .catch((err) => res.status(400).send(err))
                    )
                      deleteFileList(dir);
                  })
                  .catch((error) => {
                    console.log(error.message);
                  });
              });
            }
          });
        } else if (mt == "image") {
          await tesseract
            .recognize(file.location, config)
            .then((text) => {
              data.content = text;
              this.createFile(data)
                .then(() => {
                  return res.status(201).json({
                    status: "success",
                    data: {
                      message: "Fichier crée.",
                    },
                    statusCode: res.statusCode,
                  });
                })
                .catch((err) => res.status(400).send(err));
            })
            .catch((error) => {
              console.log(error.message);
            });
        } else {
          this.createFile(data)
            .then(() => {
              return res.status(201).json({
                status: "success",
                data: {
                  message: "Fichier crée.",
                },
                statusCode: res.statusCode,
              });
            })
            .catch((err) => res.status(400).send(err));
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      res
        .status(401)
        .send("Vous ne pouvez plus ajouter d'articles dans ce bordereau");
    }
  } else {
    res.status(400).json({
      status: "error",
    });
  }
};

// exports.uploadFile = async (req, res) => {
//   const file = req?.files[0];

//   console.log("\n\n\n ------ ====");
//   console.log(file);
//   let title = "";
//   if (req.body.title) {
//     title = req.body.title;
//   } else {
//     title = file.originalname;
//   }
//   let user = req.user;

//   if (user) {
//     data = {
//       title: title + "." + file.originalname.split(".").pop(),
//       content: "",
//       nArticle: req.body.nArticle,
//       path: file.location,
//       description: req.body.description,
//       dateExtreme: new Date(req.body.dateExtreme),
//       dateElimination: new Date(req.body.dateElimination),
//       observation: req.body.observation,
//       boiteId: parseInt(req.body.boiteId),
//       authorId: user.id,
//     };
//     const valid = validateFile(data);
//     if (!valid) {
//       console.log(validateFile.errors);
//       res.status(400).send(validateFile.errors);
//       return false;
//     }
//     const config = {
//       lang: "fra+ara+eng",
//       oem: 1,
//       psm: 3,
//     };
//     mt = file.mimetype.split("/")[0];

//     type = file.originalname.split(".").pop();
//     let numPages;
//     const boite = await prisma.boite.findUnique({
//       where: {
//         id: data.boiteId,
//       },
//       include: {
//         bordereauVersement: true,
//         files: true,
//       },
//     });

//     console.log("\n\n --------");
//     console.log(file);
//     console.log(file.path);
//     if (boite && boite.files.length < boite.bordereauVersement.nbr_articles) {
//       try {
//         if (type == "pdf") {
//           let dir = path.join(__dirname, "/images");
//           const outputFile = path.join(dir, "/test");
//           /*pdfjsLib.getDocument(data.path).promise.then(function (doc) {
//                      numPages = doc.numPages;

//                     console.log('Number of Pages: ' + numPages);
//                 })*/
//           cmd = `pdftoppm ${data.path} ${outputFile} -png`;
//           exec(await cmd, (err, stdout, stderr) => {
//             if (err) {
//               console.error(`exec error: ${err}`);
//               return;
//             } else {
//               getFileList(dir).then((files) => {
//                 tesseract
//                   .recognize(files, config)
//                   .then((text) => {
//                     data.content = text;

//                     console.log("extraction done");
//                     if (
//                       this.createFile(data)
//                         .then(() => {
//                           return res.status(201).json({
//                             status: "success",
//                             data: {
//                               message: "Fichier crée.",
//                             },
//                             statusCode: res.statusCode,
//                           });
//                         })
//                         .catch((err) => res.status(400).send(err))
//                     )
//                       deleteFileList(dir);
//                   })
//                   .catch((error) => {
//                     console.log(error.message);
//                   });
//               });
//             }
//           });
//         } else if (mt == "image") {
//           await tesseract
//             .recognize(file.path, config)
//             .then((text) => {
//               data.content = text;
//               this.createFile(data)
//                 .then(() => {
//                   return res.status(201).json({
//                     status: "success",
//                     data: {
//                       message: "Fichier crée.",
//                     },
//                     statusCode: res.statusCode,
//                   });
//                 })
//                 .catch((err) => res.status(400).send(err));
//             })
//             .catch((error) => {
//               console.log(error.message);
//             });
//         } else {
//           this.createFile(data)
//             .then(() => {
//               return res.status(201).json({
//                 status: "success",
//                 data: {
//                   message: "Fichier crée.",
//                 },
//                 statusCode: res.statusCode,
//               });
//             })
//             .catch((err) => res.status(400).send(err));
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     } else {
//       res
//         .status(401)
//         .send("Vous ne pouvez plus ajouter d'articles dans ce bordereau");
//     }
//   } else {
//     res.status(400).json({
//       status: "error",
//     });
//   }
// };

// Function to turn the file's body into a string.
const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

exports.downloadFile = async (req, res) => {
  const file = req.files[0];

  // Specifies a path within your bucket and the file to download.
  const bucketParams = {
    Bucket: "dzarchive-bucket",
    Key: file.key,
  };
  try {
    const response = await s3.send(new GetObjectCommand(bucketParams));
    const data = await streamToString(response.Body);
    writeFileSync(path.join(__dirname + "/uploads.jpg"), data);
    console.log("Success", data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

//get all file

exports.getFiles = async (req, res) => {
  const files = await prisma.file
    .findMany({
      where: {
        authorId: req.user.id,
      },
      include: {
        boite: true, // Return all fields
        tags: true,
      },
    })
    .then((files) => res.status(200).send(files))
    .catch((err) => res.status(400).send(err));
  //res.send(files);
};

//get file by id

exports.getFileById = async (req, res) => {
  let fid = req.params.id;
  const file = await prisma.file
    .findUnique({
      where: {
        id: parseInt(fid),
      },
      include: {
        boite: {
          select: {
            nbBoite: true,
            nbSalle: true,
          },
        },
        tags: true,
      },
    })
    .then((file) => res.status(200).send(file))
    .catch((err) => res.status(400).send(err));
  //res.send(file)
};

exports.viewing = async (req, res, next) => {
  let fid = req.params.id;
  const file = await prisma.file.findUnique({
    where: {
      id: parseInt(fid),
    },
  });

  return res.status(200).send(file.path);
};

//supprimer un fichier

exports.deleteFile = async (req, res) => {
  let ids = req.body;
  console.log(ids);
  await prisma.file
    .findMany({
      where: {
        id: { in: ids },
      },
    })
    .then((res) => {
      let files = res;

      for (const file of files) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (e) {
          console.log(e);
        }
      }
    });
  await prisma.file
    .deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    .then(() => {
      res.status(200).json({
        status: "success",
        data: {
          message: "Fichier supprimé.",
        },
        statusCode: res.statusCode,
      });
    });
};

//create tag
exports.createTag = async (req, res) => {
  //console.log(req.body.tag)
  let data = {
    tag_name: req.body.tag.tag_name,
    tag_desc: req.body.tag.tag_desc,
    color: req.body.tag.color,
  };
  const tag = await prisma.tag
    .create({ data: data })
    .then((tag) => {
      return res.status(200).send(tag);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};
exports.createTag_file = async (req, res) => {
  //console.log(req.body)
  await prisma.file
    .update({
      where: { id: parseInt(req.params.id) },
      data: {
        tags: {
          connect: {
            id: req.body.tagId,
          },
        },
      },
    })
    .then(() => {
      res.status(200).send("relation created");
    })
    .catch((err) => {
      res.status(400).send("Erreur !");
    });
};

//get tags
exports.getTags = async (req, res) => {
  const tags = await prisma.tag
    .findMany({
      include: { files: true },
    })
    .then((tags) => res.status(200).send(tags))
    .catch((err) => res.status(400).send(err));
  //res.send(tags);
};

//get tag by id

exports.getTagById = async (req, res) => {
  const tag = await prisma.tag
    .findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    })
    .then((tag) => res.status(200).send(tag))
    .catch((err) => res.status(400).send(err));
};

//remove tag from file
exports.removeTag = async (req, res) => {
  await prisma.file
    .update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        tags: {
          disconnect: { id: req.body.id },
        },
      },
    })
    .then(() => {
      /*prisma.tag.update({
            where: {
              id: req.body.id,
            },
            data: {
              files: {
                disconnect: {id:req.params.id},
              },
            },
            
          })*/
      res.status(201).send("tag retiré !");
    })
    .catch((err) => res.status(400).send(err));
};

//search fct

exports.searchFiles = async (req, res) => {
  const files = await prisma.file
    .findMany({
      where: {
        OR: [
          {
            content: {
              search: req.query.q, // get search term from the query string q
            },
          },
          {
            description: {
              search: req.query.q, // get search term from the query string q
            },
          },
          {
            observation: {
              search: req.query.q, // get search term from the query string q
            },
          },
          {
            title: {
              search: req.query.q, // get search term from the query string q
            },
          },
          {
            nArticle: {
              search: req.query.q, // get search term from the query string q
            },
          },
          /*{boite: {
        nbBoite:parseInt(req.query.q)}
      }*/
        ],
      },
      include: {
        boite: true, // Return all fields
        tags: true,
      },
    })
    .then((files) => res.status(200).send(files))
    .catch((err) => res.status(400).send(err));
  //res.json(files);
};

//send email
async function sendMail(authInfo, mailOptions) {
  console.log("email sending");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: authInfo.email,
        pass: authInfo.password,
      },
    });

    transporter.sendMail(mailOptions, function (error, iinfo) {
      if (error) {
        console.log(error);
        return resolve(false);
      } else {
        console.log("email sent");
        return resolve(true);
      }
    });
  });
}

exports.sendFile = async (req, res) => {
  //console.log(req.user)
  const authInfo = { email: "", password: "" };
  const user = await prisma.user
    .findUnique({
      where: {
        email: req.user.email,
      },
    })
    .then((user) => {
      authInfo = {
        email: req.user.email,
        password: user.password,
      };
    });

  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  var mailOptions = {
    from: authInfo.email,
    to: req.body.email,
    subject: "",
    html: req.body.note,
    attachments: [
      {
        filename: file.title,
        path: file.path,
      },
    ],
  };
  sendMail(authInfo, mailOptions)
    .then((res) => {
      res.status(200).send("fichier envoyé");
    })
    .catch((err) => res.status(400).send("erreur"));
};
