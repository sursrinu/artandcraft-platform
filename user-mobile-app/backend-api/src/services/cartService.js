// Cart Service
export class CartService {
  constructor(db) {
    this.Cart = db.Cart;
    this.CartItem = db.CartItem;
    this.Product = db.Product;
    this.User = db.User;
  }

  async getCart(userId) {
    let cart = await this.Cart.findOne({
      where: { userId },
      include: [
        {
          model: this.CartItem,
          attributes: ['id', 'cartId', 'productId', 'quantity'],
          include: [
            {
              model: this.Product,
              attributes: ['id', 'name', 'price', 'stock', 'rating'],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await this.Cart.create({ userId });
    }

    // Calculate cart totals
    let subtotal = 0;
    if (cart.CartItems && cart.CartItems.length > 0) {
      for (const item of cart.CartItems) {
        const price = parseFloat(item.Product.price) || 0;
        subtotal += price * item.quantity;
      }
    }
    
    const taxRate = 0.1; // 10% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Add calculated values to response
    return {
      ...cart.toJSON(),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  }

  async addToCart(userId, productId, quantity) {
    const product = await this.Product.findByPk(productId);

    if (!product) {
      throw { statusCode: 404, message: 'Product not found', code: 'NOT_FOUND' };
    }

    if (product.stock < quantity) {
      throw { statusCode: 400, message: 'Insufficient stock', code: 'INSUFFICIENT_STOCK' };
    }

    let cart = await this.Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await this.Cart.create({ userId });
    }

    let cartItem = await this.CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      await cartItem.update({ quantity: cartItem.quantity + quantity });
    } else {
      cartItem = await this.CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId, cartItemId) {
    const cart = await this.Cart.findOne({ where: { userId } });

    if (!cart) {
      throw { statusCode: 404, message: 'Cart not found', code: 'NOT_FOUND' };
    }

    const cartItem = await this.CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw { statusCode: 404, message: 'Cart item not found', code: 'NOT_FOUND' };
    }

    await cartItem.destroy();

    return this.getCart(userId);
  }

  async updateCartItemQuantity(userId, cartItemId, quantity) {
    if (quantity < 1) {
      throw { statusCode: 400, message: 'Quantity must be at least 1', code: 'INVALID_QUANTITY' };
    }

    const cart = await this.Cart.findOne({ where: { userId } });

    if (!cart) {
      throw { statusCode: 404, message: 'Cart not found', code: 'NOT_FOUND' };
    }

    const cartItem = await this.CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
      include: [{ model: this.Product }],
    });

    if (!cartItem) {
      throw { statusCode: 404, message: 'Cart item not found', code: 'NOT_FOUND' };
    }

    if (cartItem.Product.stock < quantity) {
      throw { statusCode: 400, message: 'Insufficient stock', code: 'INSUFFICIENT_STOCK' };
    }

    await cartItem.update({ quantity });

    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await this.Cart.findOne({ where: { userId } });

    if (!cart) {
      throw { statusCode: 404, message: 'Cart not found', code: 'NOT_FOUND' };
    }

    await this.CartItem.destroy({ where: { cartId: cart.id } });

    return { message: 'Cart cleared successfully' };
  }

  async getCartSummary(userId) {
    const cart = await this.getCart(userId);

    let subtotal = 0;
    let discount = 0;
    let totalItems = 0;

    for (const item of cart.CartItems || []) {
      const itemTotal = item.Product.price * item.quantity;
      subtotal += itemTotal;

      if (item.Product.discountPercentage) {
        discount += (itemTotal * item.Product.discountPercentage) / 100;
      }

      totalItems += item.quantity;
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal - discount + tax;

    return {
      items: cart.CartItems || [],
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: totalItems,
    };
  }
}
