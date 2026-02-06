import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { Card, Button, Input, Modal, Alert, DataTable, Badge, LoadingSpinner } from '../components';
import apiService from '../services/api';
import { useForm, usePagination, useDelete } from '../hooks';

interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  vendorId: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { currentPage, totalPages, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getCategories(page, 10);
      setCategories(response.data?.data?.categories || []);
      setTotalPages(Math.ceil((response.data?.data?.totalCount || 0) / 10));
      setTotalItems(response.data?.data?.totalCount || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      const response = await apiService.getProducts(1, 100, { categoryId });
      setProducts(response.data?.data?.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  const handleViewProducts = (category: Category) => {
    setSelectedCategory(category);
    fetchProductsByCategory(category.id);
    setIsProductsModalOpen(true);
  };

  const { formData, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useForm({
    initialValues: editingCategory ? { name: editingCategory.name } : { name: '' },
    onSubmit: async (data) => {
      try {
        if (editingCategory) {
          await apiService.updateCategory(editingCategory.id, data);
        } else {
          await apiService.createCategory(data);
        }
        setIsModalOpen(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories(currentPage);
      } catch (err: any) {
        console.error('Error:', err);
      }
    },
  });

  const { handleDelete } = useDelete(
    (id) => apiService.deleteCategory(id),
    { onSuccess: () => fetchCategories(currentPage) }
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'slug' as const, label: 'Slug' },
    {
      key: 'isActive' as const,
      label: 'Status',
      render: (v: boolean) => <Badge label={v ? 'Active' : 'Inactive'} variant={v ? 'success' : 'error'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Button icon={<Plus size={20} />} onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>Add Category</Button>
      </div>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      <Card>
        <div className="mb-6">
          <Input placeholder="Search categories..." icon={<Search size={20} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={filteredCategories} loading={loading} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} actions={(cat) => (
            <div className="flex gap-2">
              <Button variant="info" size="sm" icon={<Package size={16} />} onClick={() => handleViewProducts(cat)}>Products</Button>
              <Button variant="secondary" size="sm" icon={<Edit size={16} />} onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}>Edit</Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => handleDelete(cat.id)}>Delete</Button>
            </div>
          )} emptyMessage="No categories found" />
        )}
      </Card>
      <Modal isOpen={isModalOpen} title={editingCategory ? 'Edit Category' : 'Add Category'} onClose={() => { setIsModalOpen(false); setEditingCategory(null); }} footer={<><Button variant="secondary" onClick={() => { setIsModalOpen(false); setEditingCategory(null); }}>Cancel</Button><Button loading={isSubmitting} onClick={(e) => handleSubmit(e as any)}>Save</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
        </form>
      </Modal>

      <Modal 
        isOpen={isProductsModalOpen} 
        title={selectedCategory ? `Products in ${selectedCategory.name}` : 'Products'} 
        onClose={() => { setIsProductsModalOpen(false); setSelectedCategory(null); }}
        size="lg"
        footer={
          <Button 
            variant="secondary" 
            onClick={() => { setIsProductsModalOpen(false); setSelectedCategory(null); }}
          >
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Products in this Category</h3>
            <Button 
              icon={<Plus size={16} />} 
              size="sm"
              onClick={() => {
                if (selectedCategory) {
                  setIsProductsModalOpen(false);
                  navigate(`/products?categoryId=${selectedCategory.id}&addNew=true`);
                }
              }}
            >
              Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No products in this category yet.</p>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  if (selectedCategory) {
                    setIsProductsModalOpen(false);
                    navigate(`/products?categoryId=${selectedCategory.id}&addNew=true`);
                  }
                }}
                className="mt-4"
              >
                Add First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{product.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<Edit size={16} />}
                      onClick={() => {
                        setIsProductsModalOpen(false);
                        navigate(`/products?edit=${product.id}`);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      icon={<Trash2 size={16} />}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          apiService.deleteProduct(product.id).then(() => {
                            fetchProductsByCategory(selectedCategory!.id);
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
