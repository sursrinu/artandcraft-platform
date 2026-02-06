// Swagger configuration
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Art & Craft Platform API',
      version: '1.0.0',
      description: 'API documentation for the Art & Craft e-commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@artandcraft.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://artandcraft-platform-production.up.railway.app'
          : 'http://localhost:7777',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            userType: { type: 'string', enum: ['customer', 'vendor', 'admin'] },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'integer' },
            categoryId: { type: 'integer' },
            vendorId: { type: 'integer' },
            images: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            image: { type: 'string' },
            parentId: { type: 'integer' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            orderNumber: { type: 'string' },
            userId: { type: 'integer' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
            totalAmount: { type: 'number' },
            shippingAddress: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            productId: { type: 'integer' },
            quantity: { type: 'integer' },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Products', description: 'Product operations' },
      { name: 'Categories', description: 'Category operations' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Vendors', description: 'Vendor operations' },
    ],
    paths: {
      '/api/v1/health': {
        get: {
          summary: 'Health check',
          description: 'Check if the API is running',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      message: { type: 'string', example: 'API is healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    userType: { type: 'string', enum: ['customer', 'vendor'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/v1/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'category', in: 'query', schema: { type: 'integer' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          ],
          responses: {
            200: {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Product details' },
            404: { description: 'Product not found' },
          },
        },
      },
      '/api/v1/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Get all categories',
          responses: {
            200: {
              description: 'List of categories',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Category' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/v1/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get user cart',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Cart contents' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['productId', 'quantity'],
                  properties: {
                    productId: { type: 'integer' },
                    quantity: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Item added to cart' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/orders': {
        get: {
          tags: ['Orders'],
          summary: 'Get user orders',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of orders' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Orders'],
          summary: 'Create new order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['shippingAddress'],
                  properties: {
                    shippingAddress: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        zipCode: { type: 'string' },
                        country: { type: 'string' },
                      },
                    },
                    paymentMethod: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Order created' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get order by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Order details' },
            404: { description: 'Order not found' },
          },
        },
      },
      '/api/v1/payments/razorpay/create-order': {
        post: {
          tags: ['Payments'],
          summary: 'Create Razorpay order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId', 'amount'],
                  properties: {
                    orderId: { type: 'integer' },
                    amount: { type: 'number' },
                    currency: { type: 'string', default: 'INR' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Razorpay order created' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/payments/razorpay/verify': {
        post: {
          tags: ['Payments'],
          summary: 'Verify Razorpay payment',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
                  properties: {
                    razorpay_order_id: { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature: { type: 'string' },
                    order_id: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Payment verified' },
            400: { description: 'Invalid signature' },
          },
        },
      },
    },
  },
  apis: [], // We define paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
