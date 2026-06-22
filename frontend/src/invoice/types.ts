export interface Product {
  id: string;
  name: string;
  hsn: string;
  price: number;
  gstPercent: number;
  uom: string;
  stock: number;
  category: string;
  defaultWeight?: number;
}

export interface ColumnConfig {
  showHSN: boolean;
  showUOM: boolean;
  showPrice: boolean;
  showNetWeight: boolean;
  showNetRate: boolean;
  showRate: boolean;
  showGST: boolean;
}

export interface TableItem {
  srNo: number;
  id: string;
  name: string;
  hsn: string;
  quantity: number;
  uom: string;
  price: number; // Price with GST
  netWt: number;
  netRate: number;
  rate: number;
  gstPercent: number;
  net: number;
}
