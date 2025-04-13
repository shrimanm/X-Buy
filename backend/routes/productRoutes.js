import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';
import upload from '../config/multer.js';

// Public routes
router.get('/top', getTopProducts); // Move this BEFORE /:id route
router.get('/', getProducts);

// Protected routes
router.post('/', protect, admin, upload.single('image'), createProduct);

// Routes with ID parameter
router.post('/:id/reviews', protect, checkObjectId, createProductReview);
router.get('/:id', checkObjectId, getProductById);

router
  .route('/:id')
  .put(protect, admin, checkObjectId, upload.single('image'), updateProduct)
  .delete(protect, admin, checkObjectId, deleteProduct);

export default router;
