import React from 'react';
import type { POSProduct } from './types';
import pulsesImg from '../assets/pulses.jpeg';
import saltImg from '../assets/salt.jpeg';

export interface CardConfig {
  showStock: boolean;
  showCategory: boolean;
  showHSN: boolean;
  showGST: boolean;
}

interface POSProductCardProps {
  product: POSProduct;
  onAdd: (product: POSProduct) => void;
  config: CardConfig;
}

const categoryImages: Record<string, string> = {
  Rice:
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",

  Oil:
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",

  Flour:
    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80",

  Salt: saltImg,

  Pulses: pulsesImg
};

export const POSProductCard: React.FC<POSProductCardProps> = ({ product, onAdd, config }) => {
  // Map images based on category from user instructions
  const imageUrl = categoryImages[product.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      onClick={() => onAdd(product)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd(product);
        }
      }}
      className="pos-product-card bg-panel-bg border border-border-sec rounded-lg overflow-hidden hover:border-border-acc focus:border-border-acc focus:ring-2 focus:ring-border-acc/50 focus:outline-none transition-all cursor-pointer flex flex-col justify-between hover:shadow-md active:scale-95 duration-100 group"
    >
      {/* Product Image Area (Compulsory, aspect-[16/10] full bleed with absolute title overlay) */}
      <div className="w-full aspect-[16/10] relative overflow-hidden bg-border-main shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Product Name Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-6">
          <h3 className="text-app-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-sm" title={product.name}>
            {product.name}
          </h3>
        </div>

        {config.showCategory && (
          <span className="absolute top-2 left-2 text-[0.56rem] font-black uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-[2px]">
            {product.category}
          </span>
        )}
        {product.stock <= 50 && (
          <span className="absolute top-2 right-2 text-[0.56rem] bg-alert text-white font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse">
            LOW STOCK
          </span>
        )}
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between bg-panel-bg">
        {/* Row 1: Price and Stock */}
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-app-lg font-black text-text-acc">
            ₹{product.price}
          </span>
          {config.showStock && (
            <span className="text-[0.625rem] text-text-sec font-bold">
              Stock: <strong className={product.stock <= 50 ? 'text-alert' : 'text-text-acc'}>{product.stock}</strong>
            </span>
          )}
        </div>

        {/* Row 2: UOM, HSN, and GST combined inline */}
        <div className="flex justify-between items-center text-[0.56rem] text-text-mute font-semibold border-t border-border-main/20 pt-1 mt-1">
          <span>{product.uom}</span>
          {config.showHSN && <span>HSN: {product.hsn}</span>}
          {config.showGST && <span>GST: {product.gstPercent}%</span>}
        </div>
      </div>
    </div>
  );
};
