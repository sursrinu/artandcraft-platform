-- Add isEmailVerified column to users table
ALTER TABLE users
  ADD COLUMN isEmailVerified BOOLEAN DEFAULT FALSE;
