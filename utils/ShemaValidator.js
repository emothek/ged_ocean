const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true }) 

const dateTimeRegex = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$');
ajv.addFormat ('date-time', {validate: (dateTimeString) => dateTimeRegex.test(dateTimeString)});
    

//organisationschema validation
const organisationSchema = {
    type: "object",
    properties: {
        name  : {type: "string", minLength:2},
        logo  : {type: "string"},
        description  : {type: "string", minLength:2},
        parent   :  {type: "integer"},
      
    },
    required: ["name","description"],
    //additionalProperties: false,
  }
  
  const validateOrganisation = ajv.compile(organisationSchema)

//user schema validation
const userSchema = {
    type: "object",
    properties: {
        name   : {type: "string",minLength:2},
        email : {type: "string",minLength:2},
        password    : {type: "string", minLength:8},
        role  : {"enum": ["USER",
                        "ADMIN",
                        "SUPERADMIN"]},
        
      
    },
    required: ["name","email","password","role"],
    //additionalProperties: false,
  }
  
  const validateUser = ajv.compile(userSchema)

  //boite schema validation
const boiteSchema = {
    type: "object",
    properties: {
        nbBoite :{type: "integer", minimum:1},
        nbSalle  :{type: "integer", minimum:1},
        nbRayonnage :{type: "integer", minimum:1},
        nbEtage :{type: "integer", minimum:1},
        
    },
    required: ["nbBoite","nbSalle","nbRayonnage","nbEtage"],
    //additionalProperties: false,
  }
  
  const validateBoite = ajv.compile(boiteSchema)

  //bv schema validation
  const bvSchema = {
    type: "object",
    properties: {
        nbv    :{type: "integer", minimum:1},
        //date_versement  : {type: "string", format:"date-time"},
        direction    : {type: "string", minLength:2},
        sous_direction   : {type: "string", minLength:2},
        service    : {type: "string", minLength:2},
        intitule      : {type: "string", minLength:2},
        //dateExtreme    : {type: "string", format:"date-time"},
        nbr_articles    :{type: "integer", minimum:1},
        localisation     : {type: "string", minLength:2},
        metrageLineaire  :{type: "integer", minimum:1},
        etatPhysique      : {type: "string", minLength:2},
        nomRSVersante      : {type: "string", minLength:2},
        nomRSvPreArchivage  : {type: "string", minLength:2}
        
        
    },
    required: ["nbv",
    //"date_versement",
    "direction","sous_direction",
                "service","intitule",
                //"dateExtreme",
                "nbr_articles",
                "localisation","metrageLineaire","etatPhysique","nomRSVersante","nomRSvPreArchivage"
            ],
    //additionalProperties: false,
  }
  
  const validateBv = ajv.compile(bvSchema)

  //file schema validation
  const fileSchema = {
    type: "object",
    properties: {
        title  : {type: "string", minLength:2},
        content   : {type: "string"},
        //path      : {type: "string", minLength:2},
        nArticle    : {type: "string", minLength:1},
        description  : {type: "string", minLength:2},
        observation   : {type: "string", minLength:2},
        //dateExtreme   : {type: "string", format:"date-time"},
        //dateElimination : {type: "string", format:"date-time"},
       
        
    },
    required: ["title","nArticle","description",
                "observation",
                //"dateExtreme","dateElimination"
            ],
    //additionalProperties: false,
  }
  
  const validateFile = ajv.compile(fileSchema)

  module.exports = {
    validateOrganisation,
    validateUser,
    validateBoite,
    validateBv,
    validateFile
};
