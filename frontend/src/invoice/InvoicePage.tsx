import { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { MasterHeader, InvoiceSidebar } from '../sidebar';
import type { MasterForm } from '../sidebar';
import { AddProductForm } from './AddProductForm';
import { ProductListTable, DEFAULT_CONFIG } from './ProductListTable';
import { SummaryFooter } from './SummaryFooter';
import { Link } from 'react-router-dom';
import type { Product, TableItem, ColumnConfig } from './types';
import { fetchProducts } from '../apiUtils/productsApi';

interface InvoicePageProps {
  form: MasterForm;
  setForm: React.Dispatch<React.SetStateAction<MasterForm>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function InvoicePage({ form, setForm, darkMode, toggleDarkMode }: InvoicePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from backend on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
    }
    loadProducts();
  }, []);

  const [columnConfig, setColumnConfig] = useState<ColumnConfig>(() => {
    try {
      const saved = localStorage.getItem('invoice_column_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CONFIG;
  });

  const toggleColumn = (key: keyof ColumnConfig) => {
    setColumnConfig((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('invoice_column_config', JSON.stringify(updated));
      return updated;
    });
  };

  const resetColumnConfig = () => {
    setColumnConfig(DEFAULT_CONFIG);
    localStorage.setItem('invoice_column_config', JSON.stringify(DEFAULT_CONFIG));
  };

  // Table items state
  const [items, setItems] = useState<TableItem[]>([]);

  // Active Item Entry Row input state
  const [activeSearch, setActiveSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeQty, setActiveQty] = useState('0.00');
  const [activeUOM, setActiveUOM] = useState('PCS');
  const [activePrice, setActivePrice] = useState('0.00');
  const [activeNetWt, setActiveNetWt] = useState('0.00');
  const [activeGstPercent, setActiveGstPercent] = useState('0.00');

  // Editing state for main table items
  const [editingSrNo, setEditingSrNo] = useState<number | null>(null);

  // Logistics form state
  const [hamali, setHamali] = useState('0.00');
  const [freight, setFreight] = useState('0.00');
  const [discPercent, setDiscPercent] = useState('0.00');
  const [salesman, setSalesman] = useState('-- Select --');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transport, setTransport] = useState('');
  const [creditBill, setCreditBill] = useState(false);
  const [note, setNote] = useState('');
  const [salesNotes, setSalesNotes] = useState('Enter sales notes here...');
  const [roundOff, setRoundOff] = useState('0.00');
  const [showSummary, setShowSummary] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleEraseAll = () => {
    if (window.confirm("Are you sure you want to erase all data from the screen?")) {
      setItems([]);
      setForm({
        name: '',
        mobileNo: '',
        remarks: '',
        invoiceNo: 'NHW-2627-0001',
        invoiceDate: new Date().toISOString().split('T')[0],
        balance: '',
        pan: '',
        gst: '',
        gstType: 'CGST/SGST',
        city: '',
        state: '',
        country: '',
        billTo: ''
      });
      setHamali('0.00');
      setFreight('0.00');
      setDiscPercent('0.00');
      setSalesman('-- Select --');
      setVehicleNo('');
      setTransport('');
      setCreditBill(false);
      setNote('');
      setSalesNotes('Enter sales notes here...');
      setRoundOff('0.00');
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleEraseAll();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowDropdown(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const cell = document.querySelector('td[tabindex="0"]') as HTMLElement;
        cell?.focus();
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        setShowSummary(prev => {
          const next = !prev;
          if (next) {
            setTimeout(() => {
              const disc = document.getElementById('summary-discount');
              disc?.focus();
            }, 100);
          }
          return next;
        });
      }
      if (e.key === 'F1' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (showHelp) {
          e.preventDefault();
          setShowHelp(false);
        } else if (showDropdown) {
          e.preventDefault();
          setShowDropdown(false);
        } else if (showSummary) {
          e.preventDefault();
          setShowSummary(false);
        } else if (sidebarOpen) {
          e.preventDefault();
          setSidebarOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showDropdown, showSummary, sidebarOpen]);

  // Calculate Net Rate & Rate & Net dynamically for the active item row
  const activeCalculated = useMemo(() => {
    const qty = parseFloat(activeQty) || 0;
    const priceWithGst = parseFloat(activePrice) || 0;
    const gstPct = parseFloat(activeGstPercent) || 0;

    const rate = priceWithGst / (1 + gstPct / 100);
    const net = qty * priceWithGst;

    return {
      rate: rate.toFixed(2),
      netRate: rate.toFixed(2),
      net: net.toFixed(2)
    };
  }, [activeQty, activePrice, activeGstPercent]);

  // Handlers for Select option choice
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveSearch(product.name);
    setShowDropdown(false);
    setActivePrice(product.price.toString());
    setActiveGstPercent(product.gstPercent.toString());
    setActiveUOM(product.uom);
    setActiveQty('1.00');
    setActiveNetWt(product.defaultWeight ? product.defaultWeight.toString() : '0.00');
  };

  // Auto weight updater when Qty changes in entry row
  const handleQtyChange = (val: string) => {
    setActiveQty(val);
    const numQty = parseFloat(val) || 0;
    if (selectedProduct) {
      setActiveNetWt((numQty * (selectedProduct.defaultWeight || 0)).toFixed(2));
    }
  };

  // Add Item handler
  const handleAddItem = () => {
    if (!activeSearch.trim()) return;

    const newItem: TableItem = {
      srNo: items.length + 1,
      id: selectedProduct?.id || Math.random().toString(),
      name: activeSearch,
      hsn: selectedProduct?.hsn || '10000000',
      quantity: parseFloat(activeQty) || 0,
      uom: activeUOM,
      price: parseFloat(activePrice) || 0,
      netWt: parseFloat(activeNetWt) || 0,
      rate: parseFloat(activeCalculated.rate) || 0,
      netRate: parseFloat(activeCalculated.netRate) || 0,
      gstPercent: parseFloat(activeGstPercent) || 0,
      net: parseFloat(activeCalculated.net) || 0
    };

    setItems([...items, newItem]);

    // Reset entry row
    setActiveSearch('');
    setSelectedProduct(null);
    setActiveQty('0.00');
    setActiveUOM('PCS');
    setActivePrice('0.00');
    setActiveNetWt('0.00');
    setActiveGstPercent('0.00');
  };

  // Delete Item handler
  const handleDeleteItem = (srNo: number) => {
    const updated = items.filter(item => item.srNo !== srNo).map((item, idx) => ({
      ...item,
      srNo: idx + 1
    }));
    setItems(updated);
  };

  // Sum displays
  const totals = useMemo(() => {
    let quantitySum = 0;
    let weightSum = 0;
    let totalTaxable = 0;
    let totalTax = 0;
    let netTotalValue = 0;

    items.forEach(item => {
      quantitySum += item.quantity;
      weightSum += item.netWt;

      const itemNetVal = item.quantity * item.price;
      netTotalValue += itemNetVal;

      const lineTaxable = (item.rate * item.quantity);
      totalTaxable += lineTaxable;
      totalTax += (itemNetVal - lineTaxable);
    });

    const numHamali = parseFloat(hamali) || 0;
    const numFreight = parseFloat(freight) || 0;
    const numDiscPct = parseFloat(discPercent) || 0;
    const numRound = parseFloat(roundOff) || 0;

    const discountAmount = totalTaxable * (numDiscPct / 100);
    const finalTaxable = totalTaxable - discountAmount + numHamali + numFreight;

    const grossTotal = netTotalValue - (netTotalValue * (numDiscPct / 100)) + numHamali + numFreight;
    const finalTotal = grossTotal + numRound;

    return {
      itemsCount: items.length,
      weightSum: weightSum.toFixed(2),
      quantitySum: quantitySum.toFixed(2),
      taxableAmount: finalTaxable.toFixed(2),
      taxAmount: totalTax.toFixed(2),
      netTotal: finalTotal.toFixed(2)
    };
  }, [items, hamali, freight, discPercent, roundOff]);

  const handleSaveInvoice = () => {
    alert(`Invoice Saved Successfully!\n\nInvoice No: ${form.invoiceNo}\nTotal Items: ${totals.itemsCount}\nNet Total: INR ${totals.netTotal}`);

    const match = form.invoiceNo.match(/^(.*-)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const nextNum = parseInt(match[2], 10) + 1;
      const nextInvoiceNo = `${prefix}${String(nextNum).padStart(match[2].length, '0')}`;
      setForm(prev => ({
        ...prev,
        invoiceNo: nextInvoiceNo,
        invoiceDate: new Date().toISOString().split('T')[0]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        invoiceDate: new Date().toISOString().split('T')[0]
      }));
    }
  };

  return (
    <div className="flex w-full min-h-screen transition-colors duration-150 bg-app-bg text-text-main">

      {/* CALLING MODULAR SIDEBAR COMPONENT */}
      <InvoiceSidebar
        form={form}
        onChange={setForm}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onBillToEnter={() => {
          setSidebarOpen(false);
          setTimeout(() => {
            searchInputRef.current?.focus();
            setShowDropdown(true);
          }, 50);
        }}
      />

      <div className="flex-1 min-w-0 p-2.5 transition-all duration-300 ease-in-out w-full min-h-screen md:h-screen flex flex-col overflow-y-auto md:overflow-hidden bg-panel-bg">
        {/* App Nav Bar */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-2 py-1.5 border-b border-border-sec mb-1.5 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-text-acc" />
            <span className="text-app-lg font-bold tracking-wide text-text-main">
              Invoiso.ai
            </span>
            <span className="text-app-xs bg-info-badge-bg text-info-badge-text px-1 py-0.5 rounded font-bold">Invoice Editor</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-app-sm text-text-mute hidden sm:inline">Wholesale Credit Terminal</span>
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <Link
                to="/pos"
                className="px-2 py-1 bg-border-acc/20 hover:bg-border-acc/35 text-text-acc text-app-xs font-extrabold rounded border border-border-acc/40 transition-all cursor-pointer"
              >
                🖥️ Switch to Wholesale POS
              </Link>
              <button
                className="px-2 py-0.5 rounded text-app-base font-semibold flex items-center gap-1 cursor-pointer transition-all border border-border-sec bg-text-main text-panel-bg"
                onClick={toggleDarkMode}
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button
                className="bg-alert hover:opacity-90 text-white rounded text-app-base font-semibold flex items-center justify-center transition-all h-5 px-2 cursor-pointer gap-1"
                onClick={handleEraseAll}
                title="Erase all data (Alt + E)"
              >
                🗑️ Erase Screen
              </button>
            </div>
          </div>
        </header>

        {/* CALLING MODULAR MASTER HEADER COMPONENT */}
        <div className="shrink-0">
          <MasterHeader
            form={form}
            onChange={setForm}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(true)}
            columnConfig={columnConfig}
            toggleColumn={toggleColumn}
            resetColumnConfig={resetColumnConfig}
          />
        </div>

        {/* CALLING MODULAR PRODUCTS LIST TABLE */}
        <div className="flex-1 min-h-0 overflow-hidden mb-1">
          <ProductListTable
            items={items}
            setItems={setItems}
            editingSrNo={editingSrNo}
            setEditingSrNo={setEditingSrNo}
            handleDeleteItem={handleDeleteItem}
            columnConfig={columnConfig}
          />
        </div>


        {/* CALLING MODULAR ADD PRODUCT FORM COMPONENT */}
        <div className="shrink-0">
          <AddProductForm
            products={products}
            activeSearch={activeSearch}
            setActiveSearch={setActiveSearch}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            selectedProduct={selectedProduct}
            handleSelectProduct={handleSelectProduct}
            activeQty={activeQty}
            handleQtyChange={handleQtyChange}
            activeUOM={activeUOM}
            setActiveUOM={setActiveUOM}
            activePrice={activePrice}
            setActivePrice={setActivePrice}
            activeNetWt={activeNetWt}
            setActiveNetWt={setActiveNetWt}
            activeGstPercent={activeGstPercent}
            setActiveGstPercent={setActiveGstPercent}
            activeCalculated={activeCalculated}
            handleAddItem={handleAddItem}
            searchInputRef={searchInputRef}
          />
        </div>

        {/* CALLING MODULAR SUMMARY FOOTER COMPONENT */}
        <div className="shrink-0">
          <SummaryFooter
            totals={totals}
            hamali={hamali}
            setHamali={setHamali}
            freight={freight}
            setFreight={setFreight}
            discPercent={discPercent}
            setDiscPercent={setDiscPercent}
            salesman={salesman}
            setSalesman={setSalesman}
            vehicleNo={vehicleNo}
            setVehicleNo={setVehicleNo}
            transport={transport}
            setTransport={setTransport}
            creditBill={creditBill}
            setCreditBill={setCreditBill}
            note={note}
            setNote={setNote}
            salesNotes={salesNotes}
            setSalesNotes={setSalesNotes}
            roundOff={roundOff}
            setRoundOff={setRoundOff}
            handleSaveInvoice={handleSaveInvoice}
            showSummary={showSummary}
            onToggleSummary={() => setShowSummary(!showSummary)}
          />
        </div>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowHelp(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
        >
          <div
            className="w-full max-w-2xl bg-panel-bg text-text-main border border-border-sec rounded-lg shadow-2xl p-5 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 p-1 rounded-md text-text-mute hover:bg-app-bg hover:text-text-main transition-colors cursor-pointer"
              onClick={() => setShowHelp(false)}
              aria-label="Close keyboard shortcuts"
            >
              <X size={16} />
            </button>

            <h2 id="help-title" className="text-app-lg font-bold text-text-acc mb-4 flex items-center gap-2 border-b border-border-main pb-2">
              ⌨️ Keyboard Shortcuts Help
            </h2>

            <div className="text-app-base space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:border-r sm:border-border-sec/40 sm:pr-6">
                  <h3 className="text-app-sm font-black tracking-wider uppercase text-text-mute mb-2">Navigation</h3>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Search Product</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-text-acc">Ctrl + P / F</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Focus Grid</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + K</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-text-main">Toggle Sidebar</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + B</kbd>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-app-sm font-black tracking-wider uppercase text-text-mute mb-2">Invoice</h3>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-alert">Clear Screen</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-alert">Alt + E</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Summary</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + G / J</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-text-main">Help Menu</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-text-acc">F1</kbd>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-main/60 pt-3 space-y-2">
                <h3 className="text-app-sm font-black tracking-wider uppercase text-text-mute mb-1.5">Grid Interactions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Edit Row / Cell</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Navigate Cells</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Arrow Keys</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Previous Field</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Shift + Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Save / Close Edit</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Enter / Esc</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 sm:border-b-0 py-1">
                    <span className="font-bold text-text-main">Delete Row</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Delete</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-text-main">Close Dialogs/Menus</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Escape</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border-main text-[11px] text-text-mute text-center font-medium">
              Press <span className="font-bold text-text-acc">Escape</span> at any time to close help
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
