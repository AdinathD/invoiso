import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, Home, Menu, X } from 'lucide-react';
import { InvoiceSidebar } from '../sidebar';
import type { MasterForm } from '../sidebar';
import { Link } from 'react-router-dom';
import { AddProductModal } from '../AddProductModal';
import { createInvoice, fetchNextInvoiceNumber } from '../apiUtils/invoicesApi';

// Import local POS components
import { POSProductGrid } from './POSProductGrid';
import { POSCartSummary } from './POSCartSummary';
import type { POSProduct, CartItem } from './types';
import { handleEnterTraversal } from '../keyboardUtils';
import { fetchProducts } from '../apiUtils/productsApi';
import { PrintInvoiceModal } from '../print/PrintInvoiceModal';
import type { TableItem } from '../invoice/types';

interface WholesalePOSPageProps {
  form: MasterForm;
  setForm: React.Dispatch<React.SetStateAction<MasterForm>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function WholesalePOSPage({ form, setForm, darkMode, toggleDarkMode }: WholesalePOSPageProps) {
  // Sidebar State (matches proportion and toggle behavior of InvoicePage)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Printing states
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSnapshot, setPrintSnapshot] = useState<{
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
    hamali: string;
    freight: string;
    discPercent: string;
    salesman: string;
    vehicleNo: string;
    transport: string;
    roundOff: string;
    note: string;
  } | null>(null);


