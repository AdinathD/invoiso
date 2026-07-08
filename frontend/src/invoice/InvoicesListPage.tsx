import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, ArrowLeft, RefreshCw, X, Receipt, ShoppingBag, Eye, CreditCard } from 'lucide-react';
import { fetchInvoices } from '../apiUtils/invoicesApi';
import { PrintInvoiceModal } from '../print/PrintInvoiceModal';


interface InvoicesListPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface InvoiceItem {
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

interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerMobile?: string;
  remarks?: string;
  balance?: string;
  pan?: string;
  gstin?: string;
  gstType?: string;
  city?: string;
  state?: string;
  country?: string;
  billTo?: string;
  hamali: number;
  freight: number;
  taxableAmount: number;
  taxAmount: number;
  netTotal: number;
  items: InvoiceItem[];
}

export default function InvoicesListPage({ darkMode, toggleDarkMode }: InvoicesListPageProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);


  // Load Invoices
  const loadInvoices = async (dateStr?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvoices(dateStr || undefined);
      setInvoices(data);
    } catch (err: any) {
      console.error('Error loading invoices:', err);
      setError('Failed to fetch invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices(selectedDate);
  }, [selectedDate]);

  // Dynamic filter for search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(query) ||
        inv.customerName.toLowerCase().includes(query) ||
        (inv.customerMobile && inv.customerMobile.includes(query))
    );
  }, [invoices, searchQuery]);

  // Statistics calculations
  const stats = useMemo(() => {
    let totalNet = 0;
    let totalTax = 0;
    let totalTaxable = 0;
    filteredInvoices.forEach((inv) => {
      totalNet += Number(inv.netTotal || 0);
      totalTax += Number(inv.taxAmount || 0);
      totalTaxable += Number(inv.taxableAmount || 0);
    });

    return {
      count: filteredInvoices.length,
      net: totalNet,
      tax: totalTax,
      taxable: totalTaxable,
      average: filteredInvoices.length ? totalNet / filteredInvoices.length : 0,
    };
  }, [filteredInvoices]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  return (
    <div className="flex-1 min-w-0 p-4 transition-all duration-300 ease-in-out w-full min-h-screen bg-panel-bg text-text-main flex flex-col">
      {/* Header bar */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 py-2 border-b border-border-sec mb-4 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 hover:bg-border-acc/25 rounded-md text-text-acc transition-colors cursor-pointer"
            title="Back to Invoice Editor"
          >
            <ArrowLeft size={18} />
          </Link>
          <Receipt size={20} className="text-text-acc" />
          <div>
            <h1 className="text-app-lg font-extrabold tracking-wide text-text-main flex items-center gap-2 leading-none">
              Invoiso.ai
            </h1>
            <span className="text-[11px] text-text-mute font-bold tracking-wide uppercase">Invoice Ledger</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
          <Link
            to="/"
            className="px-3 py-1.5 bg-border-acc/20 hover:bg-border-acc/35 text-text-acc text-app-xs font-bold rounded border border-border-acc/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            ➕ New Invoice
          </Link>
          <Link
            to="/analytics"
            className="px-3 py-1.5 bg-border-acc/20 hover:bg-border-acc/35 text-text-acc text-app-xs font-bold rounded border border-border-acc/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            📊 Analytics
          </Link>
          <button
            className="px-3 py-1.5 rounded text-app-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-border-sec bg-text-main text-panel-bg hover:opacity-90"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => loadInvoices(selectedDate)}
            className="p-1.5 border border-border-sec hover:bg-border-acc/10 rounded text-text-mute hover:text-text-main transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Filter and stats Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Filters */}
        <div className="lg:col-span-1 bg-app-bg/50 border border-border-sec/80 rounded-xl p-4 flex flex-col gap-3.5 shadow-sm">
          <h2 className="text-app-sm font-black text-text-acc tracking-wider uppercase mb-1">Filters</h2>

          {/* Date Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-app-xs font-bold text-text-mute">Filter by Date</label>
            <div className="relative flex items-center">
              <Calendar size={15} className="absolute left-2.5 text-text-mute pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full pl-9 pr-8 py-1.5 text-app-sm bg-panel-bg border border-border-sec rounded-md focus:outline-none focus:border-text-acc transition-colors cursor-pointer"
              />
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-2 p-0.5 text-text-mute hover:text-alert rounded hover:bg-border-sec/45 transition-colors cursor-pointer"
                  title="Clear Date"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Text Search */}
          <div className="flex flex-col gap-1">
            <label className="text-app-xs font-bold text-text-mute">Search Invoice / Customer</label>
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-2.5 text-text-mute pointer-events-none" />
              <input
                type="text"
                placeholder="Search invoice no, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-app-sm bg-panel-bg border border-border-sec rounded-md focus:outline-none focus:border-text-acc transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-app-bg/30 border border-border-sec/60 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-acc/45 transition-all">
            <span className="text-app-xs font-black text-text-mute uppercase tracking-wider">Total Invoices</span>
            <span className="text-app-2xl font-black text-text-acc mt-2 z-10">{stats.count}</span>
            <div className="absolute right-2 bottom-2 text-text-mute/5 pointer-events-none group-hover:scale-110 transition-transform">
              <Receipt size={64} />
            </div>
          </div>

          <div className="bg-app-bg/30 border border-border-sec/60 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-acc/45 transition-all">
            <span className="text-app-xs font-black text-text-mute uppercase tracking-wider">Taxable Amount</span>
            <span className="text-app-lg font-black text-text-main mt-2 z-10">₹{stats.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="absolute right-2 bottom-2 text-text-mute/5 pointer-events-none group-hover:scale-110 transition-transform">
              <ShoppingBag size={64} />
            </div>
          </div>

          <div className="bg-app-bg/30 border border-border-sec/60 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-acc/45 transition-all">
            <span className="text-app-xs font-black text-text-mute uppercase tracking-wider">Tax Amount</span>
            <span className="text-app-lg font-black text-text-main mt-2 z-10">₹{stats.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="absolute right-2 bottom-2 text-text-mute/5 pointer-events-none group-hover:scale-110 transition-transform">
              <CreditCard size={64} />
            </div>
          </div>

          <div className="bg-app-bg/30 border border-border-sec/60 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border-acc/45 transition-all">
            <span className="text-app-xs font-black text-text-mute uppercase tracking-wider">Net Revenue</span>
            <span className="text-app-lg font-black text-text-acc mt-2 z-10">₹{stats.net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="absolute right-2 bottom-2 text-text-mute/5 pointer-events-none group-hover:scale-110 transition-transform">
              <span className="text-app-3xl select-none">💸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table area */}
      <div className="flex-1 bg-app-bg/40 border border-border-sec rounded-xl shadow-md overflow-hidden flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
            <RefreshCw size={24} className="text-text-acc animate-spin" />
            <span className="text-app-base text-text-mute font-medium">Fetching invoices from server...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-alert">
            <span className="text-app-xl">⚠️</span>
            <p className="font-bold">{error}</p>
            <button
              onClick={() => loadInvoices(selectedDate)}
              className="mt-2 px-3.5 py-1.5 bg-alert/15 text-alert border border-alert/35 hover:bg-alert/25 rounded-md font-bold text-app-xs transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-text-mute text-center">
            <span className="text-app-3xl">📭</span>
            <h3 className="text-app-base font-extrabold text-text-main">No Invoices Found</h3>
            <p className="text-app-xs max-w-sm">
              {selectedDate
                ? `No invoices recorded on ${new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}.`
                : 'There are no invoices matching your search parameters or date filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left text-app-sm">
              <thead className="sticky top-0 bg-panel-bg z-15 border-b border-border-sec text-text-mute uppercase tracking-wider font-extrabold text-app-xs">
                <tr>
                  <th className="px-4 py-3">Inv. Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Taxable Amt</th>
                  <th className="px-4 py-3 text-right">Tax Amt</th>
                  <th className="px-4 py-3 text-right">Net Total</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-sec/30">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-border-acc/5 transition-colors cursor-pointer group"
                    onClick={() => setActiveInvoice(inv)}
                  >
                    <td className="px-4 py-2.5 font-bold text-text-acc">{inv.invoiceNo}</td>
                    <td className="px-4 py-2.5 text-text-mute">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-text-main">{inv.customerName}</div>
                      {inv.customerMobile && (
                        <div className="text-[11px] text-text-mute">{inv.customerMobile}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-text-mute">{inv.items?.length || 0}</td>
                    <td className="px-4 py-2.5 text-right font-medium">₹{Number(inv.taxableAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">₹{Number(inv.taxAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-black text-text-acc">₹{Number(inv.netTotal || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInvoice(inv);
                        }}
                        className="p-1 hover:bg-border-acc/25 rounded-md text-text-acc hover:text-text-main transition-all cursor-pointer flex items-center gap-1 text-app-xs mx-auto font-bold"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-4xl bg-panel-bg border border-border-sec rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-sec bg-app-bg/30">
              <div className="flex items-center gap-2">
                <Receipt className="text-text-acc" size={18} />
                <span className="font-black text-app-base">Invoice Details: {activeInvoice.invoiceNo}</span>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="p-1 rounded-md text-text-mute hover:bg-border-sec/80 hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-app-bg/20 p-4 border border-border-sec/50 rounded-lg">
                <div>
                  <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">Customer Name</label>
                  <p className="font-bold text-app-sm">{activeInvoice.customerName}</p>
                </div>
                <div>
                  <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">Mobile Number</label>
                  <p className="font-bold text-app-sm">{activeInvoice.customerMobile || '-'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">Date</label>
                  <p className="font-bold text-app-sm">
                    {new Date(activeInvoice.invoiceDate).toLocaleDateString('en-IN', {
                      dateStyle: 'long',
                    })}
                  </p>
                </div>
                {activeInvoice.gstin && (
                  <div>
                    <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">GSTIN ({activeInvoice.gstType})</label>
                    <p className="font-bold text-app-sm uppercase text-text-acc">{activeInvoice.gstin}</p>
                  </div>
                )}
                {activeInvoice.city && (
                  <div>
                    <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">Location</label>
                    <p className="font-bold text-app-sm">
                      {[activeInvoice.city, activeInvoice.state, activeInvoice.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {activeInvoice.pan && (
                  <div>
                    <label className="text-[10px] text-text-mute font-black uppercase tracking-wider">PAN</label>
                    <p className="font-bold text-app-sm uppercase">{activeInvoice.pan}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-app-xs font-black uppercase tracking-wider text-text-acc mb-2">Invoice Items</h3>
                <div className="border border-border-sec/80 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-app-xs">
                    <thead className="bg-app-bg/60 border-b border-border-sec/80 text-text-mute font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-center w-12">Sr</th>
                        <th className="px-3 py-2">Product Name</th>
                        <th className="px-3 py-2">HSN</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-center">UOM</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">GST %</th>
                        <th className="px-3 py-2 text-right">Net Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-sec/20">
                      {activeInvoice.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-border-sec/10 transition-colors">
                          <td className="px-3 py-2 text-center text-text-mute">{item.srNo}</td>
                          <td className="px-3 py-2 font-bold text-text-main">{item.name}</td>
                          <td className="px-3 py-2 text-text-mute">{item.hsn}</td>
                          <td className="px-3 py-2 text-right font-medium">{Number(item.quantity).toFixed(3)}</td>
                          <td className="px-3 py-2 text-center text-text-mute font-medium">{item.uom}</td>
                          <td className="px-3 py-2 text-right font-medium">₹{Number(item.rate).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-text-mute font-medium">{Number(item.gstPercent).toFixed(2)}%</td>
                          <td className="px-3 py-2 text-right font-bold text-text-acc">₹{Number(item.net).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-4 pt-3 border-t border-border-sec">
                {/* Remarks & Extra Fields */}
                <div className="flex-1 w-full flex flex-col gap-2">
                  {activeInvoice.remarks && (
                    <div className="bg-app-bg/10 p-3 rounded border border-border-sec/30 text-app-xs">
                      <strong className="text-text-mute block mb-1">Remarks:</strong>
                      <span className="italic">{activeInvoice.remarks}</span>
                    </div>
                  )}
                  {activeInvoice.billTo && (
                    <div className="bg-app-bg/10 p-3 rounded border border-border-sec/30 text-app-xs">
                      <strong className="text-text-mute block mb-1">Billing Info:</strong>
                      <span>{activeInvoice.billTo}</span>
                    </div>
                  )}
                </div>

                {/* Final amounts */}
                <div className="w-full md:w-80 flex flex-col gap-1.5 text-app-sm border border-border-sec/70 rounded-lg p-4 bg-app-bg/40">
                  <div className="flex justify-between">
                    <span className="text-text-mute">Taxable Amount:</span>
                    <span className="font-semibold">₹{Number(activeInvoice.taxableAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-mute">Tax (GST):</span>
                    <span className="font-semibold">₹{Number(activeInvoice.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  {Number(activeInvoice.hamali) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-mute">Hamali:</span>
                      <span className="font-semibold text-alert">₹{Number(activeInvoice.hamali).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(activeInvoice.freight) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-mute">Freight:</span>
                      <span className="font-semibold text-alert">₹{Number(activeInvoice.freight).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border-sec/60 pt-2 text-app-base">
                    <span className="font-black text-text-acc">Net Total:</span>
                    <span className="font-black text-text-acc">₹{Number(activeInvoice.netTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-border-sec bg-app-bg/30 flex justify-end gap-3 text-right">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-1.5 bg-border-acc hover:bg-action-hover text-white font-extrabold rounded text-app-xs transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-1.5 bg-text-main text-panel-bg font-extrabold rounded text-app-xs transition-opacity hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrintModalOpen && activeInvoice && (
        <PrintInvoiceModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          form={{
            name: activeInvoice.customerName || '',
            mobileNo: activeInvoice.customerMobile || '',
            remarks: activeInvoice.remarks || '',
            invoiceNo: activeInvoice.invoiceNo,
            invoiceDate: activeInvoice.invoiceDate ? new Date(activeInvoice.invoiceDate).toISOString().split('T')[0] : '',
            balance: activeInvoice.balance || '',
            pan: activeInvoice.pan || '',
            gst: activeInvoice.gstin || '',
            gstType: activeInvoice.gstType || 'CGST/SGST',
            city: activeInvoice.city || '',
            state: activeInvoice.state || '',
            country: activeInvoice.country || '',
            billTo: activeInvoice.billTo || '',
            customerId: ''
          }}
          items={activeInvoice.items.map(item => ({
            srNo: item.srNo,
            id: item.id,
            name: item.name,
            hsn: item.hsn,
            quantity: Number(item.quantity),
            uom: item.uom,
            price: Number(item.price),
            netWt: Number(item.netWt || 0),
            rate: Number(item.rate),
            netRate: Number(item.netRate || item.rate),
            gstPercent: Number(item.gstPercent),
            net: Number(item.net)
          }))}
          totals={{
            itemsCount: activeInvoice.items?.length || 0,
            weightSum: activeInvoice.items?.reduce((sum, item) => sum + Number(item.netWt || 0), 0).toFixed(2),
            quantitySum: activeInvoice.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toFixed(2),
            taxableAmount: Number(activeInvoice.taxableAmount || 0).toFixed(2),
            taxAmount: Number(activeInvoice.taxAmount || 0).toFixed(2),
            netTotal: Number(activeInvoice.netTotal || 0).toFixed(2)
          }}
          hamali={String(activeInvoice.hamali || '0.00')}
          freight={String(activeInvoice.freight || '0.00')}
          discPercent="0.00"
          salesman="-- Select --"
          vehicleNo=""
          transport=""
          roundOff="0.00"
          note={activeInvoice.remarks || ''}
        />
      )}
    </div>
  );
}

