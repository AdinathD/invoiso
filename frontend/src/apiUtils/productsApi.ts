import axios from 'axios';

export interface ApiProduct {
  id: string;
  name: string;
  hsn: string;
  price: number;
  gstPercent: number;
  stock: number;
  uom: string;
  category: string;
  defaultWeight?: number;
}

const BACKEND_URL = 'http://localhost:5000';

export async function fetchProducts(): Promise<ApiProduct[]> {
  const response = await axios.get(`${BACKEND_URL}/api/products`);
  const data = response.data;
  
  return data.map((p: any) => ({
    ...p,
    price: Number(p.price) || 0,
    gstPercent: Number(p.gstPercent) || 0,
    stock: Number(p.stock) || 0,
    defaultWeight: p.defaultWeight ? Number(p.defaultWeight) : undefined
  }));
}

export interface AddProductInput {
  name: string;
  hsn: string;
  price: number;
  gstPercent: number;
  stock: number;
  uom: string;
  category: string;
  defaultWeight?: number;
}

export async function addProduct(product: AddProductInput): Promise<ApiProduct> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/products`, product);
    const data = response.data;
    return {
      ...data,
      price: Number(data.price) || 0,
      gstPercent: Number(data.gstPercent) || 0,
      stock: Number(data.stock) || 0,
      defaultWeight: data.defaultWeight ? Number(data.defaultWeight) : undefined
    };
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to add product';
    throw new Error(message);
  }
}
