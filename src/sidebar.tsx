import React from 'react';
import { User, Phone, Clipboard, Menu, X } from 'lucide-react';
import { handleEnterTraversal } from './keyboardUtils.ts';

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
}

interface MasterHeaderProps {
  form: MasterForm;
  onChange: (updated: MasterForm) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ form, sidebarOpen, onToggleSidebar }) => {
  return (
    <div className="border border-border-acc rounded p-2 mb-2 transition-colors duration-150 relative flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-panel-bg text-text-main">

      {/* Left Side: Hamburger Icon & Title */}
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
          <span className="text-app-md font-bold text-text-main">
            Add Invoice - Wholesale Credit
          </span>
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
      </div>
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

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
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
              <div className="flex flex-col">
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
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Customer Name"
                    required
                  />
                </div>
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
