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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 border-t border-border-main pt-1 text-text-main">
      {/* Left Logistics Block */}
      <div className="md:col-span-6 flex flex-col gap-2">
        {/* Numeric and summary charge fields - compactly packed */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Items</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-disabled-bg text-inp-disabled-text rounded px-1 py-0.2 text-app-base h-6 w-11 text-center cursor-not-allowed font-bold"
              value={totals.itemsCount}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Weight</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-disabled-bg text-inp-disabled-text rounded px-1 py-0.2 text-app-base h-6 w-18 text-right cursor-not-allowed font-bold"
              value={totals.weightSum}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Quantity</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-disabled-bg text-inp-disabled-text rounded px-1 py-0.2 text-app-base h-6 w-18 text-right cursor-not-allowed font-bold"
              value={totals.quantitySum}
              disabled
            />
          </div>
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Disc(%)</span>
            <input
              type="number"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.2 text-app-base h-6 w-14 text-right focus:outline-none font-bold"
              value={discPercent}
              onChange={(e) => setDiscPercent(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Hamali(+)</span>
            <input
              type="number"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.2 text-app-base h-6 w-18 text-right focus:outline-none font-bold"
              value={hamali}
              onChange={(e) => setHamali(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-app-sm font-bold text-text-main">Freight(+)</span>
            <input
              type="number"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.2 text-app-base h-6 w-18 text-right focus:outline-none font-bold"
              value={freight}
              onChange={(e) => setFreight(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 mt-3.5 pl-1 col-span-1">
            <input
              type="checkbox"
              id="creditBill"
              checked={creditBill}
              onChange={(e) => setCreditBill(e.target.checked)}
            />
            <label htmlFor="creditBill" className="text-app-sm font-bold cursor-pointer text-text-main">
              Credit Bill
            </label>
          </div>
        </div>

        {/* Larger operational fields - expanding to fill columns cleanly */}
        <div className="grid grid-cols-12 gap-1.5">
          <div className="flex flex-col col-span-12 sm:col-span-3">
            <span className="text-app-sm font-bold text-text-main">Salesman</span>
            <select
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-0.2 text-app-base h-6 w-full focus:outline-none font-bold focus:border-border-acc cursor-pointer"
              value={salesman}
              onChange={(e) => setSalesman(e.target.value)}
            >
              <option>-- Select --</option>
              <option>ABC </option>
              <option>XYZ</option>
            </select>
          </div>
          <div className="flex flex-col col-span-12 sm:col-span-3">
            <span className="text-app-sm font-bold text-text-main">Vehicle No</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-0.2 text-app-base h-6 w-full focus:outline-none font-bold focus:border-border-acc"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </div>
          <div className="flex flex-col col-span-12 sm:col-span-3">
            <span className="text-app-sm font-bold text-text-main">Transport</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-0.2 text-app-base h-6 w-full focus:outline-none font-bold focus:border-border-acc"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
          </div>
          <div className="flex flex-col col-span-12 sm:col-span-3">
            <span className="text-app-sm font-bold text-text-main">Note</span>
            <input
              type="text"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-0.2 text-app-base h-6 w-full focus:outline-none font-semibold placeholder-text-mute focus:border-border-acc"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note text..."
            />
          </div>
        </div>
      </div>

      {/* Center Block (Sales Notes) */}
      <div className="md:col-span-3 flex flex-col">
        <span className="text-app-sm font-bold text-text-main">Sales Notes</span>
        <input
          type="text"
          className="border border-inp-border bg-inp-bg text-inp-text rounded px-1.5 py-0.2 text-app-base h-6 w-full focus:outline-none font-bold"
          value={salesNotes}
          onChange={(e) => setSalesNotes(e.target.value)}
          placeholder="Sales notes..."
        />
      </div>

      {/* Right Calculations Card - Elevated & Highlighted */}
      <div className="md:col-span-3 border border-border-acc/20 rounded p-1 flex flex-col gap-1.5 bg-panel-bg text-text-main justify-between h-full">
        {/* Row 1: Taxable and Tax (GST) side by side */}
        <div className="flex justify-between items-center text-app-xxs font-medium text-text-sec px-0.5">
          <div className="flex gap-1">
            <span>Taxable:</span>
            <span className="font-semibold text-text-main">INR {totals.taxableAmount}</span>
          </div>
          <div className="flex gap-1">
            <span>Tax (GST):</span>
            <span className="font-semibold text-text-main">INR {totals.taxAmount}</span>
          </div>
        </div>

        {/* Row 2: Round off and Net Total side by side */}
        <div className="flex justify-between items-center border-t border-dashed border-border-sec pt-1 px-0.5">
          <div className="flex items-center gap-1 text-app-xxs font-medium text-text-sec">
            <span>Round off:</span>
            <input
              type="number"
              step="0.01"
              className="border border-inp-border bg-inp-bg text-inp-text rounded px-0.5 text-app-xxs h-3.5 w-9 text-right focus:outline-none focus:ring-1 focus:ring-border-acc font-bold"
              value={roundOff}
              onChange={(e) => setRoundOff(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 text-app-xxs font-bold text-text-sec">
            <span className="uppercase tracking-wide">Net:</span>
            <span className="text-[18px] font-black text-text-acc">INR {totals.netTotal}</span>
          </div>
        </div>

        {/* Row 3: Action Button */}
        <button
          className="w-full bg-border-acc hover:bg-emerald-600 active:scale-[0.98] text-white rounded text-app-base font-bold py-0.5 transition-all cursor-pointer shadow-sm"
          onClick={handleSaveInvoice}
        >
          🖨️ Save & Print Invoice
        </button>
      </div>
    </div>
  );
};
