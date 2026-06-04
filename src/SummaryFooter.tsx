import React from 'react';

interface SummaryFooterProps {
  totals: {
    itemsCount: number;
    weightSum: string;
    quantitySum: string;
    taxableAmount: string;
    taxAmount: string;
    netTotal: string;
  };
  hamali: string;
  setHamali: (val: string) => void;
  freight: string;
  setFreight: (val: string) => void;
  discPercent: string;
  setDiscPercent: (val: string) => void;
  salesman: string;
  setSalesman: (val: string) => void;
  vehicleNo: string;
  setVehicleNo: (val: string) => void;
  transport: string;
  setTransport: (val: string) => void;
  creditBill: boolean;
  setCreditBill: (val: boolean) => void;
  note: string;
  setNote: (val: string) => void;
  salesNotes: string;
  setSalesNotes: (val: string) => void;
  roundOff: string;
  setRoundOff: (val: string) => void;
  handleSaveInvoice: () => void;
  darkMode?: boolean;
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  totals,
  hamali,
  setHamali,
  freight,
  setFreight,
  discPercent,
  setDiscPercent,
  salesman,
  setSalesman,
  vehicleNo,
  setVehicleNo,
  transport,
  setTransport,
  creditBill,
  setCreditBill,
  note,
  setNote,
  salesNotes,
  setSalesNotes,
  roundOff,
  setRoundOff,
  handleSaveInvoice,
  darkMode,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-t border-gray-300 dark:border-gray-700 pt-1 text-black dark:text-white">
      {/* Left Logistics Block - Organized in 4 Columns */}
      <div className="md:col-span-6 grid grid-cols-4 gap-x-1.5 gap-y-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Items</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-center cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.itemsCount}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Weight</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-right cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.weightSum}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Quantity</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-right cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.quantitySum}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Disc(%)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={discPercent}
            onChange={(e) => setDiscPercent(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Hamali(+)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={hamali}
            onChange={(e) => setHamali(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Freight(+)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-16 text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Salesman</span>
          <select
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={salesman}
            onChange={(e) => setSalesman(e.target.value)}
          >
            <option>-- Select --</option>
            <option>ABC </option>
            <option>XYZ</option>
          </select>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Vehicle No</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Transport</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.2 text-[11.5px] h-6 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
          />
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Note</span>
          <input
            type="text"
            className={`border rounded px-1.5 py-0.2 text-[11.5px] h-6 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold placeholder-black font-semibold'}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note text..."
          />
        </div>
        <div className="flex items-center gap-1 mt-3.5 pl-1 col-span-1">
          <input
            type="checkbox"
            id="creditBill"
            checked={creditBill}
            onChange={(e) => setCreditBill(e.target.checked)}
          />
          <label htmlFor="creditBill" className="text-[10px] font-bold cursor-pointer" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
            Credit Bill
          </label>
        </div>
      </div>

      {/* Center Block (Sales Notes) - Replaced textarea with tight input */}
      <div className="md:col-span-3 flex flex-col">
        <span className="text-[10px] font-bold" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Sales Notes</span>
        <input
          type="text"
          className={`border rounded px-1.5 py-0.2 text-[11.5px] h-6 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
          value={salesNotes}
          onChange={(e) => setSalesNotes(e.target.value)}
          placeholder="Sales notes..."
        />
      </div>

      {/* Right Calculations Card - Elevated & Highlighted - Tighter calculations, Larger Net Total */}
      <div className={`md:col-span-3 border border-emerald-500/20 rounded p-1.5 flex flex-col gap-0.5 transition-all duration-300 hover:shadow-sm ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-950 shadow-[0_2px_8px_-4px_rgba(16,185,129,0.15)] text-gray-150' 
          : 'bg-gradient-to-b from-emerald-50/20 to-white shadow-[0_2px_6px_-3px_rgba(16,185,129,0.08)] text-gray-900'
      }`}>
        {/* Header Title inside card */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-0.2 flex items-center justify-between">
          <span className="text-[8px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">Financial Summary</span>
        </div>

        {/* Small Tighter rows */}
        <div className="flex justify-between items-center text-[9px] font-medium text-gray-500 dark:text-gray-400">
          <span>Taxable:</span>
          <span className="font-semibold text-gray-750 dark:text-gray-300">INR {totals.taxableAmount}</span>
        </div>
        
        <div className="flex justify-between items-center text-[9px] font-medium text-gray-500 dark:text-gray-400">
          <span>Tax (GST):</span>
          <span className="font-semibold text-gray-750 dark:text-gray-300">INR {totals.taxAmount}</span>
        </div>
        
        <div className="flex justify-between items-center text-[9px] font-medium text-gray-500 dark:text-gray-400">
          <span>Round off:</span>
          <input
            type="number"
            step="0.01"
            className={`border rounded px-1 text-[9px] h-4 w-10 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black font-bold'
            }`}
            value={roundOff}
            onChange={(e) => setRoundOff(e.target.value)}
          />
        </div>

        {/* Prominent Net Total Section */}
        <div className="flex justify-between items-center border-t border-dashed border-gray-200 dark:border-gray-800 pt-0.5">
          <span className="text-[9px] font-bold text-gray-700 dark:text-gray-350 uppercase tracking-wide">
             Net Total:
          </span>
          <span className="text-[15px] font-black text-emerald-600 dark:text-emerald-450">
            INR {totals.netTotal}
          </span>
        </div>

        <button
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded text-[9.5px] font-bold py-0.5 mt-0.5 transition-all cursor-pointer shadow-sm"
          onClick={handleSaveInvoice}
        >
          🖨️ Save & Print Invoice
        </button>
      </div>
    </div>
  );
};
