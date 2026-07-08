import React from 'react';
import type { MasterForm } from '../sidebar';
import type { TableItem } from '../invoice/types';
import {
  InvoicePrintHeader,
  InvoicePrintTable,
  InvoicePrintTotals,
  InvoicePrintFooter,
} from './PrintSections';
import type { PrintColumn, PrintSettings } from './PrintSections';


interface TemplateProps {
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
  settings: PrintSettings;
  hamali?: string;
  freight?: string;
  discPercent?: string;
  salesman?: string;
  vehicleNo?: string;
  transport?: string;
  roundOff?: string;
  note?: string;
}

// Helper to construct configuration-driven columns dynamically based on print settings
const getColumnsFromSettings = (settings: PrintSettings): PrintColumn[] => {
  const columns: PrintColumn[] = [];

  if (settings.showColSrNo) {
    columns.push({
      key: 'srNo',
      label: 'Sr.',
      align: 'center',
      getValue: (item) => item.srNo,
    });
  }

  columns.push({
    key: 'name',
    label: 'Product Description',
    align: 'left',
    getValue: (item) => (
      <div>
        <div className="font-bold text-gray-900">{item.name}</div>
        {settings.showColHSN && item.hsn && (
          <div className="text-[9px] text-gray-500 font-mono">HSN: {item.hsn}</div>
        )}
      </div>
    ),
  });

  if (settings.showColQty) {
    columns.push({
      key: 'quantity',
      label: 'Qty',
      align: 'right',
      getValue: (item) => item.quantity.toFixed(2),
    });
  }

  if (settings.showColUOM) {
    columns.push({
      key: 'uom',
      label: 'UOM',
      align: 'center',
      getValue: (item) => item.uom,
    });
  }

  if (settings.showColWeight) {
    columns.push({
      key: 'weight',
      label: 'Net Wt.',
      align: 'right',
      getValue: (item) => (item.netWt ? `${item.netWt.toFixed(2)} KG` : '0.00 KG'),
    });
  }

  if (settings.showColRate) {
    columns.push({
      key: 'rate',
      label: 'Rate',
      align: 'right',
      getValue: (item) => `₹${item.rate.toFixed(2)}`,
    });
  }

  if (settings.showColNetRate) {
    columns.push({
      key: 'netRate',
      label: 'Net Rate',
      align: 'right',
      getValue: (item) => `₹${item.netRate.toFixed(2)}`,
    });
  }

  if (settings.showColGST) {
    columns.push({
      key: 'gst',
      label: 'GST %',
      align: 'center',
      getValue: (item) => `${item.gstPercent}%`,
    });
  }

  if (settings.showColTotal) {
    columns.push({
      key: 'total',
      label: 'Total',
      align: 'right',
      getValue: (item) => `₹${item.net.toFixed(2)}`,
    });
  }

  return columns;
};

// 1. CLASSIC A4 TEMPLATE
const ClassicA4Template: React.FC<TemplateProps> = (props) => {
  const columns = getColumnsFromSettings(props.settings);
  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white border border-gray-300 shadow-sm text-gray-900 rounded font-sans">
      {/* Dynamic Header */}
      <InvoicePrintHeader {...props} />

      {/* Styled Grid Header Title */}
      <div className="text-center my-3 bg-gray-100 py-1.5 border border-gray-300 font-bold uppercase tracking-wider text-xs">
        TAX INVOICE
      </div>

      {/* Configuration-driven Items Table */}
      <InvoicePrintTable {...props} columns={columns} />

      {/* Totals Section */}
      <InvoicePrintTotals {...props} />

      {/* Footer Section */}
      <InvoicePrintFooter {...props} />
    </div>
  );
};

// 2. MODERN TEMPLATE
const ModernTemplate: React.FC<TemplateProps> = (props) => {
  const columns = getColumnsFromSettings(props.settings);
  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white shadow-xl text-gray-800 rounded-lg font-sans border-t-[8px] border-emerald-600">
      {/* Dynamic Header */}
      <InvoicePrintHeader {...props} />

      {/* Custom styled Title */}
      <div className="flex justify-between items-center my-4">
        <h4 className="text-base font-black text-emerald-800 tracking-widest uppercase">INVOICE PREVIEW</h4>
        <div className="h-0.5 bg-emerald-100 flex-1 ml-4"></div>
      </div>

      {/* Configuration-driven Items Table */}
      <InvoicePrintTable {...props} columns={columns} />

      {/* Totals Section */}
      <InvoicePrintTotals {...props} />

      {/* Footer Section */}
      <InvoicePrintFooter {...props} />
    </div>
  );
};

// 3. THERMAL RECEIPT TEMPLATE (80mm Width)
const ThermalTemplate: React.FC<TemplateProps> = (props) => {
  const columns = getColumnsFromSettings(props.settings);
  return (
    <div className="p-3 w-[80mm] max-w-[80mm] bg-white border border-dashed border-gray-400 mx-auto text-gray-900 font-mono text-[10px] leading-tight">
      <div className="text-center font-bold uppercase text-[12px] mb-1">
        INVOISO TERMINAL
      </div>
      <div className="text-center text-[9px] border-b border-dashed border-gray-400 pb-2 mb-2">
        *** CUSTOMER RECEIPT ***
      </div>

      {/* Header Info */}
      <InvoicePrintHeader {...props} />

      {/* Small table spacer */}
      <div className="border-t-2 border-gray-900 my-1"></div>
      <InvoicePrintTable {...props} columns={columns} />
      <div className="border-b-2 border-gray-900 my-1"></div>

      {/* Totals & Footer */}
      <InvoicePrintTotals {...props} />
      <InvoicePrintFooter {...props} />

      <div className="text-center mt-4 border-t border-dashed border-gray-300 pt-2 text-[9px] text-gray-500">
        Thank you for your business!
      </div>
    </div>
  );
};

// 4. RETAIL TEMPLATE
const RetailTemplate: React.FC<TemplateProps> = (props) => {
  const columns = getColumnsFromSettings(props.settings);
  return (
    <div className="p-6 max-w-[210mm] mx-auto bg-white border border-double border-gray-800 text-gray-900 font-sans">
      <div className="border-b border-double border-gray-800 pb-3 mb-3 text-center">
        <h2 className="text-xl font-bold uppercase text-gray-900">RETAIL CASH MEMO</h2>
      </div>

      <InvoicePrintHeader {...props} />
      <InvoicePrintTable {...props} columns={columns} />
      <InvoicePrintTotals {...props} />
      <InvoicePrintFooter {...props} />
    </div>
  );
};

// ==========================================
// TEMPLATE RESOLVER & COMPONENT DISPATCH
// ==========================================
interface PrintResolverProps extends TemplateProps {
  layoutType: 'Classic A4' | 'Modern' | 'Thermal' | 'Retail';
}

export const InvoicePrintTemplate: React.FC<PrintResolverProps> = ({ layoutType, ...rest }) => {
  switch (layoutType) {
    case 'Classic A4':
      return <ClassicA4Template {...rest} />;
    case 'Modern':
      return <ModernTemplate {...rest} />;
    case 'Thermal':
      return <ThermalTemplate {...rest} />;
    case 'Retail':
      return <RetailTemplate {...rest} />;
    default:
      return <ClassicA4Template {...rest} />;
  }
};
