import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, Home, Menu, X } from 'lucide-react';
import { InvoiceSidebar } from '../sidebar';
import type { MasterForm } from '../sidebar';
import { Link } from 'react-router-dom';
import { AddProductModal } from '../AddProductModal';

// Import local POS components
import { POSProductGrid } from './POSProductGrid';
import { POSCartSummary } from './POSCartSummary';
import type { POSProduct, CartItem } from './types';
import { handleEnterTraversal } from '../keyboardUtils';
import { fetchProducts } from '../apiUtils/productsApi';

interface WholesalePOSPageProps {
  form: MasterForm;
  setForm: React.Dispatch<React.SetStateAction<MasterForm>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function WholesalePOSPage({ form, setForm, darkMode, toggleDarkMode }: WholesalePOSPageProps) {
  // Sidebar State (matches proportion and toggle behavior of InvoicePage)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // POS Products State loaded from JSON
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showHelp, setShowHelp] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Categories list
  const categories = ['All', 'Rice', 'Oil', 'Flour', 'Salt', 'Pulses'];

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

    const discount = subtotal * 0.02;
    const grandTotal = subtotal - discount;

    return {
      subtotal: subtotal.toFixed(2),
      taxableAmount: totalTaxable.toFixed(2),
      gst: totalGst.toFixed(2),
      discount: discount.toFixed(2),
      totalWeight: totalWeight.toFixed(2),
      totalItems,
      grandTotal: grandTotal.toFixed(2)
    };
  }, [cart]);

  const handleAction = (type: string) => {
    alert(`${type} triggered successfully!\n\nCustomer: ${form.name || 'Walk-in'}\nTotal Items: ${totals.totalItems}\nGrand Total: INR ${totals.grandTotal}`);
  };

  // Global Keyboard listener matching invoice page standard
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setCart([]);
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

            <Link
              to="/"
              className="flex items-center gap-1 px-3 py-1 bg-border-sec/40 hover:bg-border-sec/60 text-text-sec hover:text-text-main text-app-xs font-extrabold rounded border border-border-sec transition-all cursor-pointer"
            >
              <Home size={12} />
              <span>Back to Invoice</span>
            </Link>

            <button
              className="px-2 py-1 bg-text-acc/10 hover:bg-text-acc/25 text-text-acc text-app-xs font-extrabold rounded border border-text-acc/40 transition-all cursor-pointer"
              onClick={() => setIsAddProductModalOpen(true)}
            >
              ➕ Add Product
            </button>

            <button
              className="px-2 py-1 rounded text-app-xs font-semibold border border-border-sec bg-text-main text-panel-bg cursor-pointer"
              onClick={toggleDarkMode}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
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
                    <kbd className="bg-app-bg border border-border-sec rounded px-2 py-0.5 font-mono text-app-sm font-black text-alert">Alt + E</kbd>
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
    </div>
  );
}
