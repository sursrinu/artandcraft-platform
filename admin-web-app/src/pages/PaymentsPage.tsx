import React, { useEffect, useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import { Card, Button, Input, Alert, DataTable, Badge, LoadingSpinner, Modal } from '../components';
import apiService from '../services/api';
import { usePagination } from '../hooks';

interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  user?: { name: string };
  createdAt: string;
  maskedNumber?: string;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { currentPage, totalPages, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  // Map payment method IDs to readable names
  const getPaymentMethodName = (method: any): string => {
    const methodMap: { [key: string]: string } = {
      '1': 'Credit Card',
      '2': 'UPI Payment',
      '3': 'Net Banking',
      '4': 'Wallet',
      'card': 'Credit Card',
      'upi': 'UPI Payment',
      'netbanking': 'Net Banking',
      'wallet': 'Digital Wallet',
    };
    return methodMap[String(method)] || 'Card';
  };

  // Generate masked payment number
  const getMaskedPaymentNumber = (payment: any, method: string | number, orderId?: number): string => {
    const methodStr = String(method);
    
    if (methodStr === '2' || methodStr.toLowerCase() === 'upi' || methodStr === 'UPI Payment') {
      // UPI: Show masked UPI ID
      if (payment?.metadata?.upiId) {
        const upi = payment.metadata.upiId;
        if (upi.length > 5) {
          return `${upi.substring(0, 2)}****${upi.substring(upi.length - 3)}`;
        }
      }
      // Generate generic masked UPI if no metadata
      return `user${orderId || '****'}@upi`;
    } else if (methodStr === '1' || methodStr.toLowerCase() === 'card' || methodStr === 'Credit Card') {
      // Card: Show masked card number
      if (payment?.metadata?.cardLastFour) {
        return `**** **** **** ${payment.metadata.cardLastFour}`;
      }
      // Generate generic masked card if no metadata
      return `**** **** **** ${String(orderId || '0000').slice(-4).padStart(4, '0')}`;
    } else if (methodStr === '3' || methodStr.toLowerCase() === 'netbanking') {
      // Net Banking: Show masked account
      if (payment?.metadata?.bankName) {
        return `${payment.metadata.bankName} Account`;
      }
      return 'Net Banking Account';
    } else if (methodStr === '4' || methodStr.toLowerCase() === 'wallet') {
      return 'Digital Wallet';
    }
    return 'Payment';
  };

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      // Try to get payments from orders endpoint as payments endpoint doesn't exist yet
      const response = await apiService.getOrders(page, 10);
      
      // Transform orders to payment format
      const ordersData = response.data?.data?.orders || [];
      const paymentData = ordersData.map((order: any) => {
        const payment = order.Payment;
        return {
          id: order.id,
          transactionId: `TXN-${order.orderNumber}`,
          amount: parseFloat(order.totalAmount),
          status: order.paymentStatus,
          paymentMethod: getPaymentMethodName(order.paymentMethod),
          maskedNumber: getMaskedPaymentNumber(payment, order.paymentMethod, order.id),
          user: order.user,
          createdAt: order.createdAt,
        };
      });
      
      setPayments(paymentData);
      setTotalPages(Math.ceil((response.data?.data?.totalCount || 0) / 10));
      setTotalItems(response.data?.data?.totalCount || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
      console.error('Payment fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const filteredPayments = payments.filter(
    (p) => p.transactionId?.includes(searchTerm) || p.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'transactionId' as const, label: 'Transaction ID', sortable: true },
    { key: 'user' as const, label: 'Customer', render: (u: any) => u?.name || 'N/A' },
    { key: 'amount' as const, label: 'Amount', render: (v: number) => `$${v.toFixed(2)}` },
    { key: 'paymentMethod' as const, label: 'Method' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (v: string) => <Badge label={v} variant={v === 'completed' ? 'success' : v === 'pending' ? 'warning' : 'error'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      <Card>
        <div className="mb-6">
          <Input
            placeholder="Search by transaction ID or customer..."
            icon={<Search size={20} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            actions={(payment) => (
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Eye size={16} />}
                onClick={() => setSelectedPayment(payment)}
              >
                View
              </Button>
            )}
            emptyMessage="No payments found"
          />
        )}
      </Card>

      {/* Payment Details Modal */}
      <Modal 
        isOpen={!!selectedPayment}
        title="Payment Details" 
        onClose={() => setSelectedPayment(null)}
        footer={
          <Button variant="secondary" onClick={() => setSelectedPayment(null)}>
            Close
          </Button>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                <p className="text-gray-900 font-semibold">{selectedPayment.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Customer</label>
                <p className="text-gray-900 font-semibold">{selectedPayment.user?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900 font-semibold">${selectedPayment.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="text-gray-900 font-semibold">{selectedPayment.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Details</label>
                <p className="text-gray-900 font-semibold">{selectedPayment.maskedNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge 
                  label={selectedPayment.status} 
                  variant={selectedPayment.status === 'completed' ? 'success' : selectedPayment.status === 'pending' ? 'warning' : 'error'} 
                  size="sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-gray-900 font-semibold">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
