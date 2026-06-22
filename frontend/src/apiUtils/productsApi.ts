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
  const res = await fetch(`${BACKEND_URL}/api/products`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  
  return data.map((p: any) => ({
    ...p,
    price: Number(p.price) || 0,
    gstPercent: Number(p.gstPercent) || 0,
    stock: Number(p.stock) || 0,
    defaultWeight: p.defaultWeight ? Number(p.defaultWeight) : undefined
  }));
}
