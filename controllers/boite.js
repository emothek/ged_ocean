const {PrismaClient} = require ("@prisma/client");
const prisma =new PrismaClient()
//schema validator
const {validateBoite} = require('../utils/ShemaValidator')

exports.createBoite = async (req,res)=>{
    console.log(req.body);
    let user=req.user;
    if(user)
    {let data={
        
        nbSalle:parseInt(req.body.nbSalle),
        nbRayonnage:parseInt(req.body.nbRayonnage),
        nbEtage:parseInt(req.body.nbEtage),
        nbBoite:parseInt(req.body.nbBoite),
        bordereauVId:parseInt(req.body.bordereauVId),
        authorId:user.id
        
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

}


exports.getBoites =async (req,res)=>{
    const boites=await prisma.boite.findMany({
        where:{
            authorId:req.user.id
        },
        include:{
            bordereauVersement:true
        }
    }).then((boites)=>res.status(200).send(boites)).catch((err)=>res.status(400).send(err))
}
exports.getBoitesByOrg =async (req,res)=>{
    let org=req.user.organisationId
    const boites=await prisma.boite.findMany({
        where:{
            author:{organisationId:org}
        }
    }).then((boites)=>res.status(200).send(boites)).catch((err)=>res.status(400).send(err));
}

exports.deleteBoite =async (req,res)=>{
    let id=req.params.id;
    
    await prisma.boite.delete({
        where: {
            id:  parseInt(id)
            
        }
    }).then(()=>{res.status(200).send('done !')}).catch((err)=>res.status(400).send(err));
}