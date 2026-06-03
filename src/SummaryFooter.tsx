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
    <div className="grid grid-cols-1 md:grid-cols-10 gap-2 border-t border-gray-300 dark:border-gray-700 pt-2 text-black dark:text-white">
      {/* Left Logistics Block - Made Smaller */}
      <div className="md:col-span-4 grid grid-cols-3 gap-x-1.5 gap-y-1.5">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Items</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-center cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.itemsCount}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Weight</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-right cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.weightSum}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Quantity</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-right cursor-not-allowed ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-400 bg-gray-100 text-black font-bold'}`}
            value={totals.quantitySum}
            disabled
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Hamali(+)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={hamali}
            onChange={(e) => setHamali(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Freight(+)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Disc(%)</span>
          <input
            type="number"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full text-right focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={discPercent}
            onChange={(e) => setDiscPercent(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Salesman</span>
          <select
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={salesman}
            onChange={(e) => setSalesman(e.target.value)}
          >
            <option>-- Select --</option>
            <option>ABC </option>
            <option>XYZ</option>
          </select>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Vehicle No</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Transport</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
          />
        </div>

        <div className="col-span-3 flex items-center gap-1.5 h-4">
          <input
            type="checkbox"
            id="creditBill"
            checked={creditBill}
            onChange={(e) => setCreditBill(e.target.checked)}
          />
          <label htmlFor="creditBill" className="text-[9px] font-bold cursor-pointer" style={{ color: darkMode ? '#ffffff' : '#000000' }}>
            Credit Bill
          </label>
        </div>

        <div className="flex flex-col col-span-3">
          <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Note</span>
          <input
            type="text"
            className={`border rounded px-1 py-0.5 text-[10.5px] h-5 w-full focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-400 bg-white text-black font-bold placeholder-black'}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note text..."
          />
        </div>
      </div>

      {/* Center Block (Sales Notes) - Height reduced */}
      <div className="md:col-span-3 flex flex-col">
        <span className="text-[9px] font-bold mb-0.5" style={{ color: darkMode ? '#ffffff' : '#000000' }}>Sales Notes</span>
        <textarea
          className={`border rounded p-1 text-[10.5px] resize-none flex-grow h-16 focus:outline-none ${darkMode ? 'border-gray-600 bg-gray-900 text-white' : 'border-gray-400 bg-white text-black font-bold'}`}
          value={salesNotes}
          onChange={(e) => setSalesNotes(e.target.value)}
        />
      </div>

      {/* Right Calculations Card - Elevated & Highlighted - Tighter padding & gaps */}
      <div className={`md:col-span-3 border-2 rounded-xl p-2.5 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-xl ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-emerald-500/40 shadow-[0_6px_18px_-4px_rgba(16,185,129,0.15)] text-gray-150' 
          : 'bg-gradient-to-b from-emerald-50/50 via-emerald-50/20 to-white border-emerald-500 shadow-[0_5px_15px_-3px_rgba(16,185,129,0.12)] text-gray-900'
      }`}>
        {/* Header Title inside card */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-1 mb-0.5 flex items-center justify-between">
          <span className="text-[8.5px] font-extrabold tracking-widest text-emerald-600 dark:text-emerald-450 uppercase">Financial Summary</span>
          <span className="text-[8px] px-1 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold">Final Totals</span>
        </div>

        <div className="flex justify-between items-center text-[10.5px] font-semibold">
          <span className="text-gray-500 dark:text-gray-400">Taxable Amount:</span>
          <span className="font-bold text-gray-800 dark:text-gray-400">INR {totals.taxableAmount}</span>
        </div>
        
        <div className="flex justify-between items-center text-[10.5px] font-semibold">
          <span className="text-gray-500 dark:text-gray-400">Tax Amount (GST):</span>
          <span className="font-bold text-gray-800 dark:text-gray-400">INR {totals.taxAmount}</span>
        </div>
        
        <div className="flex justify-between items-center text-[10.5px] font-semibold">
          <span className="text-gray-500 dark:text-gray-400">Round off:</span>
          <input
            type="number"
            step="0.01"
            className={`border rounded px-1.5 text-[10.5px] h-5 w-16 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black font-bold'
            }`}
            value={roundOff}
            onChange={(e) => setRoundOff(e.target.value)}
          />
        </div>

        {/* Highlighted Net Total Section */}
        <div className="flex justify-between items-center border-t border-dashed border-gray-300 dark:border-gray-800 pt-1.5 mt-0.5">
          <span className="text-[11.5px] font-black text-gray-900 dark:text-white uppercase tracking-wider">
             Net Total:
          </span>
          <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 underline decoration-double decoration-emerald-500/40">
            INR {totals.netTotal}
          </span>
        </div>

        <button
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-lg text-[11px] font-bold py-1.5 mt-1.5 transition-all cursor-pointer shadow-md hover:shadow-lg"
          onClick={handleSaveInvoice}
        >
          🖨️ Save & Print Invoice
        </button>
      </div>
    </div>
  );
};
