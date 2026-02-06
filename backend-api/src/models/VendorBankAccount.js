// Vendor Bank Account Model (for storing payout bank details)
export default (sequelize, DataTypes) => {
  const VendorBankAccount = sequelize.define('VendorBankAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id',
      },
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 20],
      },
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountType: {
      type: DataTypes.ENUM('checking', 'savings'),
      defaultValue: 'checking',
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    swiftCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ibanCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['vendorId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  });

  VendorBankAccount.associate = (models) => {
    VendorBankAccount.belongsTo(models.Vendor, {
      foreignKey: 'vendorId',
      onDelete: 'CASCADE',
    });
    VendorBankAccount.hasMany(models.VendorPayout, {
      foreignKey: 'bankAccountId',
    });
  };

  return VendorBankAccount;
};
