import React from 'react';
import { Plus } from 'lucide-react';
import { useKeyboardField, useKeyboardRegistry } from './KeyboardRegistryContext';

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
}) => {
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { handleGroupTraversal, focusField } = useKeyboardRegistry();

  const filteredProducts = React.useMemo(() => {
    if (!activeSearch) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(activeSearch.toLowerCase())
    );
  }, [activeSearch, products]);

  React.useEffect(() => {
    setActiveIdx(-1);
  }, [activeSearch, showDropdown]);

  // Field registrations
  const searchInputRef = useKeyboardField({
    id: 'productSearch',
    group: 'addProductForm',
    onEnter: () => {
      if (showDropdown && activeIdx >= 0 && activeIdx < filteredProducts.length) {
        handleSelectProduct(filteredProducts[activeIdx]);
        setActiveIdx(-1);
        focusField('qty');
        return true; // prevent default group traversal
      }
    }
  });

  const qtyRef = useKeyboardField({
    id: 'qty',
    group: 'addProductForm'
  });

  const uomRef = useKeyboardField({
    id: 'uom',
    group: 'addProductForm'
  });

  const priceRef = useKeyboardField({
    id: 'price',
    group: 'addProductForm'
  });

  const weightRef = useKeyboardField({
    id: 'weight',
    group: 'addProductForm'
  });

  const gstRef = useKeyboardField({
    id: 'gst',
    group: 'addProductForm',
    onEnter: (e) => {
      if (!e.shiftKey) {
        handleAddItem();
        focusField('productSearch');
        return true; // prevent default group traversal
      }
    }
  });

  const addBtnRef = useKeyboardField({
    id: 'addButton',
    group: 'addProductForm',
    onEnter: (e) => {
      if (!e.shiftKey) {
        handleAddItem();
        focusField('productSearch');
        return true; // prevent default group traversal
      }
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      if (showDropdown) {
        e.stopPropagation();
        setShowDropdown(false);
      }
      return;
    }

    // Call standard Enter/Shift+Enter traversal using the registry group
    handleGroupTraversal(e, 'addProductForm');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showDropdown && filteredProducts.length > 0) {
      e.preventDefault();
      setActiveIdx(prev => {
        const next = prev + 1 >= filteredProducts.length ? 0 : prev + 1;
        const itemEl = dropdownRef.current?.children[next] as HTMLElement;
        itemEl?.scrollIntoView({ block: 'nearest' });
        return next;
      });
      return;
    }
    if (e.key === 'ArrowUp' && showDropdown && filteredProducts.length > 0) {
      e.preventDefault();
      setActiveIdx(prev => {
        const next = prev - 1 < 0 ? filteredProducts.length - 1 : prev - 1;
        const itemEl = dropdownRef.current?.children[next] as HTMLElement;
        itemEl?.scrollIntoView({ block: 'nearest' });
        return next;
      });
      return;
    }
  };

  return (
    <div 
      onKeyDown={handleKeyDown}
      className="border border-border-acc/20 rounded p-1 mb-1 transition-all duration-300 shadow-sm bg-panel-bg text-text-main"
    >
      <div className="grid grid-cols-12 gap-1 items-end">
        {/* Autocomplete Input Search */}
        <div className="relative col-span-12 md:col-span-3 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block ml-0.5" htmlFor="product-search-input">Product Name</label>
          <input
            id="product-search-input"
            ref={searchInputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown && filteredProducts.length > 0}
            aria-controls="product-dropdown-list"
            aria-activedescendant={activeIdx !== -1 ? `product-opt-${filteredProducts[activeIdx].id}` : undefined}
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full font-medium focus:outline-none focus:ring-1 focus:ring-border-acc"
            value={activeSearch}
            placeholder="Search / select item..."
            onChange={(e) => {
              setActiveSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {showDropdown && filteredProducts.length > 0 && (
            <div 
              id="product-dropdown-list"
              role="listbox"
              ref={dropdownRef}
              className="absolute bottom-full left-0 right-0 mb-1 bg-panel-bg border border-border-sec rounded shadow-xl z-50 max-h-[150px] overflow-y-auto"
            >
              {filteredProducts.map((p, idx) => (
                <div
                  id={`product-opt-${p.id}`}
                  role="option"
                  aria-selected={idx === activeIdx}
                  key={p.id}
                  className={`p-1.5 cursor-pointer border-b border-border-main text-app-sm transition-colors ${idx === activeIdx ? 'bg-emerald-light' : 'hover:bg-emerald-light'}`}
                  onClick={() => {
                    handleSelectProduct(p);
                    setActiveIdx(-1);
                    focusField('qty');
                  }}
                >
                  <div className="font-extrabold text-text-main">{p.name}</div>
                  <div className="text-app-xs text-text-mute mt-0.5">
                    Stock: <span className="text-alert font-bold">{p.stockLabel}</span> | Rate + GST: <span className="text-text-acc font-bold">INR {p.priceWithGst.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Qty Input */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Qty</label>
          <input
            ref={qtyRef}
            type="number"
            step="0.01"
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-border-acc"
            value={activeQty}
            onChange={(e) => handleQtyChange(e.target.value)}
            placeholder="Qty"
          />
        </div>

        {/* UOM Input */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-center">UOM</label>
          <input
            ref={uomRef}
            type="text"
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full focus:outline-none text-center font-semibold focus:ring-1 focus:ring-border-acc"
            value={activeUOM}
            onChange={(e) => setActiveUOM(e.target.value)}
            placeholder="UOM"
          />
        </div>

        {/* Price Input */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Price (+GST)</label>
          <input
            ref={priceRef}
            type="number"
            step="0.01"
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-border-acc"
            value={activePrice}
            onChange={(e) => setActivePrice(e.target.value)}
            placeholder="Price"
          />
        </div>

        {/* Weight Input */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Weight</label>
          <input
            ref={weightRef}
            type="number"
            step="0.01"
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full focus:outline-none text-right font-semibold focus:ring-1 focus:ring-border-acc"
            value={activeNetWt}
            onChange={(e) => setActiveNetWt(e.target.value)}
            placeholder="Weight"
          />
        </div>

        {/* Net Rate (Read Only) */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Net Rate</label>
          <input
            type="text"
            className="border border-inp-border bg-inp-disabled-bg text-inp-disabled-text rounded px-1 py-0.1 text-app-base h-[26px] w-full text-right cursor-not-allowed font-semibold"
            value={activeCalculated.netRate}
            placeholder="Net Rate"
            disabled
          />
        </div>

        {/* Rate (Read Only) */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Rate</label>
          <input
            type="text"
            className="border border-inp-border bg-inp-disabled-bg text-inp-disabled-text rounded px-1 py-0.1 text-app-base h-[26px] w-full text-right cursor-not-allowed font-semibold"
            value={activeCalculated.rate}
            placeholder="Rate"
            disabled
          />
        </div>

        {/* GST Percent Dropdown */}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-center">GST %</label>
          <select
            ref={gstRef}
            className="border border-inp-border bg-inp-bg text-inp-text rounded px-1 py-0.1 text-app-base h-[26px] w-full focus:outline-none font-semibold cursor-pointer focus:ring-1 focus:ring-border-acc"
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
        <div className="col-span-6 sm:col-span-4 md:col-span-1 flex flex-col gap-0.5">
          <label className="text-app-sm font-bold text-text-sec block text-right pr-0.5">Net Total</label>
          <input
            type="text"
            className="border border-border-acc bg-emerald-light text-text-acc rounded px-1 py-0.1 text-app-base h-[26px] w-full text-right font-extrabold cursor-not-allowed"
            value={activeCalculated.net}
            placeholder="Net Total"
            disabled
          />
        </div>

        {/* Action Button - Icon Only */}
        <div className="col-span-12 sm:col-span-4 md:col-span-1">
          <button
            ref={addBtnRef}
            className="bg-border-acc hover:bg-action-hover active:scale-95 text-white rounded text-app-base font-bold cursor-pointer flex items-center justify-center transition-all h-[26px] w-full shadow-sm"
            onClick={handleAddItem}
            title="Add Item to table"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Stock badge relocated beneath inputs to the bottom-right */}
      <div className="flex justify-end mt-0.5 text-app-xs pr-0.5">
        <span className={`font-bold ${selectedProduct
          ? 'text-alert'
          : 'text-text-mute'
          }`}>
          {selectedProduct ? `⚠️ Stock: ${selectedProduct.stockLabel}` : 'No Product Selected / Inventory'}
        </span>
      </div>
    </div>
  );
};

