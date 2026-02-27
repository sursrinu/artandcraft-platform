-- Migration script to update payments table ENUM for status
ALTER TABLE payments 
MODIFY COLUMN status ENUM(
  'created',
  'pending',
  'authorized',
  'captured',
  'completed',
  'failed',
  'refunded'
) DEFAULT 'created';
