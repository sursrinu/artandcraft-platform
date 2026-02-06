// Upload controller for handling file uploads
import path from 'path';
import fs from 'fs';

let db;

export const initUploadController = (database) => {
  db = database;
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ProductImage = db.ProductImage;
    const savedImages = [];

    for (const file of req.files) {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${productId}_${timestamp}_${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      // Save to database
      const imageUrl = `/uploads/products/${filename}`;
      const productImage = await ProductImage.create({
        productId: parseInt(productId),
        imageUrl: imageUrl,
        altText: file.originalname,
      });

      savedImages.push({
        id: productImage.id,
        imageUrl: productImage.imageUrl,
        altText: productImage.altText,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: savedImages,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    const ProductImage = db.ProductImage;
    const image = await ProductImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Delete file from filesystem
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const filename = image.imageUrl.split('/').pop();
    const filepath = path.join(uploadsDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await image.destroy();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
