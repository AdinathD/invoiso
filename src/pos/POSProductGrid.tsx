import React from 'react';
import { Search, Settings } from 'lucide-react';
import { POSProductCard } from './POSProductCard';
import type { CardConfig } from './POSProductCard';
import type { POSProduct } from './types';

interface POSProductGridProps {
  products: POSProduct[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProduct: (product: POSProduct) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isSidebarOpen: boolean;
}

export const POSProductGrid: React.FC<POSProductGridProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onAddProduct,
  searchInputRef,
  isSidebarOpen
}) => {
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const categoriesContainerRef = React.useRef<HTMLDivElement>(null);

  // Card configuration state with localStorage persistence
  const [cardConfig, setCardConfig] = React.useState<CardConfig>(() => {
    try {
      const saved = localStorage.getItem('pos_card_config');
      return saved ? JSON.parse(saved) : {
        showStock: true,
        showCategory: true,
        showHSN: true,
        showGST: true
      };
    } catch {
      return {
        showStock: true,
        showCategory: true,
        showHSN: true,
        showGST: true
      };
    }
  });

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleConfig = (key: keyof CardConfig) => {
    setCardConfig(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('pos_card_config', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const cards = Array.from(
      document.querySelectorAll('.pos-product-card')
    ) as HTMLElement[];
    if (cards.length === 0) return;

    const activeEl = document.activeElement as HTMLElement;
    const idx = cards.indexOf(activeEl);

    if (idx === -1) {
      const isSearchInput = e.target === searchInputRef.current;
      if (isSearchInput && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        e.preventDefault();
        cards[0].focus();
      }
      return;
    }

    const getGridCols = () => {
      if (cards.length < 2) return 1;
      const firstTop = cards[0].getBoundingClientRect().top;
      for (let i = 1; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().top > firstTop + 5) {
          return i;
        }
      }
      return cards.length;
    };

    const cols = getGridCols();

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (idx < cards.length - 1) {
          cards[idx + 1].focus();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (idx > 0) {
          cards[idx - 1].focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (idx + cols < cards.length) {
          cards[idx + cols].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (idx - cols >= 0) {
          cards[idx - cols].focus();
        } else {
          const activeCategoryBtn = document.querySelector('.bg-border-acc.pos-category-btn') as HTMLElement;
          if (activeCategoryBtn) {
            activeCategoryBtn.focus();
          } else {
            searchInputRef.current?.focus();
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      document.querySelectorAll('.pos-category-btn')
    ) as HTMLElement[];
    if (buttons.length === 0) return;

    const activeEl = document.activeElement as HTMLElement;
    const idx = buttons.indexOf(activeEl);

    if (idx === -1) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        if (idx < buttons.length - 1) {
          const nextBtn = buttons[idx + 1];
          nextBtn.focus();
          nextBtn.click();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        if (idx > 0) {
          const prevBtn = buttons[idx - 1];
          prevBtn.focus();
          prevBtn.click();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        const cards = Array.from(
          document.querySelectorAll('.pos-product-card')
        ) as HTMLElement[];
        if (cards.length > 0) {
          cards[0].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={gridContainerRef}
      onKeyDown={handleGridKeyDown}
      className="flex-1 flex flex-col p-4 bg-app-bg overflow-y-auto"
    >
      {/* Search Area */}
      <div className="mb-4 shrink-0 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products by Name, HSN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-panel-bg border border-inp-border text-inp-text pl-9 pr-4 py-2 rounded focus:outline-none focus:border-border-acc text-app-base shadow-sm"
          />
        </div>

        {/* Card config gear settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-center px-3 bg-panel-bg hover:bg-border-sec/30 text-text-sec hover:text-text-main border border-border-sec rounded shadow-sm transition-all cursor-pointer h-full focus:outline-none focus:border-border-acc"
            title="Configure Cards"
          >
            <Settings size={16} className={settingsOpen ? 'animate-spin' : ''} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-panel-bg border border-border-sec rounded shadow-xl p-2.5 z-50 animate-fade-in text-text-main">
              <h4 className="text-[0.625rem] font-black tracking-wider uppercase text-text-mute border-b border-border-main pb-1 mb-1.5">
                Card Fields
              </h4>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/55 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={cardConfig.showStock}
                    onChange={() => toggleConfig('showStock')}
                    className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                  />
                  <span>Show Stock</span>
                </label>

                <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/55 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={cardConfig.showCategory}
                    onChange={() => toggleConfig('showCategory')}
                    className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                  />
                  <span>Show Category</span>
                </label>

                <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/55 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={cardConfig.showHSN}
                    onChange={() => toggleConfig('showHSN')}
                    className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                  />
                  <span>Show HSN</span>
                </label>

                <label className="flex items-center gap-2 text-app-xs font-semibold cursor-pointer hover:bg-app-bg/55 px-1.5 py-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={cardConfig.showGST}
                    onChange={() => toggleConfig('showGST')}
                    className="rounded text-border-acc focus:ring-border-acc h-3 w-3 accent-emerald-500"
                  />
                  <span>Show GST %</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div 
        ref={categoriesContainerRef}
        onKeyDown={handleCategoryKeyDown}
        className="flex gap-2 mb-4 overflow-x-auto pb-1.5 scrollbar-thin shrink-0"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`pos-category-btn px-3 py-1 text-app-xs font-bold rounded border transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-border-acc/50 focus:border-border-acc ${
              selectedCategory === cat
                ? 'bg-border-acc border-border-acc text-white shadow-sm'
                : 'bg-panel-bg border-border-sec text-text-sec hover:text-text-main hover:border-text-sec'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive grid of Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className={`grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? 'lg:grid-cols-4 xl:grid-cols-5'
            : 'lg:grid-cols-5 xl:grid-cols-6'
        }`}>
          {products.map(prod => (
            <POSProductCard
              key={prod.id}
              product={prod}
              onAdd={onAddProduct}
              config={cardConfig}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-text-mute text-app-md font-semibold">
            No products found matching filters.
          </div>
        )}
      </div>
    </div>
  );
};
