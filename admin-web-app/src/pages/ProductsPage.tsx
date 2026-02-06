import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Search, Eye, Plus, Edit } from 'lucide-react';
import { Card, Button, Input, Alert, DataTable, Badge, LoadingSpinner, Modal, Select, Textarea } from '../components';
import apiService from '../services/api';
import { usePagination, useDelete, useForm, useToast } from '../hooks';
import { CommonRules, ValidationRules } from '../utils/validation';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://artandcraft-platform-production.up.railway.app';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: number;
  vendor?: { businessName: string };
  isActive: boolean;
  createdAt: string;
  description?: string;
  image?: string;
  ProductImages?: Array<{
    id: number;
    productId: number;
    imageUrl: string;
    altText: string;
    displayOrder?: number;
    isPrimary?: boolean;
  }>;
}

interface Category {
  id: number;
  name: string;
}

const validationRules: ValidationRules = {
  name: {
    required: 'Product name is required',
    minLength: { value: 2, message: 'Product name must be at least 2 characters' },
  },
  sku: {
    required: 'SKU is required',
    minLength: { value: 2, message: 'SKU must be at least 2 characters' },
  },
  price: {
    required: 'Price is required',
    validate: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Price must be a valid positive number';
      }
      return undefined;
    },
  },
  stock: {
    required: 'Stock quantity is required',
    validate: (value: any) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return 'Stock must be a valid non-negative number';
      }
      return undefined;
    },
  },
  categoryId: {
    validate: (value: any) => {
      if (!value || value === '' || value === '0') {
        return 'Category is required';
      }
      return undefined;
    },
  },
  description: {
    // Description is optional, so no validation
  },
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; productName: string } | null>(null);
  const { success, error: errorToast } = useToast();

  const { currentPage, totalPages, setTotalPages, setTotalItems, handlePageChange } = usePagination();

  // Check URL params for add/edit intent
  useEffect(() => {
    const addNew = searchParams.get('addNew');
    const categoryId = searchParams.get('categoryId');
    const edit = searchParams.get('edit');

    if (addNew === 'true') {
      setIsModalOpen(true);
      setEditingProduct(null);
      setUploadedImages([]);
      setSelectedFiles([]);
      setSearchParams({});
    } else if (edit) {
      const productId = parseInt(edit);
      const product = products.find(p => p.id === productId);
      if (product) {
        setEditingProduct(product);
        setIsModalOpen(true);
      }
      setSearchParams({});
    }
  }, [searchParams, products, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories(1, 100);
      const categories = response.data?.data?.categories || response.data?.data?.items || [];
      setCategories(categories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(page, 10);
      const responseData = response.data?.data;
      if (!responseData) {
        throw new Error('Invalid response format');
      }
      const { products = [], pagination = {} } = responseData;
      setProducts(products);
      setTotalPages(pagination.pages || 1);
      setTotalItems(pagination.total || 0);
      setError(null);
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(currentPage);
  }, [currentPage]);

  const { formData, errors, isSubmitting, touched, handleChange, handleBlur, handleSubmit, resetForm, setFormData } = useForm({
    initialValues: { name: '', sku: '', price: '', stock: '', categoryId: '', description: '' },
    validationRules,
    onSubmit: async (data) => {
      try {
        console.log('Form data on submit:', data);
        
        // Validate categoryId is selected
        if (!data.categoryId || data.categoryId === '' || data.categoryId === '0') {
          console.error('Category validation failed');
          errorToast('Error', 'Please select a category');
          return;
        }

        const payload = {
          name: data.name,
          sku: data.sku,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          category_id: parseInt(data.categoryId),
          description: data.description || '',
        };

        let createdProduct: any;
        if (editingProduct) {
          await apiService.updateProduct(editingProduct.id, payload);
          createdProduct = editingProduct;
          success('Success', 'Product updated successfully');
        } else {
          const response = await apiService.createProduct(payload);
          createdProduct = response.data.data;
          success('Success', 'Product created successfully');
        }

        // Upload images if any are selected
        if (selectedFiles.length > 0) {
          setUploadingImages(true);
          try {
            const imageResponse = await apiService.uploadProductImages(createdProduct.id, selectedFiles);
            setUploadedImages([...uploadedImages, ...imageResponse.data.data]);
            success('Success', 'Images uploaded successfully');
          } catch (imgErr: any) {
            console.error('Error uploading images:', imgErr);
            errorToast('Warning', 'Product created but image upload failed');
          } finally {
            setUploadingImages(false);
          }
        }

        setIsModalOpen(false);
        setEditingProduct(null);
        setUploadedImages([]);
        setSelectedFiles([]);
        resetForm();
        fetchProducts(currentPage);
      } catch (err: any) {
        console.error('Error creating/updating product:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Operation failed';
        errorToast('Error', errorMsg);
      }
    },
  });

  // Sync form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        categoryId: editingProduct.categoryId.toString(),
        description: editingProduct.description || '',
      });
      setUploadedImages([]);
      setSelectedFiles([]);
    } else {
      setFormData({ name: '', sku: '', price: '', stock: '', categoryId: '', description: '' });
      setUploadedImages([]);
      setSelectedFiles([]);
    }
  }, [editingProduct, setFormData]);

  const { handleDelete } = useDelete(
    (id) => apiService.deleteProduct(id),
    { onSuccess: () => fetchProducts(currentPage) }
  );

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'id' as const, 
      label: 'Image', 
      render: (v: any) => {
        const product = products.find(p => p.id === v);
        const primaryImage = product?.ProductImages?.[0];
        const imageUrl = primaryImage?.imageUrl || product?.image;
        
        return imageUrl ? (
          <img 
            src={`${API_URL}${imageUrl}`} 
            alt={product?.name}
            className="w-12 h-12 rounded object-cover cursor-pointer"
            onClick={() => setPreviewImage({ 
              url: `${API_URL}${imageUrl}`, 
              productName: product?.name || 'Product' 
            })}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        );
      }
    },
    { key: 'name' as const, label: 'Product Name', sortable: true },
    { key: 'sku' as const, label: 'SKU' },
    { key: 'price' as const, label: 'Price', render: (v: any) => `₹${parseFloat(v).toFixed(2)}` },
    { key: 'stock' as const, label: 'Stock' },
    {
      key: 'isActive' as const,
      label: 'Status',
      render: (v: boolean) => <Badge label={v ? 'Active' : 'Inactive'} variant={v ? 'success' : 'error'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <Button 
          icon={<Plus size={20} />} 
          onClick={() => { 
            setEditingProduct(null); 
            setFormData({ name: '', sku: '', price: '', stock: '', categoryId: '', description: '' });
            setIsModalOpen(true); 
          }}
        >
          Add Product
        </Button>
      </div>
      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      <Card>
        <div className="mb-6">
          <Input
            placeholder="Search products..."
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
            data={filteredProducts}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            actions={(product) => (
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Edit size={16} />}
                  onClick={() => {
                    setEditingProduct(product);
                    setIsModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => handleDelete(product.id)}>Delete</Button>
              </div>
            )}
            emptyMessage="No products found"
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSubmitting || uploadingImages}
              onClick={(e) => handleSubmit(e as any)}
              disabled={uploadingImages}
            >
              {editingProduct ? 'Update' : 'Create'}{uploadingImages && ' (Uploading images...)'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : undefined}
            required
          />
          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.sku ? errors.sku : undefined}
            required
          />
          <Input
            label="Price (₹)"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.price ? errors.price : undefined}
            required
          />
          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.stock ? errors.stock : undefined}
            required
          />
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={(e) => {
              console.log('Category changed:', e.target.value);
              handleChange(e);
            }}
            onBlur={handleBlur}
            error={touched.categoryId ? errors.categoryId : undefined}
            options={[
              { value: '', label: 'Select a category' },
              ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
          />
          
          {/* Uploaded Images Display */}
          {uploadedImages.length > 0 && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded Images
              </label>
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={`${API_URL}${image.imageUrl}`} 
                      alt={image.altText || `Image ${idx + 1}`}
                      className="w-full h-24 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ELoad Error%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image Upload Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('fileInput')?.click()}>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(files);
                }}
              />
              <p className="text-gray-600">Click to select images or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP (Max 5MB each, up to 5 files)</p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Files Preview:</p>
                <div className="grid grid-cols-3 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        className="w-full h-24 rounded object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center">
                        <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs truncate px-2">{file.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img src={`${API_URL}${img.imageUrl}`} alt={img.altText} className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.deleteProductImage(img.id);
                            setUploadedImages(uploadedImages.filter(i => i.id !== img.id));
                            success('Success', 'Image deleted');
                          } catch (err) {
                            errorToast('Error', 'Failed to delete image');
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold text-gray-900">{previewImage.productName}</h2>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-50">
              <img 
                src={previewImage.url}
                alt={previewImage.productName}
                className="max-w-full max-h-full rounded object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="16"%3EImage failed to load%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
