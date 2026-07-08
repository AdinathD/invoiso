import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export interface SalesAnalytics {
  summary: {
    totalRevenue: number;
    totalTaxable: number;
    totalTax: number;
    totalInvoices: number;
    averageOrderValue: number;
  };
  salesTrend: Array<{
    date: string;
    revenue: number;
    tax: number;
    count: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    mobile: string;
    revenue: number;
    count: number;
  }>;
  locations: {
    states: Array<{ name: string; value: number }>;
    cities: Array<{ name: string; value: number }>;
  };
}

export interface StockAnalytics {
  summary: {
    totalProducts: number;
    totalStockValue: number;
    totalItemsCount: number;
    outOfStockCount: number;
    lowStockCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    price: number;
    category: string;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    count: number;
    itemsCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export async function fetchSalesAnalytics(timeframe?: string): Promise<SalesAnalytics> {
  const res = await axios.get(`${BACKEND_URL}/api/analytics/sales`, {
    params: { timeframe }
  });
  return res.data;
}

export async function fetchStockAnalytics(): Promise<StockAnalytics> {
  const res = await axios.get(`${BACKEND_URL}/api/analytics/stock`);
  return res.data;
}
