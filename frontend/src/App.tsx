import { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import InvoicePage from './invoice/InvoicePage';
import WholesalePOSPage from './pos/WholesalePOSPage';
import InvoicesListPage from './invoice/InvoicesListPage';
import AnalyticsDashboardPage from './AnalyticsDashboardPage';
import type { MasterForm } from './sidebar';

const INITIAL_FORM: MasterForm = {
  name: '',
  mobileNo: '',
  remarks: '',
  invoiceNo: 'NHW-2627-0001',
  invoiceDate: new Date().toISOString().split('T')[0],
  balance: '',
  pan: '',
  gst: '',
  gstType: 'CGST/SGST',
  city: '',
  state: '',
  country: '',
  billTo: '',
  customerId: ''
};

export default function App() {
  const [form, setForm] = useState<MasterForm>(INITIAL_FORM);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <InvoicePage
              form={form}
              setForm={setForm}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/pos"
          element={
            <WholesalePOSPage
              form={form}
              setForm={setForm}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/invoices"
          element={
            <InvoicesListPage
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <AnalyticsDashboardPage
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          }
        />
      </Routes>
    </Router>
  );
}

