// Order Controller
import { OrderService } from '../services/orderService.js';

let orderService;

export const initOrderController = (db) => {
  orderService = new OrderService(db);
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { items, shippingAddress, paymentMethod } = req.body;
    
    const result = await orderService.createOrder(userId, {
      items,
      shippingAddress,
      paymentMethod,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, per_page = 20, status } = req.query;
    
    const result = await orderService.getOrders(userId, {
      page: parseInt(page),
      perPage: parseInt(per_page),
      status,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const order = await orderService.getOrderById(parseInt(id), userId);
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Admin can see any order without user restriction
    const order = await orderService.getOrderByIdAdmin(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.userId;
    const { status } = req.body;
    
    const result = await orderService.updateOrderStatus(parseInt(id), vendorId, status);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await orderService.updateOrderStatusAdmin(parseInt(id), status);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await orderService.cancelOrder(parseInt(id), userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { page = 1, per_page = 20, status } = req.query;
    
    const result = await orderService.getVendorOrders(vendorId, {
      page: parseInt(page),
      perPage: parseInt(per_page),
      status,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, per_page = 20, status } = req.query;
    
    const result = await orderService.getAllOrders({
      page: parseInt(page),
      perPage: parseInt(per_page),
      status,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};