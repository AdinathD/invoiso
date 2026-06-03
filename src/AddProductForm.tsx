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
    <div className={`border-2 border-emerald-500 rounded-xl p-4 mb-3 transition-all duration-300 shadow-md hover:shadow-lg ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/15 text-gray-100' 
        : 'bg-gradient-to-br from-white via-white to-emerald-50/20 text-gray-900'
    }`}>
      
      {/* Header section of the entry card */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <span className="text-[13px] font-extrabold text-emerald-600 dark:text-emerald-450 tracking-wide uppercase">⚡ Quick Product Entry</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">Fill in parameters below to add item to list</span>
        </div>
        
        {/* Dynamic Stock Indicator as a Badge */}
        <div className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
          selectedProduct 
            ? 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/60 animate-pulse' 
            : 'bg-gray-150 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
        }`}>
          {selectedProduct ? `⚠️ Stock: ${selectedProduct.stockLabel}` : 'No Product Selected'}
        </div>
      </div>

      {/* Column Headers / Labels */}
      <div className="grid grid-cols-10 gap-1.5 mb-1 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-0.5">
        <div className="col-span-2">Product Name</div>
        <div className="text-right">Qty</div>
        <div className="text-center">UOM</div>
        <div className="text-right">Price (+GST)</div>
        <div className="text-right">Weight</div>
        <div className="text-right text-gray-350 dark:text-gray-650">Net Rate</div>
        <div className="text-right text-gray-350 dark:text-gray-650">Rate</div>
        <div className="pl-1">GST %</div>
        <div className="text-right text-emerald-600 dark:text-emerald-400">Net Total</div>
        <div className="text-center">Action</div>
      </div>

      <div className="grid grid-cols-10 gap-1.5 items-end">
        {/* Autocomplete Input Search */}
        <div className="relative col-span-2">
          <input
            type="text"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              darkMode 
                ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-emerald-500' 
                : 'border-gray-300 bg-white text-gray-950 placeholder-gray-400 focus:border-emerald-500'
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[180px] overflow-y-auto">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="p-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 text-[11px] hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                  onClick={() => handleSelectProduct(p)}
                >
                  <div className="font-extrabold text-gray-900 dark:text-white">{p.name}</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Stock: <span className="text-red-500 font-bold">{p.stockLabel}</span> | Rate + GST: <span className="text-emerald-500 font-bold">INR {p.priceWithGst.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Qty Input */}
        <div>
          <input
            type="number"
            step="0.01"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-950'
            }`}
            value={activeQty}
            onChange={(e) => handleQtyChange(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* UOM Input */}
        <div>
          <input
            type="text"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full focus:outline-none text-center font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-950'
            }`}
            value={activeUOM}
            onChange={(e) => setActiveUOM(e.target.value)}
            placeholder="PCS"
          />
        </div>

        {/* Price Input */}
        <div>
          <input
            type="number"
            step="0.01"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-950'
            }`}
            value={activePrice}
            onChange={(e) => setActivePrice(e.target.value)}
            placeholder="Price"
          />
        </div>

        {/* Weight Input */}
        <div>
          <input
            type="number"
            step="0.01"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-950'
            }`}
            value={activeNetWt}
            onChange={(e) => setActiveNetWt(e.target.value)}
            placeholder="Weight"
          />
        </div>

        {/* Net Rate (Read Only) */}
        <div>
          <input
            type="text"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full text-right cursor-not-allowed font-semibold ${
              darkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-500'
            }`}
            value={activeCalculated.netRate}
            placeholder="Net Rate"
            disabled
          />
        </div>

        {/* Rate (Read Only) */}
        <div>
          <input
            type="text"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full text-right cursor-not-allowed font-semibold ${
              darkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-500'
            }`}
            value={activeCalculated.rate}
            placeholder="Rate"
            disabled
          />
        </div>

        {/* GST Percent Dropdown */}
        <div>
          <select
            className={`border rounded-lg px-1.5 py-1.5 text-[12.5px] h-9 w-full focus:outline-none font-semibold cursor-pointer focus:ring-1 focus:ring-emerald-500 ${
              darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-950'
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
        <div>
          <input
            type="text"
            className={`border rounded-lg px-2 py-1.5 text-[12.5px] h-9 w-full text-right font-extrabold cursor-not-allowed ${
              darkMode ? 'border-emerald-950 bg-emerald-950/20 text-emerald-400' : 'border-emerald-250 bg-emerald-50/50 text-emerald-600'
            }`}
            value={activeCalculated.net}
            placeholder="Net Total"
            disabled
          />
        </div>

        {/* Action Button */}
        <button
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg text-[12px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all h-9 w-full shadow-sm hover:shadow"
          onClick={handleAddItem}
          title="Add Item to table"
        >
          <Plus size={15} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