  // POS Products State loaded from JSON
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showHelp, setShowHelp] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Categories list
  const categories = ['All', 'Rice', 'Oil', 'Flour', 'Salt', 'Pulses'];

  // Fetch products and next invoice number from backend on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
      }
      try {
        const nextNo = await fetchNextInvoiceNumber();
        setForm(prev => ({ ...prev, invoiceNo: nextNo }));
      } catch (err) {
        console.error("Error loading next invoice number:", err);
      }
    }
    loadInitialData();
  }, [setForm]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.hsn.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const handleAddToCart = (product: POSProduct) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, amount: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Calculate cart totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTaxable = 0;
    let totalGst = 0;
    let totalItems = 0;
    let totalWeight = 0;

    cart.forEach(item => {
      const lineTotal = item.product.price * item.quantity;
      const gstFactor = item.product.gstPercent / 100;
      const lineTaxable = lineTotal / (1 + gstFactor);
      const lineGst = lineTotal - lineTaxable;

      subtotal += lineTotal;
      totalTaxable += lineTaxable;
      totalGst += lineGst;
      totalItems += item.quantity;

      const weightMatch = item.product.name.match(/\[(\d+)\s*KG\]/i);
      const unitWeight = weightMatch ? parseFloat(weightMatch[1]) : 1;
      totalWeight += unitWeight * item.quantity;
    });

    const discount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discount;
    const finalTaxable = totalTaxable - (totalTaxable * (discountPercent / 100));

    return {
      subtotal: subtotal.toFixed(2),
      taxableAmount: finalTaxable.toFixed(2),
      gst: totalGst.toFixed(2),
      discount: discount.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      totalItems,
      grandTotal: grandTotal.toFixed(2)
    };
  }, [cart, discountPercent]);

  const handleAction = async (type: string) => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      const items = cart.map((item, index) => {
        const quantity = item.quantity;
        const product = item.product;
        const priceWithGst = product.price;
        const gstPct = product.gstPercent;
        const rate = priceWithGst / (1 + gstPct / 100);
        const net = quantity * priceWithGst;
        const netWt = quantity * (product.defaultWeight || 0);

        return {
          srNo: index + 1,
          id: product.id,
          name: product.name,
          hsn: product.hsn,
          quantity,
          uom: product.uom,
          price: priceWithGst,
          netWt,
          rate,
          netRate: rate,
          gstPercent: gstPct,
          net
        };
      });

      // Calculate taxable amount and tax amount
      let taxableAmountSum = 0;
      let taxAmountSum = 0;
      items.forEach(item => {
        const lineTaxable = item.rate * item.quantity;
        taxableAmountSum += lineTaxable;
        taxAmountSum += (item.net - lineTaxable);
      });

      await createInvoice({
        masterForm: {
          ...form,
          name: form.name || 'Walk-in',
          invoiceDate: form.invoiceDate || new Date().toISOString().split('T')[0]
        },
        items,
        totals: {
          taxableAmount: parseFloat((taxableAmountSum - (taxableAmountSum * (discountPercent / 100))).toFixed(2)),
          taxAmount: parseFloat(taxAmountSum.toFixed(2)),
          netTotal: parseFloat(totals.grandTotal)
        }
      });

      alert(`${type} completed successfully!\n\nCustomer: ${form.name || 'Walk-in'}\nTotal Items: ${totals.totalItems}\nGrand Total: INR ${totals.grandTotal}`);

      // Save a snapshot for printing before clearing the cart
      if (type === 'Save & Print') {
        const netWtSum = items.reduce((sum, item) => sum + (item.netWt || 0), 0);
        const qtySum = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setPrintSnapshot({
          form: {
            ...form,
            name: form.name || 'Walk-in',
            invoiceDate: form.invoiceDate || new Date().toISOString().split('T')[0]
          },
          items,
          totals: {
            itemsCount: items.length,
            weightSum: netWtSum.toFixed(2),
            quantitySum: qtySum.toFixed(2),
            taxableAmount: (taxableAmountSum - (taxableAmountSum * (discountPercent / 100))).toFixed(2),
            taxAmount: taxAmountSum.toFixed(2),
            netTotal: parseFloat(totals.grandTotal).toFixed(2)
          },
          hamali: '0.00',
          freight: '0.00',
          discPercent: discountPercent.toString(),
          salesman: '-- Select --',
          vehicleNo: '',
          transport: '',
          roundOff: '0.00',
          note: form.remarks || ''
        });
        setIsPrintModalOpen(true);
      }

      // Clear cart on success
      setCart([]);


      // Fetch the next invoice number from database
      try {
        const nextNo = await fetchNextInvoiceNumber();
        setForm(prev => ({
          ...prev,
          invoiceNo: nextNo,
          invoiceDate: new Date().toISOString().split('T')[0]
        }));
      } catch (err) {
        console.error("Error loading next invoice number:", err);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Failed to complete action: ${error.message || error}`);
    }
  };

  const handleEraseAll = async () => {
    if (window.confirm("Are you sure you want to erase all data from the POS screen?")) {
      setCart([]);
      let nextNo = 'NHW-2627-0001';
      try {
        nextNo = await fetchNextInvoiceNumber();
      } catch (err) {
        console.error("Error loading next invoice number:", err);
      }
      setForm({
        name: '',
        mobileNo: '',
        remarks: '',
        invoiceNo: nextNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        balance: '',
        pan: '',
        gst: '',
        gstType: 'CGST/SGST',
        city: '',
        state: '',
        country: '',
        billTo: '',
        customerId: ''
      });
    }
  };

  // Global Keyboard listener matching invoice page standard
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        handleEraseAll();
      }
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (window.confirm("Are you sure you want to clear all products from the cart?")) {
          setCart([]);
        }
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const firstCategoryBtn = document.querySelector('.pos-category-btn') as HTMLElement;
        firstCategoryBtn?.focus();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const firstCard = document.querySelector('.pos-product-card') as HTMLElement;
        firstCard?.focus();
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        const firstCartItem = document.querySelector('.pos-cart-item') as HTMLElement;
        if (firstCartItem) {
          firstCartItem.focus();
        } else {
          const settleButton = document.querySelector('#pos-settle-btn') as HTMLElement;
          settleButton?.focus();
        }
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleAction('Settle Payment');
      }
      if (e.key === 'F1' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (showHelp) {
          e.preventDefault();
          setShowHelp(false);
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
  }, [sidebarOpen, totals, showHelp]);

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    handleEnterTraversal(e, containerRef.current);
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleContainerKeyDown}
      className="flex w-full h-screen overflow-hidden bg-app-bg text-text-main"
    >

      {/* Exact same sidebar, proportion, and toggleable behaviour */}
      <InvoiceSidebar
        form={form}
        onChange={setForm}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onBillToEnter={() => {
          setSidebarOpen(false);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 50);
        }}
      />

      {/* CENTER & RIGHT COLUMN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">

        {/* Navigation / Header */}
        <header className="flex justify-between items-center px-4 py-2 border-b border-border-sec bg-panel-bg shrink-0">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-md hover:bg-border-acc/10 active:bg-border-acc/25 transition-colors cursor-pointer text-text-acc focus:outline-none mr-1"
                title="Open Details Menu"
              >
                <Menu size={18} />
              </button>
            )}
            <ShoppingBag size={18} className="text-text-acc" />
            <span className="text-app-lg font-bold tracking-wide text-text-main">
              Invoiso POS
            </span>
            <span className="text-app-xs bg-info-badge-bg text-info-badge-text px-1.5 py-0.5 rounded font-black uppercase">
              Wholesale Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats for fast billing */}
            <div className="hidden md:flex items-center gap-3 text-app-xs text-text-sec bg-app-bg px-3 py-1 rounded border border-border-sec">
              <div>Customer: <strong className="text-text-acc">{form.name || 'Walk-in'}</strong></div>
              <div className="border-l border-border-sec h-3 pl-3">Inv: <strong>{form.invoiceNo}</strong></div>
            </div>

            <div className="relative inline-block text-left" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="px-2 py-1 bg-border-acc/20 hover:bg-border-acc/35 text-text-acc text-app-xs font-extrabold rounded border border-border-acc/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                ⚙️ Quick Actions
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-panel-bg border border-border-sec rounded-md shadow-lg z-[200] overflow-hidden flex flex-col py-1 text-app-xs">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 text-text-main hover:bg-border-sec/50 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <span>🏠</span> Back to Invoice Page
                  </Link>
                  <Link
                    to="/invoices"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 text-text-main hover:bg-border-sec/50 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <span>📄</span> View Invoices
                  </Link>
                  <Link
                    to="/analytics"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 text-text-main hover:bg-border-sec/50 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <span>📊</span> Analytics
                  </Link>
                  <button
                    onClick={() => {
                      setIsAddProductModalOpen(true);
                      setMenuOpen(false);
                    }}
                    className="px-3 py-2 text-left text-text-main hover:bg-border-sec/50 transition-colors flex items-center gap-2 font-semibold w-full cursor-pointer"
                  >
                    <span>➕</span> Add Product
                  </button>
                </div>
              )}
            </div>

            <button
              className="px-2 py-1 rounded text-app-xs font-semibold border border-border-sec bg-text-main text-panel-bg cursor-pointer"
              onClick={toggleDarkMode}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button
              className="bg-alert hover:opacity-90 text-white rounded text-app-xs font-semibold flex items-center justify-center transition-all h-[26px] px-2 cursor-pointer gap-1"
              onClick={handleEraseAll}
              title="Erase POS Screen (Alt + N / Alt + E)"
            >
              🗑️ New POS
            </button>
          </div>
        </header>

        {/* 2-Column POS Workspace (Center Catalog Area + Right Cart Summary Panel) */}
        <div className="flex-1 flex overflow-hidden">

          {/* CENTER COLUMN (60-65%): Product Catalog Area */}
          <POSProductGrid
            products={filteredProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddProduct={handleAddToCart}
            searchInputRef={searchInputRef}
            isSidebarOpen={sidebarOpen}
          />

          {/* RIGHT COLUMN (20-25%): Sticky Cart Summary Panel */}
          <POSCartSummary
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={() => setCart([])}
            discountPercent={discountPercent}
            onDiscountPercentChange={setDiscountPercent}
            totals={totals}
            onSaveDraft={() => handleAction('Save')}
            onSavePrint={() => handleAction('Save & Print')}
            onSettlePayment={() => handleAction('Settle Payment')}
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
              ⌨️ POS Keyboard Shortcuts Help
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
                    <span className="font-bold text-text-main">Focus Categories</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-text-acc">Ctrl + Q</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Focus Product Grid</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + K</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-text-main">Toggle Sidebar</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + B</kbd>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-app-sm font-black tracking-wider uppercase text-text-mute mb-2">Actions</h3>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-alert">Clear Cart</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-alert">Alt + C</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">New POS / Erase</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-text-acc">Alt + N / E</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Settle Payment</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-text-acc">Ctrl + Enter</kbd>
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
                    <span className="font-bold text-text-main">Add Product to Cart</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Enter / Space</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Navigate Catalog Cards</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Arrow Keys</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-border-main/30 py-1">
                    <span className="font-bold text-text-main">Focus First Cart Item</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Ctrl + G / J</kbd>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-text-main">Close Dialogs/Menus</span>
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black">Escape</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-border-main text-[0.6875rem] text-text-mute text-center font-medium">
              Press <span className="font-bold text-text-acc">Escape</span> at any time to close help
            </div>
          </div>
        </div>
      )}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={(newProduct) => setProducts(prev => [...prev, newProduct])}
      />

      {isPrintModalOpen && printSnapshot && (
        <PrintInvoiceModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintSnapshot(null);
          }}
          form={printSnapshot.form}
          items={printSnapshot.items}
          totals={printSnapshot.totals}
          hamali={printSnapshot.hamali}
          freight={printSnapshot.freight}
          discPercent={printSnapshot.discPercent}
          salesman={printSnapshot.salesman}
          vehicleNo={printSnapshot.vehicleNo}
          transport={printSnapshot.transport}
          roundOff={printSnapshot.roundOff}
          note={printSnapshot.note}
        />
      )}
    </div>
  );
}

