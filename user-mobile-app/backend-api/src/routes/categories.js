// Categories routes
import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Get all categories
router.get('/', categoryController.getCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;
