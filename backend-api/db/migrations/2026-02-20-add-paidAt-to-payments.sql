-- Migration: Add paidAt column to payments table
ALTER TABLE payments ADD COLUMN paidAt DATETIME NULL;
