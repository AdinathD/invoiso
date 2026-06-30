import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export interface Customer {
  id: string;
  name: string;
  mobileNo?: string | null;
  remarks?: string | null;
  balance?: string | null;
  pan?: string | null;
  gstType?: string | null;
  gstin?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  billTo?: string | null;
}

export interface InvoiceItem {
  id: string;
  srNo: number;
  name: string;
  hsn: string;
  quantity: number;
  uom: string;
  price: number;
  netWt: number;
  rate: number;
  netRate: number;
  gstPercent: number;
  net: number;
}

export interface InvoiceHistory {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  netTotal: number;
  taxableAmount: number;
  taxAmount: number;
  createdAt: string;
  items?: InvoiceItem[];
}

export interface CustomerWithInvoices extends Customer {
  invoices: InvoiceHistory[];
}

export async function fetchCustomers(name?: string): Promise<Customer[]> {
  const res = await axios.get(`${BACKEND_URL}/api/customers`, {
    params: name ? { name } : undefined
  });
  return res.data;
}

export async function fetchCustomerDetails(id: string): Promise<CustomerWithInvoices> {
  const res = await axios.get(`${BACKEND_URL}/api/customers/${id}`);
  return res.data;
}

