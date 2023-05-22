const {PrismaClient} = require ("@prisma/client");
const prisma =new PrismaClient()

const path = require("path");
//schema validator
const {validateBv} = require('../utils/SchemaValidator')
const { tryCatch} =require('../utils/tryCatch') 

exports.createBordereau = tryCatch(async (req,res)=>{
    console.log(req.body);
    console.log(req.file);
    let user=req.user;
    if(user)
    {let data={
        nbv: parseInt(req.body.nbv),
        date_versement: new Date(req.body.date_versement),
        authorId:parseInt(user.id),
        direction: req.body.direction,
        sous_direction: req.body.sous_direction,
        service: req.body.service,
        intitule:req.body.intitule,
        dateExtreme:new Date(req.body.dateExtreme),
        nbr_articles:parseInt(req.body.nbr_articles),
        localisation:req.body.localisation,
        metrageLineaire:parseInt(req.body.metrageLineaire),
        etatPhysique:req.body.etatPhysique,
        nomRSVersante:req.body.nomRSVersante,
        nomRSvPreArchivage:req.body.nomRSvPreArchivage,
        organisationId:req.user.organisationId,
        imagePath: path.join(__dirname, "../uploads/images/" + req.file.filename) || undefined
    }
    const valid= validateBv(data);
    if(!valid){
        
        console.log(validateBv.errors)
        res.status(400).send(validateBv.errors)
        return false;
    }
    await prisma.bordereauVersement.create({
        data
    }).then(()=>{return res.status(201).json({
        status: "success",
        data: {
        message: "Bordereau crée."
        
        },
        statusCode: res.statusCode
        })}).catch(err=>res.status(400).send(err))}
        else{
            res.status(400).json({
                status: "error"})
        }
})


exports.getBordereaux = tryCatch(async (req,res)=>{
    const bordereaux=await prisma.bordereauVersement.findMany({
        where: {
            authorId: req.user.id,
          }
    }).then((bordereaux)=>res.status(200).send(bordereaux)).catch(err=>res.status(400).send(err))
    
})

exports.getBordereauxByOrg = tryCatch(async (req,res)=>{
    let user=req.user
    //console.log(user)
    const bordereaux=await prisma.bordereauVersement.findMany({
        where: {
            organisationId: user.organisationId,
          }
    }).then((bordereaux)=>res.status(200).send(bordereaux)).catch(err=>res.status(400).send(err))
    
})

exports.deleteBV = tryCatch(async (req,res)=>{
    let id=req.params.id;
    
    await prisma.bordereauVersement.delete({
        where: {
            id:  parseInt(id)
            
        }
    }).then(()=>{res.send('done !')}).catch(err=>res.status(400).send(err))
    
})

//search

exports.searchBV= tryCatch(async(req,res)=>{
    const bordereaux = await prisma.bordereauVersement.findMany({
        where: {
          OR:[
            {
                intitule: {
            search: req.query.q, // get search term from the query string q
          }},
          {direction: {
            search: req.query.q, // get search term from the query string q
          }},
          {sous_direction: {
            search: req.query.q, // get search term from the query string q
          }},
          {service: {
            search: req.query.q, // get search term from the query string q
          }},
          {localisation: {
            search: req.query.q, // get search term from the query string q
          }},
          {etatPhysique: {
            search: req.query.q, // get search term from the query string q
          }},
          {nomRSVersante: {
            search: req.query.q, // get search term from the query string q
          }},
          {nomRSvPreArchivage: {
            search: req.query.q, // get search term from the query string q
          }},
         /* {
            nbv:parseInt(req.query.q)
          },
          {
            nbr_articles:parseInt(req.query.q)
          }*/
          
    ],
      }}).then((bordereaux)=>res.status(200).send(bordereaux)).catch((err)=>res.status(400).send(err));
      
})

exports.viewing = tryCatch(async (req, res, next) => {
  let bid = req.params.id;
  const bv = await prisma.bordereauVersement.findUnique({
    where: {
      id: parseInt(bid),
    },
  });

  return res.download(bv.imagePath);
});