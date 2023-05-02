const express = require("express");
const router = express.Router();
const { upload, uploadCloud } = require("../middlewares/upload");
const auth = require("../authorization.js");

const {
  uploadFile,
  // downloadFile,
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
  getTagById,
  createCategory,
  getCategories,
  updateFile,
} = require("../controllers/file");

router.post(
  "/upload",
  auth,
  (req, res, next) => {
    uploadCloud(req, res, next);
  },
  uploadFile
);
router.get("/files", auth, getFiles);
router.get("/file/:id", auth, getFileById);
router.get("/file/view/:id", auth, viewing);
router.delete("/file/", auth, deleteFile);
router.get("/search", auth, searchFiles);
router.post("/tag", auth, createTag);
router.post("/addtag/:id", auth, createTag_file);
router.get("/tags", auth, getTags);
router.post("/tag/remove/:id", auth, removeTag);
router.get("/tag/:id", auth, getTagById);
router.post("/send/file/:id", auth, sendFile);
router.put("/file/:id", auth, updateFile);
router.post("/category", auth, createCategory);
router.get("/categories", auth, getCategories);

module.exports = router;
