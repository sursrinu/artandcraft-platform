// JWT configuration
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

export const generateTokens = (userId, email, userType) => {
  const accessToken = jwt.sign(
    { userId, email, userType },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
