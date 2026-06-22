export interface POSProduct {
  id: string;
  name: string;
  hsn: string;
  price: number;
  gstPercent: number;
  stock: number;
  uom: string;
  category: string;
}

export interface CartItem {
  product: POSProduct;
  quantity: number;
}
