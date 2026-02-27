// ProductImage Model
export default (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'product_images',
    timestamps: false,
    indexes: [
      { fields: ['productId'] },
    ],
  });

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
  };

  return ProductImage;
};
