import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { MasterForm } from '../sidebar';
import type { TableItem } from '../invoice/types';
import type { PrintSettings } from './PrintSections';
import { InvoicePrintTemplate } from './PrintTemplates';
import { Printer, X, ToggleLeft, ToggleRight, Settings, Layout, Eye, Lock } from 'lucide-react';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: MasterForm;
  items: TableItem[];
  totals: {
    itemsCount: number;
    weightSum: string;
    quantitySum: string;
    taxableAmount: string;
    taxAmount: string;
    netTotal: string;
  };
  hamali?: string;
  freight?: string;
  discPercent?: string;
  salesman?: string;
  vehicleNo?: string;
  transport?: string;
  roundOff?: string;
  note?: string;
}

// ----------------------------------------------------
// DEFAULT CAPABILITY MATRIX CONFIGURATIONS
// ----------------------------------------------------
const TEMPLATE_DEFAULTS: Record<'Classic A4' | 'Modern' | 'Thermal' | 'Retail', PrintSettings> = {
  'Classic A4': {
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanyGST: true,
    showCustomerName: true,
    showCustomerMobile: true,
    showCustomerAddress: true,
    showCustomerGST: true,
    showCustomerPAN: true,
    showInvoiceNo: true,
    showInvoiceDate: true,
    showSalesman: true,
    showLogistics: true,
    showColSrNo: true,
    showColHSN: true,
    showColQty: true,
    showColUOM: true,
    showColWeight: true,
    showColRate: true,
    showColNetRate: false,
    showColGST: true,
    showColTotal: true,
    showNotes: true,
    showTerms: true,
    showSignature: true,
  },
  'Modern': {
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanyGST: true,
    showCustomerName: true,
    showCustomerMobile: true,
    showCustomerAddress: true,
    showCustomerGST: true,
    showCustomerPAN: false,
    showInvoiceNo: true,
    showInvoiceDate: true,
    showSalesman: false,
    showLogistics: false,
    showColSrNo: false,
    showColHSN: false,
    showColQty: true,
    showColUOM: false,
    showColWeight: false,
    showColRate: true,
    showColNetRate: false,
    showColGST: false,
    showColTotal: true,
    showNotes: true,
    showTerms: false,
    showSignature: true,
  },
  'Thermal': {
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: false,
    showCompanyGST: true,
    showCustomerName: true,
    showCustomerMobile: true,
    showCustomerAddress: false,
    showCustomerGST: false,
    showCustomerPAN: false,
    showInvoiceNo: true,
    showInvoiceDate: true,
    showSalesman: false,
    showLogistics: false,
    showColSrNo: false,
    showColHSN: false,
    showColQty: true,
    showColUOM: false,
    showColWeight: false,
    showColRate: true,
    showColNetRate: false,
    showColGST: false,
    showColTotal: true,
    showNotes: false,
    showTerms: false,
    showSignature: false,
  },
  'Retail': {
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: false,
    showCompanyGST: false,
    showCustomerName: true,
    showCustomerMobile: true,
    showCustomerAddress: true,
    showCustomerGST: false,
    showCustomerPAN: false,
    showInvoiceNo: true,
    showInvoiceDate: true,
    showSalesman: true,
    showLogistics: false,
    showColSrNo: true,
    showColHSN: false,
    showColQty: true,
    showColUOM: true,
    showColWeight: false,
    showColRate: true,
    showColNetRate: false,
    showColGST: false,
    showColTotal: true,
    showNotes: true,
    showTerms: true,
    showSignature: true,
  }
};

// ----------------------------------------------------
// FIELD RULES CONFIGURATIONS
// ----------------------------------------------------
interface TemplateRule {
  required: (keyof PrintSettings)[];
  unsupported: (keyof PrintSettings)[];
}

