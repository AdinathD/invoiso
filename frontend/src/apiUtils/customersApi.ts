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

export async function fetchCustomers(name?: string): Promise<Customer[]> {
  const res = await axios.get(`${BACKEND_URL}/api/customers`, {
    params: name ? { name } : undefined
  });
  return res.data;
}
