// Vendor Model
export default (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    businessDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bannerUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      defaultValue: 'pending',
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.00,
    },
    bankAccountNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bankRoutingNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    verificationDocumentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'vendors',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['email'] },
    ],
  });

  Vendor.associate = (models) => {
    Vendor.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Vendor.hasMany(models.Product, { foreignKey: 'vendorId', onDelete: 'CASCADE' });
    Vendor.hasMany(models.Order, { foreignKey: 'vendorId' });
  };

  return Vendor;
};
