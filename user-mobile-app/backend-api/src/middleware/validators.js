// Request validation middleware
import { body, validationResult, query, param } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

export const validateRegister = [
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().isMobilePhone(),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

export const validateProduct = [
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt(),
  body('stock').isInt({ min: 0 }),
  handleValidationErrors,
];

export const validateOrder = [
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shipping_address').notEmpty(),
  body('payment_method').notEmpty(),
  handleValidationErrors,
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('per_page').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
];
