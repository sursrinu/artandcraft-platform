// Vendor Controller
import { VendorService } from '../services/vendorService.js';

let vendorService;

export const initVendorController = (db) => {
  vendorService = new VendorService(db);
};

export const registerVendor = async (req, res, next) => {
  try {
    const { businessName, email, password, phone, address, taxId } = req.body;
    
    const result = await vendorService.registerVendor({
      businessName,
      email,
      password,
      phone,
      address,
      taxId,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Vendor registration submitted',
    });
  } catch (error) {
    next(error);
  }
};

export const getVendors = async (req, res, next) => {
  try {
    const { page = 1, per_page = 20, status } = req.query;
    
    const result = await vendorService.getVendors({
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

export const getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.getVendorById(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const updateData = req.body;
    
    const result = await vendorService.updateVendor(vendorId, updateData);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Vendor updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const approveVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await vendorService.approveVendor(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Vendor approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await vendorService.rejectVendor(parseInt(id), reason);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const suspendVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await vendorService.suspendVendor(parseInt(id), reason);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorStats = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    
    const stats = await vendorService.getVendorStats(vendorId);
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommissionRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    
    const result = await vendorService.updateCommissionRate(parseInt(id), commissionRate);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Commission rate updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
