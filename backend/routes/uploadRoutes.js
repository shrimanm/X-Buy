// routes/upload.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

router.get('/signature', protect, admin, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create the signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: 'products',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    // Send back all required data
    res.json({
      timestamp,
      signature,
      cloudname: process.env.CLOUDINARY_CLOUD_NAME,
      apikey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate upload signature',
      error: error.message 
    });
  }
});

export default router;








// import path from 'path';
// import express from 'express';
// import multer from 'multer';

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename(req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
//     );
//   },
// });

// function fileFilter(req, file, cb) {
//   const filetypes = /jpe?g|png|webp/;
//   const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = mimetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(new Error('Images only!'), false);
//   }
// }

// const upload = multer({ storage, fileFilter });
// const uploadSingleImage = upload.single('image');

// router.post('/', (req, res) => {
//   uploadSingleImage(req, res, function (err) {
//     if (err) {
//       return res.status(400).send({ message: err.message });
//     }

//     res.status(200).send({
//       message: 'Image uploaded successfully',
//       image: `/${req.file.path}`,
//     });
//   });
// });

// export default router;
