// Product routes
import express from 'express';
import * as productController from '../controllers/productController.js';
import * as uploadController from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateProduct, validatePagination } from '../middleware/validators.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Public routes
router.get('/', validatePagination, productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/similar', productController.getSimilarProducts);

// Protected routes (vendors and admins only)
router.post('/', authenticate, authorize('vendor', 'admin'), validateProduct, productController.createProduct);
router.put('/:id', authenticate, authorize('vendor', 'admin'), validateProduct, productController.updateProduct);
router.delete('/:id', authenticate, authorize('vendor', 'admin'), productController.deleteProduct);

// Image upload routes
router.post('/:productId/images', authenticate, authorize('vendor', 'admin'), upload.array('images', 5), uploadController.uploadProductImages);
router.delete('/images/:imageId', authenticate, authorize('vendor', 'admin'), uploadController.deleteProductImage);

export default router;
