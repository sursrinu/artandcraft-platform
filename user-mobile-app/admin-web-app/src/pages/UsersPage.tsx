import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, Button, Input, Modal, Alert, DataTable, Badge, LoadingSpinner, Select } from '../components';
import apiService from '../services/api';
import { useForm, usePagination, useDelete, useToast } from '../hooks';
import { CommonRules, ValidationRules } from '../utils/validation';

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { success, error: errorToast } = useToast();

  const { currentPage, totalPages, totalItems, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  // Dynamic validation rules based on whether we're editing or creating
  const getValidationRules = (): ValidationRules => {
    const rules: ValidationRules = {
      name: CommonRules.name,
      email: CommonRules.email,
      userType: {
        required: 'User type is required',
      },
    };
    
    // Only require password when creating a new user
    if (!editingUser) {
      rules.password = {
        required: 'Password is required',
        minLength: { value: 6, message: 'Password must be at least 6 characters' },
      };
    }
    
    return rules;
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getUsers(page, 10);
      setUsers(response.data?.data?.users || []);
      setTotalPages(Math.ceil((response.data?.data?.totalCount || 0) / 10));
      setTotalItems(response.data?.data?.totalCount || 0);
      setError(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMsg);
      errorToast('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const { formData, errors, isSubmitting, touched, handleChange, handleBlur, handleSubmit, resetForm, setFormData: setFormDataState } = useForm({
    initialValues: { name: '', email: '', password: '', userType: 'customer' },
    validationRules: getValidationRules(),
    onSubmit: async (data) => {
      try {
        if (editingUser) {
          // Don't send password or email for update if not changed
          const updateData = {
            name: data.name,
            userType: data.userType,
          };
          await apiService.updateUser(editingUser.id, updateData);
          success('Success', 'User updated successfully');
        } else {
          await apiService.createUser(data);
          success('Success', 'User created successfully');
        }
        setIsModalOpen(false);
        setEditingUser(null);
        resetForm();
        fetchUsers(currentPage);
      } catch (err: any) {
        console.error('Error submitting:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Operation failed';
        errorToast('Error', errorMsg);
      }
    },
  });

  // Update form when editing user changes
  useEffect(() => {
    if (editingUser) {
      setFormDataState({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        userType: editingUser.userType,
      });
    } else {
      setFormDataState({
        name: '',
        email: '',
        password: '',
        userType: 'customer',
      });
    }
  }, [editingUser]);

  // Reset form only when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      resetForm();
    }
  }, [isModalOpen]);

  const { handleDelete } = useDelete(
    (id) => apiService.deleteUser(id),
    {
      onSuccess: () => {
        success('Success', 'User deleted successfully');
        fetchUsers(currentPage);
      },
      onError: (err) => {
        errorToast('Error', err.message || 'Failed to delete user');
      },
    }
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name' as const,
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email' as const,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'userType' as const,
      label: 'Type',
      render: (value: string) => (
        <Badge label={value} variant={value === 'admin' ? 'info' : 'default'} size="sm" />
      ),
    },
    {
      key: 'isActive' as const,
      label: 'Status',
      render: (value: boolean) => (
        <Badge label={value ? 'Active' : 'Inactive'} variant={value ? 'success' : 'error'} size="sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button
          icon={<Plus size={20} />}
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}

      <Card>
        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
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
            data={filteredUsers}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            actions={(user) => (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit size={16} />}
                  onClick={() => {
                    setEditingUser(user);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </div>
            )}
            emptyMessage="No users found"
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingUser ? 'Edit User' : 'Add New User'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={(e) => handleSubmit(e as any)}
            >
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : undefined}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
            disabled={!!editingUser}
            required
          />
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : undefined}
              required
            />
          )}
          <Select
            label="User Type"
            name="userType"
            value={formData.userType || 'customer'}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.userType ? errors.userType : undefined}
            options={[
              { value: 'customer', label: 'Customer' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
