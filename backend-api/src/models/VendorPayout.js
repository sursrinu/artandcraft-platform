// Vendor Payout Model
export default (sequelize, DataTypes) => {
  const VendorPayout = sequelize.define('VendorPayout', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Foreign key constraint removed to fix table creation error
      // references: {
      //   model: 'Vendors',
      //   key: 'id',
      // },
    },
    payoutNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Period for which payout is calculated (e.g., 2024-01)',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Period start date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Period end date',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled'
      ),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('bank_transfer', 'check', 'paypal', 'stripe'),
      allowNull: true,
    },
    bankAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Foreign key constraint removed to fix table creation error
      // references: {
      //   model: 'VendorBankAccount',
      //   key: 'id',
      // },
    },
    totalSales: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Total sales during period',
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of orders during period',
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Commission rate applied (%)',
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Commission deducted from sales',
    },
    deductions: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Any additional deductions',
    },
    deductionReasons: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reasons for deductions',
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External payment gateway transaction ID',
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin user ID who created the payout',
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin user ID who processed the payout',
    },
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['vendorId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['period'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  });

  VendorPayout.associate = (models) => {
    VendorPayout.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      onDelete: 'CASCADE',
    });
    // Foreign key association with VendorBankAccount is disabled to fix constraint error
    // VendorPayout.belongsTo(models.VendorBankAccount, {
    //   foreignKey: 'bankAccountId',
    //   allowNull: true,
    // });
  };

  return VendorPayout;
};