const TEMPLATE_RULES: Record<'Classic A4' | 'Modern' | 'Thermal' | 'Retail', TemplateRule> = {
  'Classic A4': {
    required: ['showCompanyName', 'showCompanyAddress', 'showCompanyGST', 'showInvoiceNo', 'showInvoiceDate', 'showCustomerName', 'showCustomerAddress', 'showColQty', 'showColRate', 'showColTotal', 'showSignature'],
    unsupported: []
  },
  'Modern': {
    required: ['showCompanyName', 'showInvoiceNo', 'showInvoiceDate', 'showCustomerName', 'showColQty', 'showColRate', 'showColTotal'],
    unsupported: ['showLogistics']
  },
  'Thermal': {
    required: ['showCompanyName', 'showInvoiceNo', 'showInvoiceDate', 'showCustomerName', 'showColQty', 'showColRate', 'showColTotal'],
    unsupported: ['showCompanyEmail', 'showCustomerAddress', 'showCustomerPAN', 'showColSrNo', 'showColHSN', 'showColWeight', 'showColNetRate', 'showColGST', 'showTerms', 'showSignature']
  },
  'Retail': {
    required: ['showCompanyName', 'showInvoiceNo', 'showInvoiceDate', 'showCustomerName', 'showColQty', 'showColRate', 'showColTotal'],
    unsupported: ['showCompanyGST', 'showCustomerGST', 'showCustomerPAN', 'showColHSN', 'showColGST']
  }
};

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  form,
  items,
  totals,
  hamali = '0.00',
  freight = '0.00',
  discPercent = '0.00',
  salesman = '-- Select --',
  vehicleNo = '',
  transport = '',
  roundOff = '0.00',
  note = '',
}) => {
  const [layoutType, setLayoutType] = useState<'Classic A4' | 'Modern' | 'Thermal' | 'Retail'>('Classic A4');
  const [settings, setSettings] = useState<PrintSettings>(TEMPLATE_DEFAULTS['Classic A4']);

  if (!isOpen) return null;

  // Change layout triggers and resets settings to defaults for that template
  const handleLayoutChange = (newLayout: 'Classic A4' | 'Modern' | 'Thermal' | 'Retail') => {
    setLayoutType(newLayout);
    setSettings(TEMPLATE_DEFAULTS[newLayout]);
  };

  const toggleSetting = (key: keyof PrintSettings) => {
    const rules = TEMPLATE_RULES[layoutType];
    // Block toggle if field is required or unsupported
    if (rules.required.includes(key) || rules.unsupported.includes(key)) return;
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute effective settings by applying rule filters dynamically
  const getEffectiveSettings = (): PrintSettings => {
    const rules = TEMPLATE_RULES[layoutType];
    const effective = { ...settings };

    // Apply required
    rules.required.forEach((key) => {
      effective[key] = true;
    });

    // Apply unsupported
    rules.unsupported.forEach((key) => {
      effective[key] = false;
    });

    return effective;
  };

  const effectiveSettings = getEffectiveSettings();

  // Reusable Switch Component with support for Matrix states (Required vs Unsupported)
  const ToggleSwitch = ({ label, settingKey }: { label: string; settingKey: keyof PrintSettings }) => {
    const rules = TEMPLATE_RULES[layoutType];
    const isRequired = rules.required.includes(settingKey);
    const isUnsupported = rules.unsupported.includes(settingKey);

    if (isUnsupported) return null; // Hide completely in the sidebar if not supported by the template

    const value = isRequired ? true : settings[settingKey];

    return (
      <button
        onClick={() => toggleSetting(settingKey)}
        disabled={isRequired}
        className={`flex items-center justify-between w-full text-left py-1 px-1.5 rounded transition-colors text-app-xs font-semibold ${
          isRequired ? 'cursor-not-allowed opacity-75 bg-app-bg/10' : 'hover:bg-app-bg/50 cursor-pointer text-text-main'
        }`}
      >
        <span className="flex items-center gap-1">
          {label}
          {isRequired && (
            <span className="text-[9px] text-text-mute italic flex items-center gap-0.5">
              <Lock size={10} className="text-text-acc" />
              (Req.)
            </span>
          )}
        </span>
        {value ? (
          <ToggleRight className="text-text-acc w-5 h-5 shrink-0" />
        ) : (
          <ToggleLeft className="text-text-mute w-5 h-5 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* 1. SCREEN MODAL OVERLAY & CONTENT */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 text-text-main">
        <div className="w-full max-w-6xl h-[95vh] md:h-[90vh] bg-panel-bg border border-border-sec rounded-xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Modal Header */}
          <header className="px-4 py-3 border-b border-border-sec bg-app-bg flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Printer className="text-text-acc w-5 h-5" />
              <h2 className="text-app-md font-black tracking-wide">Print Invoice Console</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-mute hover:bg-border-sec hover:text-text-main transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </header>

          {/* Modal Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* LEFT CONFIGURATION PANEL (Scrollable, 30% Width) */}
            <div className="w-full md:w-80 border-r border-border-sec bg-panel-bg overflow-y-auto p-4 shrink-0 space-y-4">
              
              {/* Template Selection */}
              <div className="space-y-2">
                <label className="text-app-xs font-black uppercase text-text-mute tracking-wider flex items-center gap-1.5">
                  <Layout size={12} className="text-text-acc" /> Layout Template
                </label>
                <select
                  value={layoutType}
                  onChange={(e) => handleLayoutChange(e.target.value as any)}
                  className="w-full border border-border-secondary bg-app-bg text-text-main rounded p-1.5 text-app-sm font-bold focus:outline-none focus:ring-1 focus:ring-border-emerald"
                >
                  <option value="Classic A4">Classic A4 (Tax Invoice)</option>
                  <option value="Modern">Modern Minimalist</option>
                  <option value="Thermal">Thermal POS Slip (80mm)</option>
                  <option value="Retail">Retail Memo</option>
                </select>
              </div>

              <div className="border-t border-border-sec pt-3 space-y-3">
                <label className="text-app-xs font-black uppercase text-text-mute tracking-wider flex items-center gap-1.5">
                  <Settings size={12} className="text-text-acc" /> Printable Fields
                </label>

                {/* Company & Customer Info Group */}
                <div className="bg-app-bg/30 p-2 rounded border border-border-sec/50 space-y-1">
                  <div className="text-[10px] font-black text-text-mute uppercase tracking-wide px-1 mb-1 border-b border-border-sec/30 pb-0.5">Company & Client</div>
                  <ToggleSwitch label="Company Name" settingKey="showCompanyName" />
                  <ToggleSwitch label="Company Address" settingKey="showCompanyAddress" />
                  <ToggleSwitch label="Company Phone" settingKey="showCompanyPhone" />
                  <ToggleSwitch label="Company Email" settingKey="showCompanyEmail" />
                  <ToggleSwitch label="Company GSTIN" settingKey="showCompanyGST" />
                  <ToggleSwitch label="Customer Name" settingKey="showCustomerName" />
                  <ToggleSwitch label="Customer Mobile" settingKey="showCustomerMobile" />
                  <ToggleSwitch label="Customer Address" settingKey="showCustomerAddress" />
                  <ToggleSwitch label="Customer GSTIN" settingKey="showCustomerGST" />
                  <ToggleSwitch label="Customer PAN" settingKey="showCustomerPAN" />
                </div>

                {/* Table Columns Group */}
                <div className="bg-app-bg/30 p-2 rounded border border-border-sec/50 space-y-1">
                  <div className="text-[10px] font-black text-text-mute uppercase tracking-wide px-1 mb-1 border-b border-border-sec/30 pb-0.5">Invoice Table Columns</div>
                  <ToggleSwitch label="Sr. Number" settingKey="showColSrNo" />
                  <ToggleSwitch label="HSN Code" settingKey="showColHSN" />
                  <ToggleSwitch label="Quantity" settingKey="showColQty" />
                  <ToggleSwitch label="Unit (UOM)" settingKey="showColUOM" />
                  <ToggleSwitch label="Net Weight" settingKey="showColWeight" />
                  <ToggleSwitch label="Rate (Excl. Tax)" settingKey="showColRate" />
                  <ToggleSwitch label="Net Rate" settingKey="showColNetRate" />
                  <ToggleSwitch label="GST percentage" settingKey="showColGST" />
                  <ToggleSwitch label="Total Amount" settingKey="showColTotal" />
                </div>

                {/* Logistics & Footer */}
                <div className="bg-app-bg/30 p-2 rounded border border-border-sec/50 space-y-1">
                  <div className="text-[10px] font-black text-text-mute uppercase tracking-wide px-1 mb-1 border-b border-border-sec/30 pb-0.5">Logistics & Footer</div>
                  <ToggleSwitch label="Invoice Number" settingKey="showInvoiceNo" />
                  <ToggleSwitch label="Invoice Date" settingKey="showInvoiceDate" />
                  <ToggleSwitch label="Salesman Name" settingKey="showSalesman" />
                  <ToggleSwitch label="Logistics Details" settingKey="showLogistics" />
                  <ToggleSwitch label="Remarks / Notes" settingKey="showNotes" />
                  <ToggleSwitch label="Terms & Conditions" settingKey="showTerms" />
                  <ToggleSwitch label="Signature Block" settingKey="showSignature" />
                </div>

              </div>
            </div>

            {/* RIGHT PREVIEW CANVAS (Scrollable simulation of paper) */}
            <div className="flex-1 bg-app-bg overflow-y-auto p-6 flex justify-center items-start">
              <div className="w-full flex flex-col items-center">
                <div className="mb-2 text-text-mute text-app-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Eye size={12} className="text-text-acc" /> Real-time Print Preview
                </div>
                
                {/* Simulated Paper Wrapper */}
                <div className="bg-white shadow-xl border border-gray-200 rounded-md p-1 transform origin-top max-w-full overflow-x-auto">
                  <InvoicePrintTemplate
                    layoutType={layoutType}
                    form={form}
                    items={items}
                    totals={totals}
                    settings={effectiveSettings}
                    hamali={hamali}
                    freight={freight}
                    discPercent={discPercent}
                    salesman={salesman}
                    vehicleNo={vehicleNo}
                    transport={transport}
                    roundOff={roundOff}
                    note={note}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Controls */}
          <footer className="px-4 py-3 border-t border-border-sec bg-app-bg flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-border-secondary hover:bg-border-sec rounded text-app-sm font-black transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-1.5 bg-border-acc hover:bg-action-hover text-white rounded text-app-sm font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer size={15} />
              Print Invoice
            </button>
          </footer>

        </div>
      </div>

      {/* 2. REAL PRINT PORTAL (Direct body node projection, hidden on screen by default CSS) */}
      {ReactDOM.createPortal(
        <div id="print-root-container" className={layoutType === 'Thermal' ? 'print-thermal-layout' : ''}>
          <InvoicePrintTemplate
            layoutType={layoutType}
            form={form}
            items={items}
            totals={totals}
            settings={effectiveSettings}
            hamali={hamali}
            freight={freight}
            discPercent={discPercent}
            salesman={salesman}
            vehicleNo={vehicleNo}
            transport={transport}
            roundOff={roundOff}
            note={note}
          />
        </div>,
        document.body
      )}
    </>
  );
};
