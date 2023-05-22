const express = require('express')
const router = express.Router()
const auth = require("../authorization.js");
const uploadImage = require('../middlewares/uploadImage')
const {createBordereau, getBordereaux,deleteBV,getBordereauxByOrg,searchBV, viewing}=require('../controllers/bversement')
const {createBoite, getBoites,deleteBoite,getBoitesByOrg,viewingBoite}=require('../controllers/boite')

router.post('/bordereau', auth, uploadImage, createBordereau);
router.get('/bordereaux', auth, getBordereaux);
router.get('/bordereauxByOrganisation', auth, getBordereauxByOrg);
router.delete('/bordereau/:id',auth, deleteBV)
router.get('/bv/search',auth,searchBV)
router.get("/bordereau/view/:id", viewing)

router.post('/boite', auth, uploadImage, createBoite);
router.get('/boites', auth,getBoites);
router.get('/boitesByOrganisation', auth,getBoitesByOrg);
router.delete('/boite/:id',auth,deleteBoite)
router.get("/boite/view/:id", viewingBoite)

module.exports = router;