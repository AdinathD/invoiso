import React from 'react';
import { User, Phone, Clipboard, Menu, X, Settings, History, ChevronDown, ChevronUp } from 'lucide-react';
import { handleEnterTraversal } from './keyboardUtils.ts';
import type { ColumnConfig } from './invoice/types';
import { fetchCustomers, fetchCustomerDetails } from './apiUtils/customersApi';
import type { Customer, CustomerWithInvoices } from './apiUtils/customersApi';

export interface MasterForm {
  name: string;
  mobileNo: string;
  remarks: string;
  invoiceNo: string;
  invoiceDate: string;
  balance: string;
  pan: string;
  gst: string;
  gstType: string;
  city: string;
  state: string;
  country: string;
  billTo: string;
  customerId?: string;
}

interface MasterHeaderProps {
  form: MasterForm;
  onChange: (updated: MasterForm) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  columnConfig: ColumnConfig;
  toggleColumn: (key: keyof ColumnConfig) => void;
  resetColumnConfig: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  form,
  sidebarOpen,
  onToggleSidebar,
  columnConfig,
  toggleColumn,
  resetColumnConfig
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [customerHistory, setCustomerHistory] = React.useState<CustomerWithInvoices | null>(null);
  const [historyError, setHistoryError] = React.useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<string | null>(null);

