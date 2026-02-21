-- Migration: Add failureReason column to payments table
ALTER TABLE payments ADD COLUMN failureReason VARCHAR(500) NULL;
