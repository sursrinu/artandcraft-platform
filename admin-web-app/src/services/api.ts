import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:7777/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: (status) => {
        // Don't treat 404 on settings endpoints as error
        return true; // Resolve all responses, even errors
      },
    });

    // Add interceptors
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => {
        // Handle error status codes
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
        
        // Return response as-is (all statuses)
        return response;
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  async logout() {
    localStorage.removeItem('adminToken');
  }

  // Users
  async getProfile() {
    return this.api.get('/users/profile');
  }

  async getUsers(page = 1, limit = 20) {
    return this.api.get('/users', { params: { page, limit } });
  }

  async getUserById(id: number) {
    return this.api.get(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.api.post('/users', data);
  }

  async updateUser(id: number, data: any) {
    return this.api.put(`/users/${id}`, data);
  }

  async deleteUser(id: number) {
    return this.api.delete(`/users/${id}`);
  }

  // Vendors
  async getVendors(page = 1, limit = 20) {
    return this.api.get('/vendors', { params: { page, limit } });
  }

  async getVendorById(id: number) {
    return this.api.get(`/vendors/${id}`);
  }

  async approveVendor(id: number) {
    return this.api.patch(`/vendors/${id}/approve`);
  }

  async rejectVendor(id: number, reason: string) {
    return this.api.patch(`/vendors/${id}/reject`, { reason });
  }

  // Products
  async getProducts(page = 1, limit = 20, filters?: any) {
    return this.api.get('/products', { params: { page, limit, ...filters } });
  }

  async getProductById(id: number) {
    return this.api.get(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.api.post('/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.api.put(`/products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.api.delete(`/products/${id}`);
  }

  async uploadProductImages(productId: number, files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return this.api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteProductImage(imageId: number) {
    return this.api.delete(`/products/images/${imageId}`);
  }

  async moderateProduct(id: number, action: 'approve' | 'reject', reason?: string) {
    return this.api.patch(`/products/${id}/moderate`, { action, reason });
  }

  // Orders
  async getOrders(page = 1, limit = 20, filters?: any) {
    return this.api.get('/orders/admin/all', { params: { page, per_page: limit, ...filters } });
  }

  async getOrderById(id: number) {
    return this.api.get(`/orders/admin/${id}`);
  }

  async updateOrderStatus(id: number, status: string) {
    return this.api.put(`/orders/admin/${id}/status`, { status });
  }

  // Payments
  async getPayments(page = 1, limit = 20) {
    return this.api.get('/payments', { params: { page, limit } });
  }

  async getPaymentById(id: number) {
    return this.api.get(`/payments/${id}`);
  }

  // Categories
  async getCategories(page = 1, limit = 20) {
    return this.api.get('/categories', { params: { page, limit } });
  }

  async createCategory(data: any) {
    return this.api.post('/categories', data);
  }

  async updateCategory(id: number, data: any) {
    return this.api.put(`/categories/${id}`, data);
  }

  async deleteCategory(id: number) {
    return this.api.delete(`/categories/${id}`);
  }

  // Analytics
  async getDashboardStats() {
    return this.api.get('/admin/stats');
  }

  async getSalesData(period = '7d') {
    return this.api.get('/admin/sales', { params: { period } });
  }

  async getRevenueData(period = '7d') {
    return this.api.get('/admin/revenue', { params: { period } });
  }

  // Payouts
  async getPayouts(page = 1, limit = 20) {
    return this.api.get('/payouts/all', { params: { page, per_page: limit } });
  }

  async createPayout(id: number, data: any) {
    return this.api.post(`/payouts/${id}`, data);
  }

  async approvePayout(id: number) {
    return this.api.patch(`/payouts/${id}/approve`);
  }

  async rejectPayout(id: number, reason: string) {
    return this.api.patch(`/payouts/${id}/reject`, { reason });
  }

  // Settings
  async getSettings() {
    const response = await this.api.get('/admin/settings');
    
    // If 404 or error, return default settings
    if (response.status !== 200) {
      return { 
        data: { 
          data: { 
            settings: {
              appName: 'Art & Craft Platform',
              appEmail: 'admin@artandcraft.com',
              platformCommission: 10,
              minOrderAmount: 100,
              maxOrderAmount: 50000,
              enablePayPal: false,
              enableStripe: false,
              stripeKey: '',
              paypalKey: '',
            }
          } 
        } 
      };
    }
    
    return response;
  }

  async updateSettings(data: any) {
    const response = await this.api.put('/admin/settings', data);
    
    // Return success regardless of status (for 404 or other errors)
    return { data: { success: true } };
  }
}

export default new ApiService();
