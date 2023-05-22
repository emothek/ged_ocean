const {PrismaClient} = require ("@prisma/client");
const prisma =new PrismaClient()

const path = require("path");

//schema validator
const {validateBoite} = require('../utils/SchemaValidator')
const { tryCatch} =require('../utils/tryCatch') 

exports.createBoite = tryCatch(async (req,res)=>{
    console.log(req.body);
    let user=req.user;
    if(user)
    {let data={
        
        nbSalle:parseInt(req.body.nbSalle),
        nbRayonnage:parseInt(req.body.nbRayonnage),
        nbEtage:parseInt(req.body.nbEtage),
        nbBoite:parseInt(req.body.nbBoite),
        bordereauVId:parseInt(req.body.bordereauVId),
        authorId:user.id,
        imagePath: path.join(__dirname, "../uploads/images/" + req.file.filename) || undefined
        
    }
    const valid= validateBoite(data);
    if(!valid){
        
        console.log(validateBoite.errors)
        res.status(400).send(validateBoite.errors)
        return false;
    }
    await prisma.boite.create({
        data
    }).then(()=>{return res.status(201).json({
        status: "success",
        data: {
        message: "Boite créee."
        
        },
        statusCode: res.statusCode
        })}).catch((err)=>{res.status(400).send(err)})}
        else{
            res.status(400).json({
                status: "error"})
        }

})


exports.getBoites = tryCatch(async (req,res)=>{
    const boites=await prisma.boite.findMany({
        where:{
            authorId:req.user.id
        },
        include:{
            bordereauVersement:true
        }
    }).then((boites)=>res.status(200).send(boites)).catch((err)=>res.status(400).send(err))
})

exports.getBoitesByOrg =tryCatch(async (req,res)=>{
    let org=req.user.organisationId
    const boites=await prisma.boite.findMany({
        where:{
            author:{organisationId:org}
        }
    }).then((boites)=>res.status(200).send(boites)).catch((err)=>res.status(400).send(err));
})

exports.deleteBoite = tryCatch(async (req,res)=>{
    let id=req.params.id;
    
    await prisma.boite.delete({
        where: {
            id:  parseInt(id)
            
        }
    }).then(()=>{res.status(200).send('done !')}).catch((err)=>res.status(400).send(err));
})

exports.viewingBoite = tryCatch(async (req, res, next) => {
    let bid = req.params.id;
    const b = await prisma.boite.findUnique({
      where: {
        id: parseInt(bid),
      },
    });
  
    return res.download(b.imagePath);
  });