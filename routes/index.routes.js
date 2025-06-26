const express = require("express");
const fs = require("fs");
const upload = require("../config/multer.config");
const cloudinary = require("../config/cloudinary.config");
const fileModel = require("../models/files.models");
const authMiddleware= require('../middlewares/auth')

const axios = require("axios");


const router = express.Router();

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const files = await fileModel.find({ user: req.user.userId });

    res.render('home',{files})
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/upload-file", authMiddleware,upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Save file metadata to MongoDB
    const fileDoc = await fileModel.create({
      path: result.secure_url,
      public_id: result.public_id,
      originalname: req.file.originalname,
      resource_type: result.resource_type,
      user: req.user.userId,
    });

    res.status(200).json({
      message: "File uploaded & saved to DB!",
      cloudinary_url: result.secure_url,
      file: fileDoc,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload or DB save failed" });
  }
});

router.get('/download/:id',authMiddleware,async(req,res)=>{

  try{
  const loggedInUserId= req.user.userId;
  const fileId= req.params.id

  const file= await fileModel.findOne({
    _id:fileId,
    user:loggedInUserId,
    
  })
  if(!file){
    return res.status(401).json({
      message:"unauthorized"
    })
  }

  const fileUrl = `${file.path}?fl_attachment=${file.originalname}`;

  // Fetch the file as a stream from Cloudinary
  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream'
  });

  // Set headers to force download
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
  res.setHeader('Content-Type', response.headers['content-type']);

  // Pipe the file stream to the client
  response.data.pipe(res);

} catch (error) {
  console.error("Download error:", error);
  res.status(500).json({ message: "Server Error" });
}
})

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const file = await fileModel.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Log for debugging
    console.log("Deleting file:", file);

    // 🔥 Delete from Cloudinary
    await cloudinary.uploader.destroy(file.public_id, {
      resource_type: file.resource_type,
    });

    // Delete from MongoDB
    await fileModel.deleteOne({ _id: req.params.id });

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = router;
