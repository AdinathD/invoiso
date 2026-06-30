import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem } from './types';

interface POSCartSummaryProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, amount: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  discountPercent: number;
  onDiscountPercentChange: (pct: number) => void;
  totals: {
    subtotal: string;
    taxableAmount: string;
    gst: string;
    discount: string;
    totalWeight: string;
    totalItems: number;
    grandTotal: string;
  };
  onSaveDraft: () => void;
  onSavePrint: () => void;
  onSettlePayment: () => void;
}

export const POSCartSummary: React.FC<POSCartSummaryProps> = ({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  discountPercent,
  onDiscountPercentChange,
  totals,
  onSaveDraft,
  onSavePrint,
  onSettlePayment
}) => {
  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    productId: string,
    index: number
  ) => {
    const items = Array.from(
      document.querySelectorAll('.pos-cart-item')
    ) as HTMLElement[];

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onUpdateQty(productId, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onUpdateQty(productId, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        if (index > 0) {
          items[index - 1]?.focus();
        }
      } else {
        if (index < items.length - 1) {
          items[index + 1]?.focus();
        } else {
          const settleBtn = document.querySelector('#pos-settle-btn') as HTMLElement;
          settleBtn?.focus();
        }
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemoveItem(productId);
      setTimeout(() => {
        const remainingItems = Array.from(
          document.querySelectorAll('.pos-cart-item')
        ) as HTMLElement[];
        if (remainingItems.length > 0) {
          const nextFocusIndex = Math.min(index, remainingItems.length - 1);
          remainingItems[nextFocusIndex]?.focus();
        } else {
          const searchInput = document.querySelector('input[placeholder*="Search products"]') as HTMLElement;
          searchInput?.focus();
        }
      }, 0);
    }
  };

  return (
    <div id="pos-cart-summary" className="w-[18.5rem] lg:w-[20rem] border-l border-border-sec bg-panel-bg flex flex-col overflow-hidden">
      {/* Cart Header */}
      <div className="p-2.5 border-b border-border-sec flex justify-between items-center shrink-0">
        <span className="text-app-sm font-extrabold text-text-acc">Cart Items ({totals.totalItems})</span>
        <button
          onClick={onClearCart}
          className="text-[0.625rem] font-bold text-alert hover:opacity-85 focus:ring-1 focus:ring-alert focus:outline-none rounded px-1 transition-opacity flex items-center gap-1 cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Headers */}
      {cart.length > 0 && (
        <div className="px-2.5 py-1.5 bg-app-bg border-b border-border-sec text-[0.56rem] font-black text-text-mute uppercase tracking-wider flex items-center justify-between gap-1 shrink-0">
          <span className="flex-1">Product Details</span>
          <span className="w-[15%] text-right">Price</span>
          <span className="w-[20%] text-center">Qty</span>
          <span className="w-[18%] text-right">Total</span>
          <span className="w-[5%]"></span>
        </div>
      )}

      {/* Cart list (independent scroll) */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-sec/30">
        {cart.map((item, idx) => (
          <div
            key={item.product.id}
            tabIndex={0}
            onKeyDown={(e) => handleItemKeyDown(e, item.product.id, idx)}
            className="pos-cart-item bg-panel-bg hover:bg-app-bg/40 border-b border-border-sec/10 px-2.5 py-2 flex items-center justify-between gap-1 focus:bg-border-acc/5 focus:border-l-2 focus:border-l-border-acc focus:outline-none transition-all cursor-pointer"
          >
            {/* Product Details */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-app-xs font-bold text-text-main line-clamp-2 leading-tight" title={item.product.name}>
                {item.product.name}
              </h4>
              <div className="text-[0.56rem] text-text-mute font-semibold mt-0.5">
                {item.product.uom} | HSN: {item.product.hsn}
              </div>
            </div>

            {/* Price */}
            <div className="w-[15%] shrink-0 text-right text-app-xs font-semibold text-text-sec">
              ₹{item.product.price.toFixed(0)}
            </div>

            {/* Qty */}
            <div className="w-[20%] shrink-0 flex justify-center">
              <div className="flex items-center border border-border-sec rounded bg-panel-bg overflow-hidden h-5">
                <button
                  onClick={() => onUpdateQty(item.product.id, -1)}
                  tabIndex={-1}
                  className="px-1 py-0.5 text-text-sec hover:bg-app-bg hover:text-text-main focus:bg-app-bg focus:text-text-main focus:outline-none transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Minus size={8} />
                </button>
                <span className="px-0.5 text-xs font-black text-text-main min-w-[0.75rem] text-center font-mono">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQty(item.product.id, 1)}
                  tabIndex={-1}
                  className="px-1 py-0.5 text-text-sec hover:bg-app-bg hover:text-text-main focus:bg-app-bg focus:text-text-main focus:outline-none transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Plus size={8} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="w-[18%] shrink-0 text-right text-app-sm font-black text-text-main font-mono">
              ₹{(item.product.price * item.quantity).toFixed(0)}
            </div>

            {/* Remove Action */}
            <div className="w-[5%] shrink-0 flex justify-end">
              <button
                onClick={() => onRemoveItem(item.product.id)}
                tabIndex={-1}
                className="text-text-mute hover:text-alert p-0.5 rounded hover:bg-border-sec/25 focus:bg-border-sec/25 focus:text-alert focus:outline-none transition-colors"
                title="Remove"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}

        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-mute">
            <ShoppingBag size={24} className="opacity-40 mb-2" />
            <span className="text-app-xs font-bold">POS Cart is Empty</span>
          </div>
        )}
      </div>

      {/* Cart Summary Totals & Actions (Sticky at bottom) */}
      <div className="p-3 border-t border-border-sec bg-panel-bg space-y-3 shrink-0">

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-app-xs font-medium text-text-sec border-b border-border-sec pb-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-text-main">₹{totals.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxable</span>
            <span className="font-bold text-text-main">₹{totals.taxableAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span className="font-bold text-text-main">₹{totals.gst}</span>
          </div>
          <div className="flex justify-between items-center text-text-acc gap-1">
            <span className="flex items-center gap-1">
              Discount (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountPercent}
                onChange={(e) => onDiscountPercentChange(parseFloat(e.target.value) || 0)}
                className="w-10 text-center border border-border-sec rounded bg-panel-bg text-text-acc font-bold text-[0.65rem] h-5 py-0.5 focus:outline-none focus:border-text-acc [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </span>
            <span className="font-bold">-₹{totals.discount}</span>
          </div>
          <div className="col-span-2 flex justify-between border-t border-border-sec/40 pt-1 text-[0.68rem] text-text-mute font-semibold">
            <span>Total Items / Weight</span>
            <span className="text-text-main font-bold">{totals.totalItems} pcs / {totals.totalWeight} kg</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-baseline">
          <span className="text-app-base font-extrabold text-text-main">Grand Total</span>
          <span className="text-app-xl font-black text-text-acc font-mono">
            ₹{totals.grandTotal}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onSaveDraft}
            className="px-2 py-1.5 bg-panel-bg border border-border-sec hover:border-text-sec hover:text-text-main text-text-sec text-app-xs font-extrabold rounded focus:border-text-sec focus:text-text-main focus:outline-none transition-all cursor-pointer"
          >
            Save (Draft)
          </button>
          <button
            onClick={onSavePrint}
            className="px-2 py-1.5 bg-panel-bg border border-border-sec hover:border-text-sec hover:text-text-main text-text-sec text-app-xs font-extrabold rounded focus:border-text-sec focus:text-text-main focus:outline-none transition-all cursor-pointer"
          >
            Save & Print
          </button>
          <button
            id="pos-settle-btn"
            onClick={onSettlePayment}
            className="col-span-2 py-2 bg-border-acc hover:bg-action-hover text-white text-app-sm font-extrabold rounded shadow-sm hover:shadow focus:ring-2 focus:ring-border-acc/50 focus:outline-none transition-all cursor-pointer text-center"
          >
            Settle Payment (Ctrl + Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
