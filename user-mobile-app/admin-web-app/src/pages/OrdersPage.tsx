import React, { useEffect, useState } from 'react';
import { Eye, Search, Edit2 } from 'lucide-react';
import { Card, Button, Input, Alert, DataTable, Badge, LoadingSpinner, OrderStatusModal, OrderDetailModal } from '../components';
import apiService from '../services/api';
import { usePagination } from '../hooks';

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  user?: { name: string };
  createdAt: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { currentPage, totalPages, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getOrders(page, 10);
      setOrders(response.data?.data?.orders || []);
      setTotalPages(Math.ceil((response.data?.data?.totalCount || 0) / 10));
      setTotalItems(response.data?.data?.totalCount || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleStatusUpdate = async (status: string) => {
    if (!selectedOrder) return;
    try {
      await apiService.updateOrderStatus(selectedOrder.id, status);
      fetchOrders(currentPage);
    } catch (err: any) {
      throw err;
    }
  };

  const filteredOrders = orders.filter(
    (o) => o.orderNumber.includes(searchTerm) || o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'orderNumber' as const, label: 'Order #', sortable: true },
    { key: 'user' as const, label: 'Customer', render: (u: any) => u?.name || 'N/A' },
    { key: 'totalAmount' as const, label: 'Amount', render: (v: any) => {
      const num = typeof v === 'string' ? parseFloat(v) : v;
      return `$${num.toFixed(2)}`;
    }},
    {
      key: 'status' as const,
      label: 'Status',
      render: (v: string) => <Badge label={v} variant={v === 'delivered' ? 'success' : v === 'pending' ? 'warning' : v === 'cancelled' ? 'error' : v === 'shipped' ? 'info' : 'default'} size="sm" />,
    },
    {
      key: 'paymentStatus' as const,
      label: 'Payment',
      render: (v: string) => <Badge label={v} variant={v === 'paid' ? 'success' : 'warning'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      <Card>
        <div className="mb-6">
          <Input
            placeholder="Search by order number or customer..."
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
            data={filteredOrders}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            actions={(order) => (
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Eye size={16} />}
                  onClick={() => {
                    setSelectedOrder(order);
                    setDetailModalOpen(true);
                  }}
                >
                  View
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Edit2 size={16} />}
                  onClick={() => {
                    setSelectedOrder(order);
                    setStatusModalOpen(true);
                  }}
                >
                  Status
                </Button>
              </div>
            )}
            emptyMessage="No orders found"
          />
        )}
      </Card>

      {selectedOrder && (
        <>
          <OrderDetailModal
            isOpen={detailModalOpen}
            orderId={selectedOrder.id}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedOrder(null);
            }}
          />
          <OrderStatusModal
            isOpen={statusModalOpen}
            orderId={selectedOrder.id}
            currentStatus={selectedOrder.status}
            currentAmount={selectedOrder.totalAmount}
            onClose={() => {
              setStatusModalOpen(false);
              setSelectedOrder(null);
            }}
            onSubmit={handleStatusUpdate}
          />
        </>
      )}
    </div>
  );
};

export default OrdersPage;
