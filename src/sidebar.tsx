import React from 'react';
import { User, Phone, Clipboard, Menu, X } from 'lucide-react';

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
  darkMode?: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ form, darkMode, sidebarOpen, onToggleSidebar }) => {
  return (
    <div className={`border border-emerald-500 rounded p-2 mb-2 transition-colors duration-150 relative flex items-center justify-between ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* Left Side: Hamburger Icon & Title */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button 
            onClick={onToggleSidebar}
            className={`p-1.5 rounded-md hover:bg-emerald-500/10 active:bg-emerald-500/25 transition-colors cursor-pointer text-emerald-500 focus:outline-none`}
            title="Open Details Menu"
          >
            <Menu size={18} />
          </button>
        )}
        
        <div className="flex flex-col">
          <span className={`text-[12px] font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Add Invoice - Wholesale Credit
          </span>
          <span className="text-[9px] text-emerald-500 font-bold">
            Click menu on left to edit fields
          </span>
        </div>
      </div>

      {/* Right Side: Inputted Name from Hamburger Menu */}
      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded px-2.5 py-1">
        <User size={12} className="text-emerald-500" />
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-600">Customer:</span>
        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
          {form.name || "(No Name)"}
        </span>
      </div>
    </div>
  );
};

interface InvoiceSidebarProps {
  form: MasterForm;
  onChange: (updated: MasterForm) => void;
  darkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceSidebar: React.FC<InvoiceSidebarProps> = ({ form, onChange, darkMode, isOpen, onClose }) => {
  const handleFieldChange = (key: keyof MasterForm, value: string) => {
    onChange({
      ...form,
      [key]: value
    });
  };

  return (
    <div 
      className={`shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 flex flex-col z-40 ${
        isOpen ? 'w-[320px] border-r' : 'w-0 overflow-hidden border-r-0'
      } ${
        darkMode ? 'bg-gray-900 text-gray-100 border-gray-800' : 'bg-white text-gray-900 border-gray-200'
      }`}
    >
      {/* Fixed width container to prevent content wrapping/reflow during width animation */}
      <div className="w-[320px] h-full flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-[14px] font-extrabold text-emerald-500">Invoice Details</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Configure customer & invoice parameters</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500 dark:text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body (Form Fields) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Name Field */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">
              Name<span className="text-red-500 ml-0.5">*</span>
            </span>
            <div className="relative flex items-center">
              <User size={12} className="absolute left-2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                className={`border rounded px-2 pl-6 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                }`}
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          {/* Mobile No */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">Mobile No</span>
            <div className="relative flex items-center">
              <Phone size={12} className="absolute left-2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                className={`border rounded px-2 pl-6 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                }`}
                value={form.mobileNo}
                onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">Remarks</span>
            <div className="relative flex items-center">
              <Clipboard size={12} className="absolute left-2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                className={`border rounded px-2 pl-6 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                }`}
                value={form.remarks}
                onChange={(e) => handleFieldChange('remarks', e.target.value)}
                placeholder="Enter remarks"
              />
            </div>
          </div>

          {/* Balance (Editable Input Field) */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">Balance</span>
            <input
              type="text"
              className={`border rounded px-2 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
              }`}
              value={form.balance}
              onChange={(e) => handleFieldChange('balance', e.target.value)}
              placeholder="Enter balance amount (e.g. 0 DR)"
            />
          </div>

          {/* Extra Details / Badges -> NOW INTERACTIVE INPUTS */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Invoice Info & Taxes</span>
            
            {/* Auto Generated Invoice Info Badge Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <span className="text-[8px] text-gray-500 block">INVOICE NO</span>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{form.invoiceNo}</span>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <span className="text-[8px] text-gray-500 block">DATE</span>
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{form.invoiceDate}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* PAN Input */}
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">PAN</span>
                <input
                  type="text"
                  className={`border rounded px-2 py-1 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                    darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                  }`}
                  value={form.pan}
                  onChange={(e) => handleFieldChange('pan', e.target.value)}
                  placeholder="PAN"
                />
              </div>

              {/* GST Type Select */}
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">GST Type</span>
                <select
                  className={`border rounded px-2 py-1 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 cursor-pointer ${
                    darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                  }`}
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
              <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 mb-1">GSTIN</span>
              <input
                type="text"
                className={`border rounded px-2 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                }`}
                value={form.gst}
                onChange={(e) => handleFieldChange('gst', e.target.value)}
                placeholder="Enter GSTIN"
              />
            </div>

            {/* Address Info (City, State, Country) */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-gray-950 dark:text-gray-500 block">Address Info</span>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="flex flex-col">
                  <input
                    type="text"
                    className={`border rounded px-1.5 py-1 text-[11px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                      darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                    }`}
                    value={form.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    className={`border rounded px-1.5 py-1 text-[11px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                      darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                    }`}
                    value={form.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    className={`border rounded px-1.5 py-1 text-[11px] h-8 w-full focus:outline-none focus:border-emerald-500 ${
                      darkMode ? 'border-gray-700 bg-gray-800 text-white focus:bg-gray-800' : 'border-gray-300 bg-white text-gray-950 focus:bg-white'
                    }`}
                    value={form.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* BILL TO Input */}
            <div className="flex flex-col pt-1">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">BILL TO</span>
              <input
                type="text"
                className={`border rounded px-2 py-1.5 text-[12px] h-8 w-full focus:outline-none focus:border-emerald-500 font-semibold ${
                  darkMode ? 'border-emerald-900 bg-emerald-950/20 text-emerald-300 focus:bg-emerald-950/30' : 'border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:bg-emerald-50'
                }`}
                value={form.billTo}
                onChange={(e) => handleFieldChange('billTo', e.target.value)}
                placeholder="Enter Billing Name / Company"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
