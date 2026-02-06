import React, { useState } from 'react';
import { Modal } from './index';
import { Button } from './index';
import { AlertCircle } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  orderId: number;
  currentStatus: string;
  currentAmount: number;
  onClose: () => void;
  onSubmit: (status: string, notes: string) => Promise<void>;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  orderId,
  currentStatus,
  currentAmount,
  onClose,
  onSubmit,
}) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newStatus === currentStatus && !notes) {
      alert('Please select a new status or add notes');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(newStatus, notes);
      setNotes('');
      setNewStatus(currentStatus);
      onClose();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Order #${orderId}`}>
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Order Amount: ${(parseFloat(currentAmount as any) || 0).toFixed(2)}</p>
            <p className="text-xs text-blue-700 mt-1">Current Status: <span className="font-semibold capitalize">{currentStatus}</span></p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">New Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Select the new status for this order</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this status change (e.g., reason for cancellation, shipping tracking info)..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
          />
          <p className="text-xs text-gray-500">{notes.length}/200 characters</p>
        </div>

        <div className="border-t pt-4 flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (newStatus === currentStatus && !notes)}
            loading={submitting}
          >
            {submitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderStatusModal;
