// Payment Method Model - for storing customer's saved payment methods
export default (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('card', 'upi', 'netbanking', 'wallet'),
      allowNull: false,
    },
    // For card payments
    cardToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cardLastFour: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    cardHolderName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cardExpiry: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    
    // For UPI payments
    upiId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    
    // For Net Banking
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bankAccountToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    
    // For Wallet payments
    walletProvider: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    walletId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    
    // General fields
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'payment_methods',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['isDefault'] },
      { fields: ['isActive'] },
    ],
  });

  PaymentMethod.associate = (models) => {
    PaymentMethod.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return PaymentMethod;
};
