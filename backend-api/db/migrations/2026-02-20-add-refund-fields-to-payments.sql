-- Migration: Add refund and related columns to payments table
ALTER TABLE payments 
  ADD COLUMN refundId VARCHAR(255) NULL,
  ADD COLUMN refundAmount DECIMAL(10,2) NULL,
  ADD COLUMN refundStatus VARCHAR(50) NULL,
  ADD COLUMN refundedAt DATETIME NULL;
