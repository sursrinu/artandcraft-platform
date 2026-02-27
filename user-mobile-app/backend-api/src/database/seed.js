// Database Seeding
import models from '../models/index.js';
import bcrypt from 'bcryptjs';

const { User, Vendor, Category, Product, ProductImage } = models;
const { sequelize } = models;

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@artcraft.com',
      password: adminPassword,
      phone: '+1234567890',
      userType: 'admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    console.log('✅ Admin user created');
    
    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@artcraft.com',
      password: customerPassword,
      phone: '+1234567891',
      userType: 'customer',
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    console.log('✅ Customer user created');
    
    // Create test vendor
    const vendorUser = await User.create({
      name: 'Jane Vendor',
      email: 'vendor@artcraft.com',
      password: await bcrypt.hash('vendor123', 10),
      phone: '+1234567892',
      userType: 'vendor',
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    
    const vendor = await Vendor.create({
      userId: vendorUser.id,
      businessName: 'Artisan Crafts',
      businessDescription: 'Handmade arts and crafts studio offering unique pieces',
      address: '123 Arts Avenue, Studio 45',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      zipCode: '94102',
      email: 'vendor@artcraft.com',
      phone: '+1-415-555-1234',
      status: 'approved',
      commissionRate: 10,
      bankAccountNumber: '1234567890',
      verificationDocumentUrl: 'https://example.com/doc.pdf',
      verifiedAt: new Date(),
      rating: 4.5,
      totalReviews: 25,
    });
    console.log('✅ Vendor user and vendor profile created');
    
    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Paintings',
        slug: 'paintings',
        description: 'Beautiful handmade paintings',
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Sculptures',
        slug: 'sculptures',
        description: 'Unique sculptures and figurines',
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Pottery',
        slug: 'pottery',
        description: 'Ceramic and pottery items',
        displayOrder: 3,
        isActive: true,
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Handcrafted jewelry pieces',
        displayOrder: 4,
        isActive: true,
      },
    ]);
    console.log('✅ Categories created');
    
    // Create sample products
    const products = await Product.bulkCreate([
      {
        vendorId: vendor.id,
        categoryId: categories[0].id,
        name: 'Abstract Sunset Painting',
        slug: 'abstract-sunset-painting',
        description: 'A vibrant abstract painting capturing the essence of sunset',
        price: 150.00,
        costPrice: 80.00,
        stock: 5,
        sku: 'ART-001',
        discountPercentage: 0,
        rating: 4.5,
        totalReviews: 12,
        totalSold: 8,
      },
      {
        vendorId: vendor.id,
        categoryId: categories[1].id,
        name: 'Stone Sculpture',
        slug: 'stone-sculpture',
        description: 'Hand-carved limestone sculpture',
        price: 500.00,
        costPrice: 300.00,
        stock: 2,
        sku: 'ART-002',
        discountPercentage: 10,
        rating: 5,
        totalReviews: 5,
        totalSold: 3,
      },
      {
        vendorId: vendor.id,
        categoryId: categories[2].id,
        name: 'Ceramic Bowl',
        slug: 'ceramic-bowl',
        description: 'Handmade ceramic bowl with traditional patterns',
        price: 45.00,
        costPrice: 20.00,
        stock: 20,
        sku: 'ART-003',
        discountPercentage: 5,
        rating: 4,
        totalReviews: 8,
        totalSold: 15,
      },
      {
        vendorId: vendor.id,
        categoryId: categories[3].id,
        name: 'Beaded Necklace',
        slug: 'beaded-necklace',
        description: 'Colorful beaded necklace with semi-precious stones',
        price: 75.00,
        costPrice: 30.00,
        stock: 10,
        sku: 'ART-004',
        discountPercentage: 0,
        rating: 4.5,
        totalReviews: 18,
        totalSold: 25,
      },
    ]);
    console.log('✅ Sample products created');
    
    // Add product images
    for (const product of products) {
      await ProductImage.bulkCreate([
        {
          productId: product.id,
          imageUrl: `https://example.com/images/${product.slug}-1.jpg`,
          altText: `${product.name} - View 1`,
          displayOrder: 1,
          isPrimary: true,
        },
        {
          productId: product.id,
          imageUrl: `https://example.com/images/${product.slug}-2.jpg`,
          altText: `${product.name} - View 2`,
          displayOrder: 2,
          isPrimary: false,
        },
      ]);
    }
    console.log('✅ Product images added');
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@artcraft.com / admin123');
    console.log('Customer: customer@artcraft.com / customer123');
    console.log('Vendor: vendor@artcraft.com / vendor123');
    
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
};

export default seed;
