import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export async function createInvoice(data: any) {
  const res = await axios.post(
    `${BACKEND_URL}/api/invoices`,
    data
  );

  return res.data;
}

export async function fetchNextInvoiceNumber(): Promise<string> {
  const res = await axios.get(`${BACKEND_URL}/api/invoices/next-number`);
  return res.data.nextInvoiceNo;
}

export async function fetchInvoices(date?: string): Promise<any[]> {
  const url = date 
    ? `${BACKEND_URL}/api/invoices?date=${encodeURIComponent(date)}`
    : `${BACKEND_URL}/api/invoices`;
  const res = await axios.get(url);
  return res.data;
}

