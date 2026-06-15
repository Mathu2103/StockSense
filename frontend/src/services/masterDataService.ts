import { api } from './axiosInstance';

export const MasterDataService = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  createCategory: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  createSubCategory: async (data: any) => {
    const response = await api.post('/categories/subcategories', data);
    return response.data;
  },
  updateSubCategory: async (id: string, data: any) => {
    const response = await api.put(`/categories/subcategories/${id}`, data);
    return response.data;
  },

  // Brands
  getBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },
  createBrand: async (data: any) => {
    const response = await api.post('/brands', data);
    return response.data;
  },
  updateBrand: async (id: string, data: any) => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },

  // Suppliers
  getSuppliers: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },
  createSupplier: async (data: any) => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },
  updateSupplier: async (id: string, data: any) => {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },
  deleteSupplier: async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  createProduct: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  updateProduct: async (sku: string, data: any) => {
    const response = await api.put(`/products/${sku}`, data);
    return response.data;
  }
};
