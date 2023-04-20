const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const auth = require("../authorization.js");

const { uploadFile, 
        getFileById, 
        getFiles,
        viewing, 
        deleteFile,
        searchFiles,
        createTag,    
        createTag_file,
        getTags,
        sendFile,
        removeTag,
        getTagById}= require('../controllers/file')

router.post('/upload', upload, auth, uploadFile);
router.get('/files',auth, getFiles);
router.get('/file/:id',auth,getFileById)
router.get("/file/view/:id",auth, viewing)
router.delete("/file/",auth, deleteFile)
router.get("/search",auth,searchFiles)
router.post("/tag",auth, createTag)
router.post("/addtag/:id",auth,createTag_file);
router.get("/tags", auth, getTags)
router.post("/tag/remove/:id",auth, removeTag)
router.get("/tag/:id",auth,getTagById)
router.post("/send/file/:id",auth,sendFile)

module.exports = router