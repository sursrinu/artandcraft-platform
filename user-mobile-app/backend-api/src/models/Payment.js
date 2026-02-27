// Payment Model
export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentGateway: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'razorpay',
    },
    // Razorpay-specific fields
    razorpayOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpaySignature: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('created', 'pending', 'authorized', 'captured', 'completed', 'failed', 'refunded'),
      defaultValue: 'created',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    // Refund fields
    refundId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    refundStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['transactionId'] },
      { fields: ['razorpayOrderId'] },
      { fields: ['razorpayPaymentId'] },
    ],
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: 'orderId' });
    Payment.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Payment;
};
