import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button, Input, Alert, DataTable, Badge, LoadingSpinner, Modal } from '../components';
import apiService from '../services/api';
import { usePagination, useDelete } from '../hooks';

interface Vendor {
  id: number;
  businessName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commissionRate: number;
  createdAt: string;
}

const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { currentPage, totalPages, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getVendors(page, 10);
      const vendorsData = response.data?.data;
      setVendors(vendorsData?.vendors || []);
      const total = vendorsData?.pagination?.total || 0;
      setTotalPages(Math.ceil(total / 10));
      setTotalItems(total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(currentPage);
  }, [currentPage]);

  const { handleDelete } = useDelete(
    (id) => apiService.deleteUser(id),
    {
      onSuccess: () => fetchVendors(currentPage),
    }
  );

  const handleApprove = async (vendorId: number) => {
    try {
      await apiService.approveVendor(vendorId);
      fetchVendors(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId: number) => {
    try {
      await apiService.rejectVendor(vendorId, 'Rejected by admin');
      fetchVendors(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject vendor');
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'businessName' as const,
      label: 'Business Name',
      sortable: true,
    },
    {
      key: 'email' as const,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          variant={value as any}
          size="sm"
        />
      ),
    },
    {
      key: 'commissionRate' as const,
      label: 'Commission',
      render: (value: number) => `${value}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}

      <Card>
        <div className="mb-6">
          <Input
            placeholder="Search by business name or email..."
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
            data={filteredVendors}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            actions={(vendor) => (
              <div className="flex gap-2">
                {vendor.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      icon={<CheckCircle size={16} />}
                      onClick={() => handleApprove(vendor.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle size={16} />}
                      onClick={() => handleReject(vendor.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit size={16} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVendor(vendor);
                    setDetailModalOpen(true);
                  }}
                >
                  View
                </Button>
                {vendor.status !== 'approved' && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(vendor.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
            emptyMessage="No vendors found"
          />
        )}
      </Card>

      {/* Vendor Detail Modal */}
      {detailModalOpen && selectedVendor && (
        <Modal
          title="Vendor Details"
          isOpen={true}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedVendor(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Business Name</label>
              <p className="text-gray-900 font-semibold">{selectedVendor.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{selectedVendor.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge
                  label={selectedVendor.status.charAt(0).toUpperCase() + selectedVendor.status.slice(1)}
                  variant={selectedVendor.status as any}
                  size="sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Commission Rate</label>
              <p className="text-gray-900">{selectedVendor.commissionRate}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created At</label>
              <p className="text-gray-900">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VendorsPage;