  const handleOpenHistory = async () => {
    if (!form.customerId) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const details = await fetchCustomerDetails(form.customerId);
      setCustomerHistory(details);
    } catch (err: any) {
      console.error(err);
      setHistoryError(err.message || 'Failed to load customer history');
    } finally {
      setHistoryLoading(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="border border-border-acc rounded p-2 mb-2 transition-colors duration-150 relative flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-panel-bg text-text-main">

      {/* Left Side: Hamburger Icon & Title & Settings Dropdown */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            aria-expanded={sidebarOpen}
            aria-controls="invoice-sidebar"
            className="p-1.5 rounded-md hover:bg-border-acc/10 active:bg-border-acc/25 transition-colors cursor-pointer text-text-acc focus:outline-none"
            title="Open Details Menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-app-md font-bold text-text-main">
              Add Invoice - Wholesale Credit
            </span>

            {/* Columns Config Settings Button & Popover */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-app-bg hover:bg-border-sec/30 text-text-sec hover:text-text-main border border-border-sec rounded text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                title="Configure Columns"
              >
                <Settings size={11} className={dropdownOpen ? 'animate-spin' : ''} />
                <span>Columns</span>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-panel-bg border border-border-sec rounded shadow-xl p-2.5 z-50 animate-fade-in text-text-main">
                  <h4 className="text-[10px] font-black tracking-wider uppercase text-text-mute border-b border-border-main pb-1 mb-1.5">
                    Toggle Columns
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showHSN}
                        onChange={() => toggleColumn('showHSN')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>HSN</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showUOM}
                        onChange={() => toggleColumn('showUOM')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>UOM</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showPrice}
                        onChange={() => toggleColumn('showPrice')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>Price (+GST)</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showNetWeight}
                        onChange={() => toggleColumn('showNetWeight')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>Net Weight</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showNetRate}
                        onChange={() => toggleColumn('showNetRate')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>Net Rate</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showRate}
                        onChange={() => toggleColumn('showRate')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>Rate</span>
                    </label>
                    <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/50 px-1 py-0.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={columnConfig.showGST}
                        onChange={() => toggleColumn('showGST')}
                        className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                      />
                      <span>GST %</span>
                    </label>
                  </div>
                  <div className="border-t border-border-main mt-2 pt-1.5 flex justify-end">
                    <button
                      onClick={resetColumnConfig}
                      className="px-1.5 py-0.5 bg-alert/10 hover:bg-alert/20 text-alert text-[8px] font-bold rounded cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <span className="text-app-xs text-text-acc font-bold">
            Click menu on left to edit fields
          </span>
        </div>
      </div>

      {/* Right Side: Inputted Name from Hamburger Menu */}
      <div className="flex flex-wrap items-center gap-3 bg-emerald-light border border-border-acc-light rounded px-2.5 py-1 self-start sm:self-auto">
        <div className="flex items-center gap-1">
          <User size={12} className="text-text-acc" />
          <span className="text-app-sm font-medium text-text-mute">Customer:</span>
          <span className="text-app-base font-extrabold text-text-acc truncate max-w-[150px]">
            {form.name || "(No Name)"}
          </span>
        </div>
        {form.mobileNo && (
          <div className="flex items-center gap-1 border-l border-border-acc-light/35 pl-3">
            <span className="text-app-sm font-medium text-text-mute">Mob:</span>
            <span className="text-app-base font-extrabold text-text-acc">
              {form.mobileNo}
            </span>
          </div>
        )}
        {form.gst && (
          <div className="flex items-center gap-1 border-l border-border-acc-light/35 pl-3">
            <span className="text-app-sm font-medium text-text-mute">GST:</span>
            <span className="text-app-base font-extrabold text-text-acc">
              {form.gst}
            </span>
          </div>
        )}
        {form.customerId && (
          <button
            onClick={handleOpenHistory}
            className="flex items-center gap-1 ml-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold transition-all shadow-sm cursor-pointer"
            title="View customer invoice history"
          >
            <History size={11} />
            <span>History</span>
          </button>
        )}
      </div>

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 text-text-main">
          <div
            className="w-full max-w-3xl bg-panel-bg border border-border-sec rounded-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border-sec bg-border-sec/10">
              <div className="flex items-center gap-2">
                <History size={18} className="text-text-acc" />
                <h2 className="text-app-lg font-bold text-text-main">
                  Customer Invoice History
                </h2>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-md text-text-mute hover:bg-border-sec hover:text-text-main transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-acc"></div>
                  <p className="text-app-sm text-text-mute">Loading invoice history...</p>
                </div>
              ) : historyError ? (
                <div className="p-4 text-app-sm text-alert bg-alert/10 border border-alert/20 rounded-lg">
                  ⚠️ {historyError}
                </div>
              ) : customerHistory ? (
                <div className="space-y-4">
                  {/* Customer Info Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-app-bg/50 p-4 rounded-lg border border-border-sec/40">
                    <div>
                      <h3 className="text-app-base font-extrabold text-text-acc">{customerHistory.name}</h3>
                      <p className="text-app-sm text-text-mute">Mobile: {customerHistory.mobileNo || 'N/A'}</p>
                      <p className="text-app-sm text-text-mute">GSTIN: {customerHistory.gstin || 'N/A'} ({customerHistory.gstType || 'N/A'})</p>
                    </div>
                    <div>
                      <p className="text-app-sm text-text-mute">City/State: {customerHistory.city || 'N/A'}, {customerHistory.state || 'N/A'}</p>
                      <p className="text-app-sm text-text-mute">Address: {customerHistory.billTo || 'N/A'}</p>
                      <p className="text-app-sm text-text-mute font-semibold">Balance: {customerHistory.balance || '0.00'}</p>
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div>
                    <h4 className="text-app-sm font-bold text-text-main mb-2">Invoices ({customerHistory.invoices.length})</h4>
                    {customerHistory.invoices.length === 0 ? (
                      <div className="text-center py-8 bg-app-bg/30 rounded-lg border border-dashed border-border-sec/40 text-text-mute text-app-sm">
                        No invoice history found for this customer.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-border-sec rounded-lg">
                        <table className="w-full text-left border-collapse text-app-sm">
                          <thead>
                            <tr className="bg-app-bg border-b border-border-sec font-bold text-text-sec">
                              <th className="p-2.5">Invoice No</th>
                              <th className="p-2.5">Date</th>
                              <th className="p-2.5 text-right">Taxable Amt</th>
                              <th className="p-2.5 text-right">Tax Amt</th>
                              <th className="p-2.5 text-right">Net Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-sec/40">
                            {customerHistory.invoices.map((inv) => {
                              const isExpanded = expandedInvoiceId === inv.id;
                              return (
                                <React.Fragment key={inv.id}>
                                  <tr
                                    onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                                    className="hover:bg-app-bg/30 cursor-pointer transition-colors"
                                  >
                                    <td className="p-2.5 font-bold text-text-acc flex items-center gap-1.5">
                                      {isExpanded ? <ChevronUp size={14} className="text-text-acc" /> : <ChevronDown size={14} className="text-text-mute" />}
                                      <span>{inv.invoiceNo}</span>
                                    </td>
                                    <td className="p-2.5 text-text-mute">
                                      {new Date(inv.invoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-2.5 text-right font-mono">₹{Number(inv.taxableAmount).toFixed(2)}</td>
                                    <td className="p-2.5 text-right font-mono">₹{Number(inv.taxAmount).toFixed(2)}</td>
                                    <td className="p-2.5 text-right font-bold font-mono text-emerald-500">₹{Number(inv.netTotal).toFixed(2)}</td>
                                  </tr>
                                  {isExpanded && (
                                    <tr className="bg-app-bg/50">
                                      <td colSpan={5} className="p-3">
                                        <div className="bg-panel-bg border border-border-sec/80 rounded-lg p-3 shadow-inner space-y-2">
                                          <h5 className="text-xs font-extrabold uppercase text-text-acc tracking-wider flex items-center gap-1.5 border-b border-border-sec pb-1.5">
                                            <span>📦 Invoice Items</span>
                                            <span className="text-[10px] text-text-mute normal-case font-normal">(Invoice: {inv.invoiceNo})</span>
                                          </h5>
                                          {!inv.items || inv.items.length === 0 ? (
                                            <p className="text-xs text-text-mute">No items found for this invoice.</p>
                                          ) : (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                  <tr className="border-b border-border-sec/60 text-text-sec font-bold">
                                                    <th className="py-1 px-2 text-center w-8">#</th>
                                                    <th className="py-1 px-2">Item Name</th>
                                                    <th className="py-1 px-2">HSN</th>
                                                    <th className="py-1 px-2 text-right">Qty</th>
                                                    <th className="py-1 px-2 text-center">UOM</th>
                                                    <th className="py-1 px-2 text-right">Price</th>
                                                    <th className="py-1 px-2 text-right">Net Wt</th>
                                                    <th className="py-1 px-2 text-right">GST %</th>
                                                    <th className="py-1 px-2 text-right font-semibold">Net</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-sec/30">
                                                  {inv.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-app-bg/20">
                                                      <td className="py-1.5 px-2 text-center text-text-mute">{item.srNo}</td>
                                                      <td className="py-1.5 px-2 font-medium text-text-main">{item.name}</td>
                                                      <td className="py-1.5 px-2 text-text-mute font-mono">{item.hsn}</td>
                                                      <td className="py-1.5 px-2 text-right font-mono">{Number(item.quantity).toFixed(2)}</td>
                                                      <td className="py-1.5 px-2 text-center text-text-mute">{item.uom}</td>
                                                      <td className="py-1.5 px-2 text-right font-mono">₹{Number(item.price).toFixed(2)}</td>
                                                      <td className="py-1.5 px-2 text-right font-mono">{Number(item.netWt).toFixed(2)}</td>
                                                      <td className="py-1.5 px-2 text-right font-mono">{Number(item.gstPercent).toFixed(2)}%</td>
                                                      <td className="py-1.5 px-2 text-right font-bold font-mono text-emerald-500">₹{Number(item.net).toFixed(2)}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-3 border-t border-border-sec bg-border-sec/10">
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-4 py-1.5 bg-border-sec hover:bg-border-sec/80 text-text-main text-app-base font-bold rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


interface InvoiceSidebarProps {
  form: MasterForm;
  onChange: (updated: MasterForm) => void;
  isOpen: boolean;
  onClose: () => void;
  onBillToEnter: () => void;
}

export const InvoiceSidebar: React.FC<InvoiceSidebarProps> = ({ form, onChange, isOpen, onClose, onBillToEnter }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const listboxRef = React.useRef<HTMLDivElement>(null);

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [showCustDropdown, setShowCustDropdown] = React.useState(false);
  const [activeCustIdx, setActiveCustIdx] = React.useState(-1);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    setActiveCustIdx(-1);
  }, [showCustDropdown, form.name]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isNameInput = target === nameInputRef.current;

    if (e.key === 'Escape') {
      if (showCustDropdown) {
        e.stopPropagation();
        setShowCustDropdown(false);
      }
      return;
    }

    if (isNameInput) {
      if (e.key === 'ArrowDown' && showCustDropdown && customers.length > 0) {
        e.preventDefault();
        setActiveCustIdx(prev => {
          const next = prev + 1 >= customers.length ? 0 : prev + 1;
          const itemEl = listboxRef.current?.children[next] as HTMLElement;
          itemEl?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        return;
      }
      if (e.key === 'ArrowUp' && showCustDropdown && customers.length > 0) {
        e.preventDefault();
        setActiveCustIdx(prev => {
          const next = prev - 1 < 0 ? customers.length - 1 : prev - 1;
          const itemEl = listboxRef.current?.children[next] as HTMLElement;
          itemEl?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        return;
      }
      if (e.key === 'Enter') {
        if (showCustDropdown && activeCustIdx >= 0 && activeCustIdx < customers.length) {
          e.preventDefault();
          handleSelectCustomer(customers[activeCustIdx]);
          setActiveCustIdx(-1);
          // Focus the mobile number input
          setTimeout(() => {
            const mobileInput = containerRef.current?.querySelector('input[placeholder="Mobile No"]') as HTMLInputElement;
            mobileInput?.focus();
          }, 0);
          return;
        }
      }
    }

    if (target instanceof HTMLInputElement && target.placeholder === "Enter Billing Name / Company" && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!form.name.trim()) {
        alert("Please fill in the Customer Name before proceeding.");
        nameInputRef.current?.focus();
      } else {
        onBillToEnter();
      }
      return;
    }
    handleEnterTraversal(e, containerRef.current);
  };

  const handleFieldChange = (key: keyof MasterForm, value: string) => {
    onChange({
      ...form,
      [key]: value
    });
  };

  const handleNameChange = async (value: string) => {
    handleFieldChange('name', value);
    onChange({
      ...form,
      name: value,
      customerId: '' // Reset customerId when manual typing occurs
    });

    if (value.trim().length > 0) {
      try {
        const results = await fetchCustomers(value);
        setCustomers(results);
        setShowCustDropdown(results.length > 0);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    } else {
      setCustomers([]);
      setShowCustDropdown(false);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    onChange({
      ...form,
      name: cust.name,
      mobileNo: cust.mobileNo || '',
      remarks: cust.remarks || '',
      balance: cust.balance || '',
      pan: cust.pan || '',
      gst: cust.gstin || '',
      gstType: cust.gstType || 'CGST/SGST',
      city: cust.city || '',
      state: cust.state || '',
      country: cust.country || '',
      billTo: cust.billTo || '',
      customerId: cust.id
    });
    setShowCustDropdown(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <div
        id="invoice-sidebar"
        role="dialog"
        aria-modal="false"
        aria-label="Invoice Details"
        className={`fixed md:sticky top-0 bottom-0 left-0 h-screen flex flex-col z-50 md:z-30 bg-panel-bg text-text-main border-border-sec transition-all duration-300 ease-in-out ${isOpen
          ? 'w-[300px] sm:w-[320px] translate-x-0 border-r shadow-2xl md:shadow-none'
          : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-r-0'
          }`}
      >
        {/* Fixed width container to prevent content wrapping/reflow during width animation */}
        <div className="w-[300px] sm:w-[320px] h-full flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-sec">
            <div className="flex flex-col">
              <span className="text-app-lg font-extrabold text-text-acc">Invoice Details</span>
              <span className="text-app-sm text-text-mute">Configure customer & invoice parameters</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Details Menu"
              className="p-1 rounded-md hover:bg-app-bg transition-colors cursor-pointer text-text-mute"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body (Form Fields) */}
          <div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >

            {/* Row 1: Name & Mobile */}
            <div className="grid grid-cols-2 gap-2">
              {/* Name Field */}
              <div className="flex flex-col relative" ref={dropdownRef}>
                <span className="text-app-sm font-extrabold text-text-main mb-1">
                  Name<span className="text-alert ml-0.5">*</span>
                </span>
                <div className="relative flex items-center">
                  <User size={12} className="absolute left-2 text-text-mute" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 pl-6 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => {
                      if (form.name.trim().length > 0 && customers.length > 0) {
                        setShowCustDropdown(true);
                      }
                    }}
                    placeholder="Customer Name"
                    required
                  />
                </div>
                {showCustDropdown && customers.length > 0 && (
                  <div
                    ref={listboxRef}
                    className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-panel-bg border border-border-sec rounded shadow-lg z-50"
                  >
                    {customers.map((cust, idx) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className={`w-full text-left px-3 py-2 text-app-sm hover:bg-border-acc/10 active:bg-border-acc/25 transition-colors border-b border-border-sec/40 last:border-b-0 text-text-main flex flex-col cursor-pointer ${idx === activeCustIdx ? 'bg-emerald-light' : ''}`}
                      >
                        <span className="font-bold">{cust.name}</span>
                        {cust.mobileNo && <span className="text-[10px] text-text-mute">Mob: {cust.mobileNo}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile No */}
              <div className="flex flex-col">
                <span className="text-app-sm font-extrabold text-text-main mb-1">Mobile No</span>
                <div className="relative flex items-center">
                  <Phone size={12} className="absolute left-2 text-text-mute" />
                  <input
                    type="text"
                    className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 pl-6 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                    value={form.mobileNo}
                    onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                    placeholder="Mobile No"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Remarks & Balance */}
            <div className="grid grid-cols-2 gap-2">
              {/* Remarks */}
              <div className="flex flex-col">
                <span className="text-app-sm font-extrabold text-text-main mb-1">Remarks</span>
                <div className="relative flex items-center">
                  <Clipboard size={12} className="absolute left-2 text-text-mute" />
                  <input
                    type="text"
                    className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 pl-6 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                    value={form.remarks}
                    onChange={(e) => handleFieldChange('remarks', e.target.value)}
                    placeholder="Remarks"
                  />
                </div>
              </div>

              {/* Balance (Editable Input Field) */}
              <div className="flex flex-col">
                <span className="text-app-sm font-extrabold text-text-main mb-1">Balance</span>
                <input
                  type="text"
                  className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                  value={form.balance}
                  onChange={(e) => handleFieldChange('balance', e.target.value)}
                  placeholder="e.g. 0 DR"
                />
              </div>
            </div>

            {/* Extra Details / Badges -> NOW INTERACTIVE INPUTS */}
            <div className="pt-4 border-t border-border-sec space-y-3">
              <span className="text-app-sm font-extrabold text-text-mute uppercase tracking-wider block mb-1">Invoice Info & Taxes</span>

              {/* Auto Generated Invoice Info Badge Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-app-bg border border-border-sec">
                  <span className="text-[8px] text-text-mute block font-bold">INVOICE NO</span>
                  <span className="text-app-sm font-bold text-text-main">{form.invoiceNo}</span>
                </div>
                <div className="p-2 rounded bg-app-bg border border-border-sec">
                  <span className="text-[8px] text-text-mute block font-bold">DATE</span>
                  <span className="text-app-sm font-bold text-text-main">{form.invoiceDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* PAN Input */}
                <div className="flex flex-col">
                  <span className="text-app-sm font-extrabold text-text-main mb-1">PAN</span>
                  <input
                    type="text"
                    className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 py-1 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                    value={form.pan}
                    onChange={(e) => handleFieldChange('pan', e.target.value)}
                    placeholder="PAN"
                  />
                </div>

                {/* GST Type Select */}
                <div className="flex flex-col">
                  <span className="text-app-sm font-extrabold text-text-main mb-1">GST Type</span>
                  <select
                    className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 py-1 text-app-md h-8 w-full focus:outline-none focus:border-border-acc cursor-pointer"
                    value={form.gstType}
                    onChange={(e) => handleFieldChange('gstType', e.target.value)}
                  >
                    <option value="CGST/SGST">CGST/SGST</option>
                    <option value="IGST">IGST</option>
                    <option value="UTGST">UTGST</option>
                    <option value="Exempt">Exempt</option>
                  </select>
                </div>
              </div>

              {/* GSTIN / GST Input */}
              <div className="flex flex-col">
                <span className="text-app-sm font-extrabold text-text-main mb-1">GSTIN</span>
                <input
                  type="text"
                  className="border border-inp-border bg-inp-bg text-inp-text rounded px-2 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc"
                  value={form.gst}
                  onChange={(e) => handleFieldChange('gst', e.target.value)}
                  placeholder="Enter GSTIN"
                />
              </div>

              {/* Address Info (City, State, Country) */}
              <div className="space-y-2">
                <span className="text-app-sm font-extrabold text-text-main block">Address Info</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-1 text-app-base h-8 w-full focus:outline-none focus:border-border-acc"
                      value={form.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="flex flex-col">
                    <input
                      type="text"
                      className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-1 text-app-base h-8 w-full focus:outline-none focus:border-border-acc"
                      value={form.state}
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="flex flex-col">
                    <input
                      type="text"
                      className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-1 text-app-base h-8 w-full focus:outline-none focus:border-border-acc"
                      value={form.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* BILL TO Input */}
              <div className="flex flex-col pt-1">
                <span className="text-app-sm font-extrabold text-text-acc mb-1">BILL TO</span>
                <input
                  type="text"
                  className="border border-border-acc-light bg-emerald-light text-text-acc rounded px-2 py-1.5 text-app-md h-8 w-full focus:outline-none focus:border-border-acc font-semibold"
                  value={form.billTo}
                  onChange={(e) => handleFieldChange('billTo', e.target.value)}
                  placeholder="Enter Billing Name / Company"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
