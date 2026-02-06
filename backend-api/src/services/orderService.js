// Order Service
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  constructor(db) {
    this.Order = db.Order;
    this.OrderItem = db.OrderItem;
    this.Product = db.Product;
    this.Cart = db.Cart;
    this.CartItem = db.CartItem;
    this.Vendor = db.Vendor;
    this.User = db.User;
    this.Payment = db.Payment;
    this.Notification = db.Notification;
  }

  async createOrder(userId, orderData) {
    const { items, shippingAddress, paymentMethod } = orderData;

    // Get cart and validate items
    const cart = await this.Cart.findOne({
      where: { userId },
      include: [{ model: this.CartItem, include: [{ model: this.Product }] }],
    });

    if (!cart || cart.CartItems.length === 0) {
      throw { statusCode: 400, message: 'Cart is empty', code: 'EMPTY_CART' };
    }

    // Group items by vendor
    const vendorOrders = {};
    let totalAmount = 0;

    for (const cartItem of cart.CartItems) {
      const product = cartItem.Product;
      const vendorId = product.vendorId;

      if (!vendorOrders[vendorId]) {
        vendorOrders[vendorId] = {
          vendorId,
          items: [],
          totalAmount: 0,
        };
      }

      vendorOrders[vendorId].items.push({
        productId: product.id,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        discountPercentage: product.discountPercentage || 0,
      });

      const itemTotal = product.price * cartItem.quantity;
      vendorOrders[vendorId].totalAmount += itemTotal;
      totalAmount += itemTotal;
    }

    // Create orders for each vendor
    const createdOrders = [];
    for (const vendorId in vendorOrders) {
      const vendorOrder = vendorOrders[vendorId];
      const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

      const order = await this.Order.create({
        orderNumber,
        userId,
        vendorId: parseInt(vendorId),
        totalAmount: vendorOrder.totalAmount,
        shippingAddress,
        paymentMethod,
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
      });

      // Create order items
      for (const item of vendorOrder.items) {
        const totalPrice = item.unitPrice * item.quantity;
        await this.OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          totalPrice,
        });

        // Update product stock
        await this.Product.increment({ stock: -item.quantity }, {
          where: { id: item.productId },
        });
      }

      // Reload order with items
      const orderWithItems = await this.Order.findByPk(order.id, {
        include: [{ model: this.OrderItem }],
      });

      createdOrders.push(orderWithItems);

      // Send notification to vendor
      const vendor = await this.Vendor.findByPk(vendorId);
      if (vendor) {
        const vendorUser = await this.User.findByPk(vendor.userId);
        if (vendorUser) {
          await this.Notification.create({
            userId: vendor.userId,
            type: 'new_order',
            title: 'New Order Received',
            message: `You have a new order #${orderNumber}`,
            relatedId: order.id,
            relatedType: 'order',
          });
        }
      }
    }

    // Clear cart
    await this.CartItem.destroy({ where: { cartId: cart.id } });

    return {
      orders: createdOrders,
      totalAmount,
      message: 'Orders created successfully',
    };
  }

  async getOrders(userId, filters = {}) {
    const { page = 1, perPage = 20, status } = filters;
    const offset = (page - 1) * perPage;

    const where = { userId };
    if (status) where.status = status;

    const { count, rows } = await this.Order.findAndCountAll({
      where,
      include: [
        {
          model: this.OrderItem,
          include: [{ model: this.Product }],
        },
        { model: this.Vendor, attributes: ['businessName'] },
        { model: this.Payment },
      ],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      orders: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }

  async getOrderById(orderId, userId) {
    const order = await this.Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: this.OrderItem,
          include: [{ model: this.Product }],
        },
        { model: this.Vendor, attributes: ['businessName', 'email'] },
        { model: this.User, attributes: ['name', 'email', 'phone'] },
        { model: this.Payment },
      ],
    });

    if (!order) {
      throw { statusCode: 404, message: 'Order not found', code: 'NOT_FOUND' };
    }

    return order;
  }

  async getOrderByIdAdmin(orderId) {
    // Admin version - no user restriction
    const order = await this.Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: this.OrderItem,
          include: [{ model: this.Product }],
        },
        { model: this.Vendor, attributes: ['businessName', 'email'] },
        { model: this.User, attributes: ['name', 'email', 'phone'] },
        { model: this.Payment },
      ],
    });

    if (!order) {
      throw { statusCode: 404, message: 'Order not found', code: 'NOT_FOUND' };
    }

    return order;
  }

  async updateOrderStatus(orderId, vendorId, status) {
    const order = await this.Order.findByPk(orderId);

    if (!order) {
      throw { statusCode: 404, message: 'Order not found', code: 'NOT_FOUND' };
    }

    if (order.vendorId !== vendorId) {
      throw { statusCode: 403, message: 'Unauthorized', code: 'FORBIDDEN' };
    }

    await order.update({ status });

    // Send notification to customer
    const user = await this.User.findByPk(order.userId);
    if (user) {
      await this.Notification.create({
        userId: order.userId,
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Your order #${order.orderNumber} status is now ${status}`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    return order;
  }

  async updateOrderStatusAdmin(orderId, status) {
    const order = await this.Order.findByPk(orderId);

    if (!order) {
      throw { statusCode: 404, message: 'Order not found', code: 'NOT_FOUND' };
    }

    await order.update({ status });

    // Send notification to customer
    const user = await this.User.findByPk(order.userId);
    if (user) {
      await this.Notification.create({
        userId: order.userId,
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Your order #${order.orderNumber} status is now ${status}`,
        relatedId: order.id,
        relatedType: 'order',
      });
    }

    return order;
  }

  async cancelOrder(orderId, userId) {
    const order = await this.Order.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw { statusCode: 404, message: 'Order not found', code: 'NOT_FOUND' };
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw { statusCode: 400, message: 'Cannot cancel this order', code: 'INVALID_STATUS' };
    }

    // Restore product stock
    const orderItems = await this.OrderItem.findAll({ where: { orderId: order.id } });
    for (const item of orderItems) {
      await this.Product.increment({ stock: item.quantity }, {
        where: { id: item.productId },
      });
    }

    await order.update({ status: 'cancelled' });

    return order;
  }

  async getAllOrders(filters = {}) {
    const { page = 1, perPage = 20, status } = filters;
    const offset = (page - 1) * perPage;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await this.Order.findAndCountAll({
      where,
      include: [
        {
          model: this.OrderItem,
          include: [{ model: this.Product }],
        },
        { model: this.Vendor, attributes: ['businessName'] },
        { model: this.User, attributes: ['name', 'email'] },
        { model: this.Payment },
      ],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      orders: rows,
      totalCount: count,
      page,
      perPage,
      totalPages: Math.ceil(count / perPage),
    };
  }

  async getVendorOrders(vendorId, filters = {}) {
    const { page = 1, perPage = 20, status } = filters;
    const offset = (page - 1) * perPage;

    const where = { vendorId };
    if (status) where.status = status;

    const { count, rows } = await this.Order.findAndCountAll({
      where,
      include: [
        {
          model: this.OrderItem,
          include: [{ model: this.Product }],
        },
        { model: this.User, attributes: ['name', 'email', 'phone'] },
        { model: this.Payment },
      ],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      orders: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }
}
