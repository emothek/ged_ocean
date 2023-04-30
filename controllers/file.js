const { PrismaClient } = require("@prisma/client");
const tesseract = require("node-tesseract-ocr");
const path = require("path");
const exec = require("child_process").exec;
const { readdir } = require("fs").promises;
const fs = require("fs");
const nodemailer = require("nodemailer");
//schema validator
const { validateFile } = require("../utils/SchemaValidator");
const { tryCatch} =require('../utils/tryCatch') 
//const pdfjsLib = require('pdfjs-dist');

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

exports.createFile = async (data,tagId) => {
  const file= await prisma.file.create({
    data: data,
  }).then(async (file) =>{
    if(tagId !== null) await prisma.file
    .update({
      where: { id: file.id },
      data: {
        tags: {
          connect: {
            id: tagId,
          },
        },
      },
    })
    .then((res) => {
      console.log("relation created");
    })
    .catch((err) => {
      console.log(err);
    });
  });
};

//extract text from uploaded file and save it to db

exports.uploadFile = tryCatch(async (req, res) => {
  console.log(req.file);
  let title = "";
  if (req.body.title) title = req.body.title +  "." + req.file.originalname.split(".").pop();
  else title = req.file.originalname;
  let user = req.user;
  if (user) {
    data = {
      title: title,
      content: "",
      nArticle: req.body.nArticle,
      path: path.join(__dirname, "../uploads/" + req.file.filename),
      description: req.body.description ,
      dateExtreme: req.body.dateExtreme !== 'null' ? new Date(req.body.dateExtreme): null,
      dateElimination: req.body.dateElimination !== 'null' ? new Date(req.body.dateElimination) : null,
      observation: req.body.observation ,
      boiteId: parseInt(req.body.boiteId)|| null,
      authorId: user.id,
      type:req.body.type_doc ,
      categoryId:parseInt(req.body.category) ||null,
      
    };
    const tagId= parseInt(req.body.tagId) || null
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
    mt = req.file.mimetype.split("/")[0];

    type = req.file.originalname.split(".").pop();
    //let numPages;
    let possible=false;
    if(data.boiteId > 0)
    {
      const boite = await prisma.boite.findUnique({
      where: {
        id: data.boiteId,
      },
      include: {
        bordereauVersement: true,
        files: true,
      },
    });
    if (boite.files.length < boite.bordereauVersement.nbr_articles) possible=true;
    else possible=false;
  }
  else possible=true;

    if(possible)
    {
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
                      this.createFile(data,tagId)
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
            .recognize(req.file.path, config)
            .then((text) => {
              data.content = text;
              this.createFile(data,tagId)
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
          this.createFile(data,tagId)
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
});

//get all files

exports.getFiles = tryCatch(async (req, res) => {
  const files = await prisma.file
    .findMany({
      where: {
        authorId: req.user.id,
      },
      include: {
        boite: true, // Return all fields
        tags: true,
        category:true
      },
    })
    .then((files) => res.status(200).send(files))
    .catch((err) => res.status(400).send(err));
  //res.send(files);
});

//get file by id

exports.getFileById = tryCatch(async (req, res) => {
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
        category:true
      },
    })
    .then((file) => res.status(200).send(file))
    .catch((err) => res.status(400).send(err));
  //res.send(file)
});

exports.viewing = tryCatch(async (req, res, next) => {
  let fid = req.params.id;
  const file = await prisma.file.findUnique({
    where: {
      id: parseInt(fid),
    },
  });

  return res.download(file.path);
});

//supprimer un fichier

exports.deleteFile = tryCatch(async (req, res) => {
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
        fs.unlinkSync(file.path);
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
});

//create tag
exports.createTag = tryCatch(async (req, res) => {
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
});
exports.createTag_file = tryCatch(async (req, res) => {
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
});

//get tags
exports.getTags = tryCatch(async (req, res) => {
  const tags = await prisma.tag
    .findMany({
      include: { files: true },
    })
    .then((tags) => res.status(200).send(tags))
    .catch((err) => res.status(400).send(err));
  //res.send(tags);
});

//get tag by id

exports.getTagById = tryCatch(async (req, res) => {
  const tag = await prisma.tag
    .findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    })
    .then((tag) => res.status(200).send(tag))
    .catch((err) => res.status(400).send(err));
});

//remove tag from file
exports.removeTag = tryCatch(async (req, res) => {
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
});

//search fct

//get lines containing searched word
exports.getSearchLine = tryCatch(async (files,keyword)=>{

  let result=[];
  let r;
  for (const file of files) {
  let arr = file.content.split(/\r?\n/);
  arr.forEach((line, idx)=> {
      
      if(line.includes(keyword)){
        console.log(file.title , '...' + (idx+1) +':'+ line + '...')
        r={
          titre:file.title,
          line: '.....' + (idx+1) +':'+ line + '......'
        }
        
        result.push(r)
      }
      
      
      
  }); 
  }
  return result
  
})


//search
exports.searchFiles = tryCatch(async (req, res) => {
  const keyword=req.query.q;
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
    .then((files) => {
      this.getSearchLine(files,keyword).then(result=>{
        res.status(200).send({files,result})
      })
      
      
    })
    .catch((err) => res.status(400).send(err));
  //res.json(files);
});

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

exports.sendFile = tryCatch(async (req, res) => {
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
});


//create category
exports.createCategory = tryCatch(async (req, res) => {
  
  let name=req.body.categorie
  let data={
    name:name
  }
  const category = await prisma.category
    .create({ data: data })
    .then((category) => {
      return res.status(200).send(category);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

//get categories
exports.getCategories = tryCatch(async (req, res) => {
  const categorieList = await prisma.category
    .findMany()
    .then((categorieList) => {
      let categories=[];
      categorieList.map((c)=> categories.push({id:c.id, title:c.name}))
      return res.status(200).send(categories);
    })
    .catch((err) => res.status(400).send(err));
  //res.send(tags);
});

//update file

exports.updateFile = tryCatch(async(req,res)=>{
  console.log(req.body)
  let possible=false;
    if(req.body.boiteId > 0)
    {
      const boite = await prisma.boite.findUnique({
      where: {
        id: req.body.boiteId,
      },
      include: {
        bordereauVersement: true,
        files: true,
      },
    });
    if (boite.files.length < boite.bordereauVersement.nbr_articles) possible=true;
    else possible=false;
  }
  else possible=true;
  if(possible)
  {const file=await prisma.file
    .update({
      where: { id: parseInt(req.params.id) },
      data: {
        
        nArticle:req.body.nArticle,
        observation:req.body.observation,
        description:req.body.description,
        dateExtreme: req.body.dateExtreme,
        dateElimination: req.body.dateElimination ,
        boiteId: parseInt(req.body.boiteId) || null,
        type:req.body.type_doc ,
        categoryId:parseInt(req.body.categoryId?.id) || null,
        
      },
    })
    .then((file) => {
      res.status(200).send({message:"file updated",file});
    })
    .catch((err) => {
      res.status(400).send("Erreur !");
    });}
    else {
      return res.status(401).send("Vous ne pouvez plus ajouter d'articles dans ce bordereau")
    }
})