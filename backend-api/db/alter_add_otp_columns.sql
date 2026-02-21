-- Add OTP columns to User table for email verification
ALTER TABLE users
  ADD COLUMN otp VARCHAR(10) NULL,
  ADD COLUMN otpExpiresAt DATETIME NULL;
