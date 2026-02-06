import React, { useEffect, useState } from 'react';
import { Modal, LoadingSpinner, Badge, Alert } from './index';
import { Package, User, DollarSign, Calendar } from 'lucide-react';
import apiService from '../services/api';

interface OrderDetailModalProps {
  isOpen: boolean;
  orderId: number;
  onClose: () => void;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  items?: Array<{
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  vendor?: {
    name: string;
  };
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, orderId, onClose }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching order details for ID:', orderId);
        const response = await apiService.getOrderById(orderId);
        console.log('Order details response:', response);
        setOrder(response.data?.data || response.data);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch order details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isOpen, orderId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details - ${order?.orderNumber || `#${orderId}`}`}>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Order Status</p>
              <div className="mt-2">
                <Badge label={order.status} variant={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'default'} size="sm" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Payment Status</p>
              <div className="mt-2">
                <Badge label={order.paymentStatus} variant={order.paymentStatus === 'paid' ? 'success' : 'warning'} size="sm" />
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="font-medium text-gray-900">${(typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {order.user && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-gray-600" />
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} className="text-gray-600" />
                <h4 className="font-semibold text-gray-900">Order Items</h4>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Information */}
          {order.vendor && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-600 uppercase font-medium">Vendor</p>
              <p className="font-medium text-gray-900 mt-1">{order.vendor.name}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No order details available</p>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
