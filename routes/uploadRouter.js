const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imagesDir);
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  }
});

function imageFileFilter(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('You can upload only image files!'), false);
  }

  return cb(null, true);
}

const upload = multer({ storage, fileFilter: imageFileFilter });
const uploadRouter = express.Router();

uploadRouter.route('/')
  .get((req, res) => {
    res.status(403).send('GET operation not supported on /imageUpload');
  })
  .post(upload.single('imageFile'), (req, res) => {
    res.status(200).json(req.file);
  })
  .put((req, res) => {
    res.status(403).send('PUT operation not supported on /imageUpload');
  })
  .delete((req, res) => {
    res.status(403).send('DELETE operation not supported on /imageUpload');
  });

uploadRouter.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error.message) {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

module.exports = uploadRouter;
