const express = require('express')
const router = express.Router()
const auth = require("../authorization.js");

const {createBordereau, getBordereaux,deleteBV,getBordereauxByOrg,searchBV}=require('../controllers/bversement')
const {createBoite, getBoites,deleteBoite,getBoitesByOrg}=require('../controllers/boite')

router.post('/bordereau', auth, createBordereau);
router.get('/bordereaux', auth, getBordereaux);
router.get('/bordereauxByOrganisation', auth, getBordereauxByOrg);
router.delete('/bordereau/:id',auth, deleteBV)
router.get('/bv/search',auth,searchBV)
router.post('/boite', auth,createBoite);
router.get('/boites', auth,getBoites);
router.get('/boitesByOrganisation', auth,getBoitesByOrg);
router.delete('/boite/:id',auth,deleteBoite)

module.exports = router;