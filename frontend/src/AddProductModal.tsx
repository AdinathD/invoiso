import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { addProduct } from './apiUtils/productsApi';
import type { ApiProduct } from './apiUtils/productsApi';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: ApiProduct) => void;
}

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [hsn, setHsn] = useState('');
  const [price, setPrice] = useState('');
  const [gstPercent, setGstPercent] = useState('5');
  const [stock, setStock] = useState('');
  const [uom, setUom] = useState('PCS');
  const [category, setCategory] = useState('Rice');
  const [defaultWeight, setDefaultWeight] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) return setError('Product Name is required');
    if (!hsn.trim()) return setError('HSN Code is required');
    if (!price || parseFloat(price) < 0) return setError('Please enter a valid price');
    if (!gstPercent || parseFloat(gstPercent) < 0) return setError('Please enter a valid GST percent');
    if (!stock || parseFloat(stock) < 0) return setError('Please enter a valid stock amount');
    if (!uom.trim()) return setError('UOM is required');
    if (!category.trim()) return setError('Category is required');

    setLoading(true);
    try {
      const newProduct = await addProduct({
        name: name.trim(),
        hsn: hsn.trim(),
        price: parseFloat(price),
        gstPercent: parseFloat(gstPercent),
        stock: parseFloat(stock),
        uom: uom.trim(),
        category: category.trim(),
        defaultWeight: defaultWeight ? parseFloat(defaultWeight) : undefined
      });
      onProductAdded(newProduct);
      
      // Reset form
      setName('');
      setHsn('');
      setPrice('');
      setGstPercent('5');
      setStock('');
      setUom('PCS');
      setCategory('Rice');
      setDefaultWeight('');
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-panel-bg text-text-main border border-border-sec rounded-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-sec bg-border-sec/10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-text-acc animate-pulse" />
            <h2 className="text-app-lg font-bold text-text-main">
              Add New Product
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-mute hover:bg-border-sec hover:text-text-main transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-app-sm text-alert bg-alert/10 border border-alert/20 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. PREMIUM BASMATI RICE [10 KG]"
                className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main placeholder-text-mute/60 focus:outline-none focus:border-text-acc transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main focus:outline-none focus:border-text-acc transition-colors"
                >
                  <option value="Rice">Rice</option>
                  <option value="Oil">Oil</option>
                  <option value="Flour">Flour</option>
                  <option value="Salt">Salt</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* HSN */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  HSN Code *
                </label>
                <input
                  type="text"
                  required
                  value={hsn}
                  onChange={e => setHsn(e.target.value)}
                  placeholder="e.g. 10063020"
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main placeholder-text-mute/60 focus:outline-none focus:border-text-acc transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Price */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  Price (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main placeholder-text-mute/60 focus:outline-none focus:border-text-acc transition-colors"
                />
              </div>

              {/* GST % */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  GST % *
                </label>
                <select
                  value={gstPercent}
                  onChange={e => setGstPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main focus:outline-none focus:border-text-acc transition-colors"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>

              {/* UOM */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  UOM *
                </label>
                <select
                  value={uom}
                  onChange={e => setUom(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main focus:outline-none focus:border-text-acc transition-colors"
                >
                  <option value="PCS">PCS</option>
                  <option value="BAG">BAG</option>
                  <option value="TIN">TIN</option>
                  <option value="BTL">BTL</option>
                  <option value="JAR">JAR</option>
                  <option value="KGS">KGS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Stock */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  placeholder="0.000"
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main placeholder-text-mute/60 focus:outline-none focus:border-text-acc transition-colors"
                />
              </div>

              {/* Default Weight */}
              <div>
                <label className="block text-app-xs font-black tracking-wider uppercase text-text-mute mb-1">
                  Def. Wt (KG)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={defaultWeight}
                  onChange={e => setDefaultWeight(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-app-bg border border-border-sec rounded-lg text-app-base text-text-main placeholder-text-mute/60 focus:outline-none focus:border-text-acc transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border-sec">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-sec hover:bg-border-sec/20 text-text-sec text-app-base font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-text-acc hover:bg-text-acc/90 disabled:opacity-50 text-white text-app-base font-bold rounded-lg shadow-md transition-colors cursor-pointer"
            >
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
