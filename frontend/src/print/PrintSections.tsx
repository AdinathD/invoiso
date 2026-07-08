import React from 'react';
import type { MasterForm } from '../sidebar';
import type { TableItem } from '../invoice/types';

// Definition for configuration-driven columns
export interface PrintColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  getValue: (item: TableItem) => React.ReactNode;
}

export interface PrintSettings {
  // Company Info
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showCompanyPhone: boolean;
  showCompanyEmail: boolean;
  showCompanyGST: boolean;
  // Customer Info
  showCustomerName: boolean;
  showCustomerMobile: boolean;
  showCustomerAddress: boolean;
  showCustomerGST: boolean;
  showCustomerPAN: boolean;
  // Details
  showInvoiceNo: boolean;
  showInvoiceDate: boolean;
  showSalesman: boolean;
  showLogistics: boolean; // vehicle, transport, etc
  // Columns
  showColSrNo: boolean;
  showColHSN: boolean;
  showColQty: boolean;
  showColUOM: boolean;
  showColWeight: boolean;
  showColRate: boolean;
  showColNetRate: boolean;
  showColGST: boolean;
  showColTotal: boolean;
  // Footer
  showNotes: boolean;
  showTerms: boolean;
  showSignature: boolean;
}

interface SectionProps {
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

// 1. HEADER SECTION
export const InvoicePrintHeader: React.FC<SectionProps> = ({ form, settings }) => {
  return (
    <div className="border-b border-gray-300 pb-3 mb-3">
      <div className="flex justify-between items-start gap-4">
        {/* Company info (mock details or editable details) */}
        <div>
          {settings.showCompanyName && (
            <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">
              XYZ traders
            </h2>
          )}
          <div className="text-[11px] text-gray-600 space-y-0.5 mt-1">
            {settings.showCompanyAddress && <p>Plot 42, Sector-3, Industrial Area, New Delhi, India</p>}
            {(settings.showCompanyPhone || settings.showCompanyEmail) && (
              <p>
                {settings.showCompanyPhone && <span>📞 +91 98765 43210 </span>}
                {settings.showCompanyEmail && <span>✉️ support@invoiso.ai</span>}
              </p>
            )}
            {settings.showCompanyGST && (
              <p className="font-bold">GSTIN: 07AAAAA1111A1Z1</p>
            )}
          </div>
        </div>

        {/* Invoice Metadata block */}
        <div className="text-right text-[11px] text-gray-800 space-y-1">
          {settings.showInvoiceNo && (
            <div>
              <span className="text-gray-500 font-medium">Invoice No: </span>
              <strong className="text-gray-900 text-xs font-black">{form.invoiceNo}</strong>
            </div>
          )}
          {settings.showInvoiceDate && (
            <div>
              <span className="text-gray-500 font-medium">Date: </span>
              <strong className="text-gray-900">{form.invoiceDate}</strong>
            </div>
          )}
          <div>
            <span className="text-gray-500 font-medium">Type: </span>
            <span className="font-bold text-gray-900 uppercase">{form.gstType || 'CGST/SGST'}</span>
          </div>
        </div>
      </div>

      {/* Customer block */}
      {settings.showCustomerName && (form.name || form.mobileNo) && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-300 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">Bill To</h3>
            <div className="text-[12px] font-bold text-gray-900 mt-0.5">{form.name || 'Walk-in Customer'}</div>
            {settings.showCustomerAddress && form.billTo && (
              <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">{form.billTo}</div>
            )}
            {settings.showCustomerAddress && (form.city || form.state) && (
              <div className="text-[11px] text-gray-600">
                {[form.city, form.state, form.country].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          <div className="text-right text-[11px] text-gray-600 space-y-0.5">
            {settings.showCustomerMobile && form.mobileNo && (
              <div>📞 {form.mobileNo}</div>
            )}
            {settings.showCustomerGST && form.gst && (
              <div><span className="font-semibold text-gray-700">GSTIN:</span> {form.gst}</div>
            )}
            {settings.showCustomerPAN && form.pan && (
              <div><span className="font-semibold text-gray-700">PAN:</span> {form.pan}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 2. ITEMS TABLE SECTION
interface TableSectionProps extends SectionProps {
  columns: PrintColumn[];
}

export const InvoicePrintTable: React.FC<TableSectionProps> = ({ items, columns }) => {
  return (
    <div className="mb-3">
      <table className="w-full text-left text-[11px] border-collapse">
        <thead>
          <tr className="border-y-2 border-gray-800 bg-gray-50 font-bold text-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-1.5 px-2 uppercase tracking-wider ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-gray-200 hover:bg-gray-50/50">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-1.5 px-2 text-gray-900 ${
                    col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left font-medium'
                  }`}
                >
                  {col.getValue(item)}
                </td>
              ))}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-400 font-medium italic">
                No items in the invoice
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Helper: Convert number to Words
const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertThreeDigit = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str;
  };

  let word = '';
  let temp = Math.floor(num);
  
  if (temp >= 10000000) {
    word += convertThreeDigit(Math.floor(temp / 10000000)) + 'Crore ';
    temp %= 10000000;
  }
  if (temp >= 100000) {
    word += convertThreeDigit(Math.floor(temp / 100000)) + 'Lakh ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    word += convertThreeDigit(Math.floor(temp / 1000)) + 'Thousand ';
    temp %= 1000;
  }
  if (temp > 0) {
    word += convertThreeDigit(temp);
  }

  const paise = Math.round((num - Math.floor(num)) * 100);
  let paiseWord = '';
  if (paise > 0) {
    paiseWord = ' and ' + convertThreeDigit(paise) + 'Paise';
  }

  return 'Rupees ' + word.trim() + paiseWord + ' Only';
};

// 3. TOTALS SECTION WITH DISTINCT TAX LAYOUTS (GST, IGST, non-GST)
export const InvoicePrintTotals: React.FC<SectionProps> = ({
  form,
  totals,
  hamali = '0.00',
  freight = '0.00',
  discPercent = '0.00',
  roundOff = '0.00',
}) => {
  const taxType = (form.gstType || 'CGST/SGST').toUpperCase();
  const discPctVal = parseFloat(discPercent) || 0;
  const hamVal = parseFloat(hamali) || 0;
  const frtVal = parseFloat(freight) || 0;
  const roundVal = parseFloat(roundOff) || 0;

  const renderTaxBreakdown = () => {
    const taxAmt = parseFloat(totals.taxAmount) || 0;
    if (taxAmt <= 0) return null;

    if (taxType === 'CGST/SGST') {
      const halfTax = (taxAmt / 2).toFixed(2);
      return (
        <>
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>CGST Amount:</span>
            <span className="font-bold text-gray-900 font-mono">₹{halfTax}</span>
          </div>
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>SGST Amount:</span>
            <span className="font-bold text-gray-900 font-mono">₹{halfTax}</span>
          </div>
        </>
      );
    } else if (taxType === 'IGST') {
      return (
        <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
          <span>IGST Amount:</span>
          <span className="font-bold text-gray-900 font-mono">₹{taxAmt.toFixed(2)}</span>
        </div>
      );
    }
    // non-GST or exempt
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-300 pt-3 mb-4 avoid-page-break">
      {/* Number to words block */}
      <div className="text-[11px] text-gray-600 flex flex-col justify-end">
        <p className="font-bold text-gray-700 uppercase tracking-wide">Amount in Words:</p>
        <p className="italic text-xs font-semibold text-gray-800 mt-1">
          {numberToWords(parseFloat(totals.netTotal) || 0)}
        </p>
      </div>

      {/* Calculations Block */}
      <div className="text-[11px] space-y-1">
        <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
          <span>Taxable Amount:</span>
          <span className="font-bold text-gray-900 font-mono">₹{totals.taxableAmount}</span>
        </div>

        {/* GST Rendering Scenario */}
        {renderTaxBreakdown()}

        {discPctVal > 0 && (
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>Discount ({discPctVal}%):</span>
            <span className="font-bold text-gray-900 font-mono">
              - ₹{((parseFloat(totals.taxableAmount) * discPctVal) / 100).toFixed(2)}
            </span>
          </div>
        )}

        {hamVal > 0 && (
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>Hamali Charges:</span>
            <span className="font-bold text-gray-900 font-mono">₹{hamVal.toFixed(2)}</span>
          </div>
        )}

        {frtVal > 0 && (
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>Freight Charges:</span>
            <span className="font-bold text-gray-900 font-mono">₹{frtVal.toFixed(2)}</span>
          </div>
        )}

        {roundVal !== 0 && (
          <div className="flex justify-between text-gray-600 font-medium py-0.5 border-b border-gray-100">
            <span>Round off:</span>
            <span className="font-bold text-gray-900 font-mono">
              {roundVal > 0 ? '+' : ''} ₹{roundVal.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-gray-900 font-black text-sm py-1.5 border-t-2 border-gray-800 bg-gray-50 px-2 mt-1 rounded">
          <span className="uppercase tracking-wider">Net Amount Payable:</span>
          <span className="font-mono text-base">INR {totals.netTotal}</span>
        </div>
      </div>
    </div>
  );
};

// 4. FOOTER & LOGISTICS SECTION
export const InvoicePrintFooter: React.FC<SectionProps> = ({
  settings,
  salesman,
  vehicleNo,
  transport,
  note,
}) => {
  return (
    <div className="border-t border-gray-300 pt-3 text-[11px] text-gray-600 avoid-page-break space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Logistics and notes */}
        <div className="space-y-2">
          {settings.showLogistics && (vehicleNo || transport) && (
            <div className="p-1.5 bg-gray-50 border border-gray-200 rounded space-y-0.5">
              <span className="font-bold text-gray-700 block uppercase text-[10px]">Logistics Details</span>
              {transport && <div><span className="font-medium text-gray-500">Transport:</span> <span className="font-bold text-gray-800">{transport}</span></div>}
              {vehicleNo && <div><span className="font-medium text-gray-500">Vehicle No:</span> <span className="font-bold text-gray-800">{vehicleNo}</span></div>}
            </div>
          )}
          {settings.showSalesman && salesman && salesman !== '-- Select --' && (
            <div>
              <span className="font-medium text-gray-500">Salesman:</span>{' '}
              <strong className="text-gray-800 font-bold">{salesman}</strong>
            </div>
          )}
          {settings.showNotes && note && (
            <div>
              <span className="font-bold text-gray-700 block uppercase text-[10px]">Remarks/Notes</span>
              <p className="text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-200 border-dashed text-[11px] mt-0.5 italic">
                {note}
              </p>
            </div>
          )}
        </div>

        {/* Signature Box */}
        {settings.showSignature && (
          <div className="flex flex-col justify-end items-end text-right h-20">
            <div className="w-32 border-b border-gray-400 mb-1"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Authorized Signatory</span>
          </div>
        )}
      </div>

      {settings.showTerms && (
        <div className="text-[10px] text-gray-500 leading-snug border-t border-dashed border-gray-200 pt-2">
          <span className="font-bold uppercase block text-[9px] text-gray-600 mb-0.5">Terms & Conditions:</span>
          1. Goods once sold will not be taken back or exchanged. 
          2. Any complaints regarding weight/quantity must be reported within 24 hours of delivery.
          3. Subject to local jurisdiction only.
        </div>
      )}
    </div>
  );
};
