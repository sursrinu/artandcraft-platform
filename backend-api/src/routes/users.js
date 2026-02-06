// Users routes
import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Address routes (must come before /:id routes) - Protected
router.get('/addresses', authenticate, userController.getAddresses);
router.post('/addresses', authenticate, userController.addAddress);
router.put('/addresses/:addressId', authenticate, userController.updateAddress);
router.delete('/addresses/:addressId', authenticate, userController.deleteAddress);

// Payment method routes - Protected
router.get('/payment-methods', authenticate, userController.getPaymentMethods);
router.post('/payment-methods', authenticate, userController.addPaymentMethod);
router.put('/payment-methods/:methodId', authenticate, userController.updatePaymentMethod);
router.delete('/payment-methods/:methodId', authenticate, userController.deletePaymentMethod);

// Get all users
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

export default router;
