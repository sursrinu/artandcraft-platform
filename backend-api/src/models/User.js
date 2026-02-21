// User Model
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userType: {
      type: DataTypes.ENUM('customer', 'vendor', 'admin'),
      defaultValue: 'customer',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Pending by default, set true after OTP verification
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
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
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['userType'] },
      { fields: ['createdAt'] },
    ],
  });

  User.associate = (models) => {
    User.hasOne(models.Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasOne(models.Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.PaymentMethod, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
