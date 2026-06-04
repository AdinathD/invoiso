import React from 'react';
import { Plus } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  hsn: string;
  priceWithGst: number;
  gstPercent: number;
  uom: string;
  stockLabel: string;
  defaultWeight: number;
}

interface AddProductFormProps {
  products: Product[];
  activeSearch: string;
  setActiveSearch: (val: string) => void;
  showDropdown: boolean;
  setShowDropdown: (val: boolean) => void;
  selectedProduct: Product | null;
  handleSelectProduct: (p: Product) => void;
  activeQty: string;
  handleQtyChange: (val: string) => void;
  activeUOM: string;
  setActiveUOM: (val: string) => void;
  activePrice: string;
  setActivePrice: (val: string) => void;
  activeNetWt: string;
  setActiveNetWt: (val: string) => void;
  activeGstPercent: string;
  setActiveGstPercent: (val: string) => void;
  activeCalculated: { rate: string; netRate: string; net: string };
  handleAddItem: () => void;
  darkMode?: boolean;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  products,
  activeSearch,
  setActiveSearch,
  showDropdown,
  setShowDropdown,
  selectedProduct,
  handleSelectProduct,
  activeQty,
  handleQtyChange,
  activeUOM,
  setActiveUOM,
  activePrice,
  setActivePrice,
  activeNetWt,
  setActiveNetWt,
  activeGstPercent,
  setActiveGstPercent,
  activeCalculated,
  handleAddItem,
  darkMode,
}) => {
  const filteredProducts = React.useMemo(() => {
    if (!activeSearch) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(activeSearch.toLowerCase())
    );
  }, [activeSearch, products]);

  return (
    <div className={`border border-emerald-500/20 rounded p-1 mb-1 transition-all duration-300 shadow-sm ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/5 text-gray-100' 
        : 'bg-gradient-to-br from-white via-white to-emerald-50/5 text-gray-900'
    }`}>
 
      <div className="grid grid-cols-12 gap-1 items-end">
        {/* Autocomplete Input Search */}
        <div className="relative col-span-3 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block ml-0.5">Product Name</label>
          <input
            type="text"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              darkMode 
                ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-550 focus:border-emerald-500' 
                : 'border-gray-300 bg-white text-gray-955 placeholder-gray-400 focus:border-emerald-500'
            }`}
            value={activeSearch}
            placeholder="Search / select item..."
            onChange={(e) => {
              setActiveSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredProducts.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded shadow-xl z-50 max-h-[150px] overflow-y-auto">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="p-1.5 cursor-pointer border-b border-gray-100 dark:border-gray-700 text-[10.5px] hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                  onClick={() => handleSelectProduct(p)}
                >
                  <div className="font-extrabold text-gray-900 dark:text-white">{p.name}</div>
                  <div className="text-[9px] text-gray-555 dark:text-gray-400 mt-0.5">
                    Stock: <span className="text-red-500 font-bold">{p.stockLabel}</span> | Rate + GST: <span className="text-emerald-500 font-bold">INR {p.priceWithGst.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Qty Input */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Qty</label>
          <input
            type="number"
            step="0.01"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-955'
            }`}
            value={activeQty}
            onChange={(e) => handleQtyChange(e.target.value)}
            placeholder="Qty"
          />
        </div>
 
        {/* UOM Input */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-center">UOM</label>
          <input
            type="text"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full focus:outline-none text-center font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-955'
            }`}
            value={activeUOM}
            onChange={(e) => setActiveUOM(e.target.value)}
            placeholder="UOM"
          />
        </div>
 
        {/* Price Input */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Price (+GST)</label>
          <input
            type="number"
            step="0.01"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-955'
            }`}
            value={activePrice}
            onChange={(e) => setActivePrice(e.target.value)}
            placeholder="Price"
          />
        </div>
 
        {/* Weight Input */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Weight</label>
          <input
            type="number"
            step="0.01"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-955'
            }`}
            value={activeNetWt}
            onChange={(e) => setActiveNetWt(e.target.value)}
            placeholder="Weight"
          />
        </div>
 
        {/* Net Rate (Read Only) */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Net Rate</label>
          <input
            type="text"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full text-right cursor-not-allowed font-semibold ${
              darkMode ? 'border-gray-800 bg-gray-955 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-500'
            }`}
            value={activeCalculated.netRate}
            placeholder="Net Rate"
            disabled
          />
        </div>
 
        {/* Rate (Read Only) */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Rate</label>
          <input
            type="text"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full text-right cursor-not-allowed font-semibold ${
              darkMode ? 'border-gray-800 bg-gray-955 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-500'
            }`}
            value={activeCalculated.rate}
            placeholder="Rate"
            disabled
          />
        </div>
 
        {/* GST Percent Dropdown */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-center">GST %</label>
          <select
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full focus:outline-none font-semibold cursor-pointer focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-955'
            }`}
            value={activeGstPercent}
            onChange={(e) => setActiveGstPercent(e.target.value)}
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>
 
        {/* Net Total (Read Only) */}
        <div className="col-span-1 flex flex-col gap-0.5">
          <label className="text-[9.5px] font-bold text-gray-550 dark:text-gray-400 block text-right pr-0.5">Net Total</label>
          <input
            type="text"
            className={`border rounded px-1 py-0.1 text-[11.5px] h-[26px] w-full text-right font-extrabold cursor-not-allowed ${
              darkMode ? 'border-emerald-950 bg-emerald-950/20 text-emerald-400' : 'border-emerald-250 bg-emerald-50/50 text-emerald-600'
            }`}
            value={activeCalculated.net}
            placeholder="Net Total"
            disabled
          />
        </div>
 
        {/* Action Button - Icon Only */}
        <div className="col-span-1">
          <button
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded text-[11.5px] font-bold cursor-pointer flex items-center justify-center transition-all h-[26px] w-full shadow-sm"
            onClick={handleAddItem}
            title="Add Item to table"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>
 
      {/* Stock badge relocated beneath inputs to the bottom-right */}
      <div className="flex justify-end mt-0.5 text-[8.5px] pr-0.5">
        <span className={`font-bold ${
          selectedProduct 
            ? 'text-red-500 dark:text-red-400' 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {selectedProduct ? `⚠️ Stock: ${selectedProduct.stockLabel}` : 'No Product Selected / Inventory'}
        </span>
      </div>
    </div>
  );
};
