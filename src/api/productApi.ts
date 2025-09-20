// api/product.ts
import { get, post, put, del } from '../utils/axios';
// types/products.ts
export interface Products {
  productId?: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// 新建产品
export const createProduct = (data: Products) => {
  return post('/products/create', data);
};

// 获取单个产品
export const getProductById = (id: number) => {
  return get(`/products/${id}`);
};

// 获取全部产品
export const getAllProducts = () => {
  return get('/products/all');
};

// 按分类获取
export const getProductsByCategory = (categoryId: number) => {
  return get(`/products/category/${categoryId}`);
};

// 更新产品信息
export const updateProduct = (data: Products) => {
  return put('/products/update', data);
};

// 更新库存
export const updateStock = (id: number, stock: number) => {
  return put(`/products/stock/${id}?stock=${stock}`);
};

// 更新状态（如上架/下架）
export const updateStatus = (id: number, status: string) => {
  return put(`/products/status/${id}?status=${status}`);
};

// 删除单个产品
export const deleteProduct = (id: number) => {
  return del(`/products/${id}`);
};
