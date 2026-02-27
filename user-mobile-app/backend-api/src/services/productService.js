// Product Service
export class ProductService {
  constructor(db) {
    this.Product = db.Product;
    this.ProductImage = db.ProductImage;
    this.Category = db.Category;
    this.Vendor = db.Vendor;
    this.Review = db.Review;
  }

  async getProducts(filters) {
    const { page = 1, perPage = 20, search, categoryId, vendorId, sortBy } = filters;
    const offset = (page - 1) * perPage;

    // Build where clause
    const where = { isActive: true };
    if (search) {
      const Op = this.Product.sequelize.Sequelize.Op;
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (vendorId) where.vendorId = vendorId;

    // Build order clause
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'price_asc') order = [['price', 'ASC']];
    if (sortBy === 'price_desc') order = [['price', 'DESC']];
    if (sortBy === 'rating') order = [['rating', 'DESC']];
    if (sortBy === 'newest') order = [['createdAt', 'DESC']];

    const { count, rows } = await this.Product.findAndCountAll({
      where,
      include: [
        { model: this.ProductImage, as: 'ProductImages' },
        { model: this.Vendor, attributes: ['id', 'businessName'] },
        { model: this.Category, attributes: ['id', 'name'] },
      ],
      offset,
      limit: perPage,
      order,
    });

    return {
      products: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }

  async getProductById(productId) {
    const product = await this.Product.findByPk(productId, {
      include: [
        { model: this.ProductImage },
        { model: this.Vendor, attributes: ['id', 'businessName', 'rating', 'email'] },
        { model: this.Category },
        {
          model: this.Review,
          include: [{ model: this.Product.sequelize.models.User, attributes: ['id', 'name', 'profileImage'] }],
        },
      ],
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }

    return product;
  }

  async createProduct(vendorId, productData) {
    const { name, description, price, categoryId, stock, sku, images = [] } = productData;

    // Verify vendor exists
    const vendor = await this.Vendor.findByPk(vendorId);
    if (!vendor) {
      throw { statusCode: 404, message: 'Vendor not found', code: 'NOT_FOUND' };
    }

    // Create product
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const product = await this.Product.create({
      vendorId,
      categoryId,
      name,
      slug,
      description,
      price,
      stock,
      sku: sku || undefined,
    });

    // Add images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await this.ProductImage.create({
          productId: product.id,
          imageUrl: images[i],
          isPrimary: i === 0,
          displayOrder: i,
        });
      }
    }

    return this.getProductById(product.id);
  }

  async updateProduct(productId, vendorId, updateData, userType = 'vendor') {
    const product = await this.Product.findByPk(productId);

    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }

    // Admins can update any product, vendors can only update their own
    if (userType !== 'admin' && product.vendorId !== vendorId) {
      throw { statusCode: 403, message: 'Unauthorized to update this product', code: 'FORBIDDEN' };
    }

    const allowedFields = ['name', 'description', 'price', 'stock', 'categoryId', 'discountPercentage'];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    await product.update(dataToUpdate);
    return this.getProductById(product.id);
  }

  async deleteProduct(productId, vendorId, userType = 'vendor') {
    const product = await this.Product.findByPk(productId);

    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }

    // Admins can delete any product, vendors can only delete their own
    if (userType !== 'admin' && product.vendorId !== vendorId) {
      throw { statusCode: 403, message: 'Unauthorized to delete this product', code: 'FORBIDDEN' };
    }

    await product.destroy();
    return { message: 'Product deleted successfully' };
  }

  async getProductsByVendor(vendorId, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage;

    const { count, rows } = await this.Product.findAndCountAll({
      where: { vendorId },
      include: [{ model: this.ProductImage }],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      products: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }

  async getSimilarProducts(productId, categoryId, limit = 10) {
    const products = await this.Product.findAll({
      where: {
        categoryId,
        id: { [this.Product.sequelize.Sequelize.Op.ne]: productId },
        isActive: true,
      },
      include: [
        { model: this.ProductImage, as: 'ProductImages' },
        { model: this.Vendor, attributes: ['id', 'businessName'] },
        { model: this.Category, attributes: ['id', 'name'] },
      ],
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit,
    });

    return products;
  }

  async updateStock(productId, quantity) {
    const product = await this.Product.findByPk(productId);

    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }

    await product.update({ stock: product.stock - quantity });
    return product;
  }
}
