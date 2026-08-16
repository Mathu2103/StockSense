import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';

const router = Router();

// Multer memory storage configuration (in-memory buffer passed to Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF, SVG) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size
  fileFilter,
});

// POST /api/upload/image
router.post('/image', upload.single('image'), uploadImage);

export default router;
