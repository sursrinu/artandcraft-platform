// Cart Controller
import { CartService } from '../services/cartService.js';

let cartService;

export const initCartController = (db) => {
  cartService = new CartService(db);
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const cart = await cartService.getCart(userId);
    
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const getCartSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const summary = await cartService.getCartSummary(userId);
    
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    
    const cart = await cartService.addToCart(userId, parseInt(productId), parseInt(quantity));
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Product added to cart',
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cartItemId } = req.params;
    
    const cart = await cartService.removeFromCart(userId, parseInt(cartItemId));
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Product removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    const cart = await cartService.updateCartItemQuantity(userId, parseInt(cartItemId), parseInt(quantity));
    
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Quantity updated',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const result = await cartService.clearCart(userId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
