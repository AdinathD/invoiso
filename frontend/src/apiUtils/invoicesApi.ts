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
