const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const cookies = require("cookie-parser");
const session = require("express-session");
const app = express();
const { PrismaClient } = require("@prisma/client");
const auth = require("./authorization.js");
const uploadLogo = require("./middlewares/uploadLogo");
const { tryCatch} =require('./utils/tryCatch') 
//schema validator
const { validateOrganisation } = require("./utils/SchemaValidator");

const port = 3001;
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://2fdc-197-203-26-10.ngrok-free.app",
      "https://2fdc-197-203-26-10.ngrok-free.app",
      "http://2fdc-197-203-26-10.ngrok-free.app/",
      "https://2fdc-197-203-26-10.ngrok-free.app/",
      "*",
      "https://438f-197-203-26-10.ngrok-free.app/",
      "http://438f-197-203-26-10.ngrok-free.app/",
      "https://438f-197-203-26-10.ngrok-free.app",
      "http://438f-197-203-26-10.ngrok-free.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/*app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
  })*/
// initialize session
app.use(
  session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: process.env.COOKIE_EXPIRE * 24 * 24 * 60 * 1000 },
  })
);

// Initialize passport
require("./passport/local");
require("./passport/jwt");

app.use(cookies(process.env.COOKIE_SECRET));
require("./authenticate");
app.use(passport.initialize());
app.use(passport.session());

const fileRoutes = require("./routes/file");
const BvRoutes = require("./routes/bv");
const AuthRoute = require("./routes/auth");
const prisma = new PrismaClient();
//create org
function createOrg(organisations, parent = null) {
  const organisationList = [];
  let organisation;
  if (parent == null) {
    organisation = organisations.filter((org) => org.parent == null);
  } else {
    organisation = organisations.filter((org) => org.parent == parent);
  }
  for (let o of organisation) {
    organisationList.push({
      _id: o.id,
      name: o.name,
      logo: o.logo,
      description: o.description,
      parent: o.parent,
      users: o.users,
      suborganisations: createOrg(organisations, o.id),
    });
  }
  return organisationList;
}
app.post("/organisation", uploadLogo, tryCatch(async (req, res) => {
  console.log(req.body);

  let data = {
    name: req.body.name,
    logo: req.file ? req.file.originalname : "",
    description: req.body.description,
  };
  if (req.body.parent) {
    data.parent = parseInt(req.body.parent);
  }
  const valid = validateOrganisation(data);
  if (!valid) {
    console.log(validateOrganisation.errors);
    res.status(400).send(validateOrganisation.errors);
    return false;
  }
  await prisma.organisation
    .create({ data: data })
    .then((organisation) => {
      res.status(200).send(organisation);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}));
//get all organizations

app.get("/organisations", tryCatch(async (req, res) => {
  const organisations = await prisma.organisation.findMany({
    include: { users: { include: { files: true } } },
  });
  if (organisations) {
    const organisationList = createOrg(organisations);
    return res.status(200).send(organisationList);
  } else {
    return res.status(400).json({ error });
  }
}));
//get org of sa
app.get("/organisation/:id", tryCatch(async (req, res) => {
  const organisation = await prisma.organisation.findMany();
  if (organisation) {
    const organisationList = createOrg(organisation);
    //console.log(organisationList)
    return res.status(200).send(organisationList);
  } else {
    return res.status(400).json({ error });
  }
}));
app.get("/organisation/logo/:fieldname", tryCatch(async (req, res) => {
  var logo = path.join(__dirname, "/logo") + "/" + req.params.fieldname;

  return res.download(logo);
}));

app.get("/", tryCatch((req, res) => {
  res.status(200).json({ msg: "DZ-Archive server" });
}));

app.use(fileRoutes);
app.use(BvRoutes);
app.use(AuthRoute);

app.listen(port, () =>
  console.log(`DZ-Archive server listening on port ${port}!`)
);
