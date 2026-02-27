// Products controller with full implementation
import { ProductService } from '../services/productService.js';

let productService;
let db;

export const initProductController = (database) => {
  db = database;
  productService = new ProductService(database);
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, per_page = 20, search, category_id, vendor_id, sort_by } = req.query;
    
    const result = await productService.getProducts({
      page: parseInt(page),
      perPage: parseInt(per_page),
      search,
      categoryId: category_id ? parseInt(category_id) : undefined,
      vendorId: vendor_id ? parseInt(vendor_id) : undefined,
      sortBy: sort_by,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await productService.getProductById(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const userType = req.user.userType;
    const { name, description, price, category_id, categoryId, stock, sku, images } = req.body;
    
    let vendorId = null;
    
    if (userType === 'vendor') {
      // Vendors must have a vendor record
      const vendor = await db.Vendor.findOne({ where: { userId } });
      if (!vendor) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Vendor account not found. Please create a vendor account first.',
        });
      }
      vendorId = vendor.id;
    } else if (userType === 'admin') {
      // For admins, create or use a special admin vendor
      let adminVendor = await db.Vendor.findOne({ where: { userId } });
      if (!adminVendor) {
        adminVendor = await db.Vendor.create({
          userId,
          businessName: 'Admin Store',
          email: userEmail,
          address: 'Admin Store Address',
          status: 'approved',
        });
      }
      vendorId = adminVendor.id;
    } else {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only vendors and admins can create products',
      });
    }
    
    const result = await productService.createProduct(vendorId, {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(category_id || categoryId),
      stock: parseInt(stock),
      sku: sku || undefined,
      images: images || [],
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userType = req.user.userType;
    const updateData = req.body;
    
    // Get the vendor ID based on user type
    let vendorId = null;
    if (userType === 'admin') {
      // For admins, get their auto-created vendor (same logic as createProduct)
      let adminVendor = await db.Vendor.findOne({ where: { userId } });
      if (!adminVendor) {
        // If vendor doesn't exist, create it
        adminVendor = await db.Vendor.create({
          userId,
          businessName: 'Admin Store',
          email: req.user.email,
          address: 'Admin Store Address',
          status: 'approved',
        });
      }
      vendorId = adminVendor.id;
    } else if (userType === 'vendor') {
      // Vendors use their vendorId (which equals userId in vendor context)
      vendorId = userId;
    } else {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only vendors and admins can update products',
      });
    }
    
    const result = await productService.updateProduct(
      parseInt(id),
      vendorId,
      updateData,
      userType
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userType = req.user.userType;
    
    // Get the vendor ID based on user type
    let vendorId = null;
    if (userType === 'admin') {
      // For admins, get their auto-created vendor (same logic as createProduct)
      let adminVendor = await db.Vendor.findOne({ where: { userId } });
      if (!adminVendor) {
        // If vendor doesn't exist, create it
        adminVendor = await db.Vendor.create({
          userId,
          businessName: 'Admin Store',
          email: req.user.email,
          address: 'Admin Store Address',
          status: 'approved',
        });
      }
      vendorId = adminVendor.id;
    } else if (userType === 'vendor') {
      // Vendors use their vendorId (which equals userId in vendor context)
      vendorId = userId;
    } else {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only vendors and admins can delete products',
      });
    }
    
    const result = await productService.deleteProduct(
      parseInt(id),
      vendorId,
      userType
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const product = await productService.getProductById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    const similarProducts = await productService.getSimilarProducts(
      parseInt(id),
      product.categoryId,
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: similarProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getVendorProducts = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { page = 1, per_page = 20 } = req.query;
    
    const result = await productService.getProductsByVendor(
      vendorId,
      parseInt(page),
      parseInt(per_page)
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
