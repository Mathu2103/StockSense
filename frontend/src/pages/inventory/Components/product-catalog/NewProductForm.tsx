import React, { useState, useEffect, useMemo } from 'react';
import ProductImageUploader from './ProductImageUploader';

type SelectOption = {
  id: string;
  name: string;
};

type SupplierOption = {
  id: string;
  name: string;
};

type NewProductFormProps = {
  categories: { id: string; name: string; children: { id: string; name: string }[] }[];
  suppliers: SupplierOption[];
  onSave: (productData: any) => void;
  onCancel: (discarded?: boolean) => void;
  initialProduct?: any; // For editing mode if needed
};

export default function NewProductForm({
  categories,
  suppliers,
  onSave,
  onCancel,
  initialProduct
}: NewProductFormProps) {
  // Form Field States
  const [name, setName] = useState(initialProduct?.name || '');
  const [skuMode, setSkuMode] = useState<'auto' | 'manual'>(initialProduct ? 'manual' : 'auto');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  
  const [selectedCategoryName, setSelectedCategoryName] = useState(initialProduct?.category || categories[0]?.name || '');
  const [selectedSubName, setSelectedSubName] = useState(initialProduct?.subcategory || '');

  const [supplierName, setSupplierName] = useState(initialProduct?.supplier || suppliers[0]?.name || '');
  const [supplierCode, setSupplierCode] = useState(initialProduct?.supplierProductCode || '');

  const [openingStock, setOpeningStock] = useState<number>(initialProduct?.stock || 0);
  const [reorderLevel, setReorderLevel] = useState<number>(initialProduct?.reorderLevel || 10);
  const [unitType, setUnitType] = useState(initialProduct?.unitType || 'Piece');

  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPrice || 0);
  const [sellingPrice, setSellingPrice] = useState<number>(initialProduct?.sellingPrice || 0);

  const [imageUrl, setImageUrl] = useState<string | null>(initialProduct?.imageUrl || null);

  // Quick modals categories creation states
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatHierarchy, setQuickCatHierarchy] = useState<'parent' | 'sub'>('parent');
  const [quickParentName, setQuickParentName] = useState(categories[0]?.name || '');

  // Quick modals suppliers creation states
  const [isQuickSupOpen, setIsQuickSupOpen] = useState(false);
  const [quickSupName, setQuickSupName] = useState('');
  const [quickSupContact, setQuickSupContact] = useState('');

  // Unsaved Warning State
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cancel' | 'discard' | null>(null);

  // Sync subcategory options based on selected parent category name
  const subCategories = useMemo(() => {
    const parent = categories.find((cat) => cat.name === selectedCategoryName);
    return parent ? parent.children : [];
  }, [categories, selectedCategoryName]);

  useEffect(() => {
    if (subCategories.length > 0 && !initialProduct) {
      setSelectedSubName(subCategories[0].name);
    }
  }, [subCategories, initialProduct]);

  // Check if form is dirty (has changes compared to original state)
  const isFormDirty = useMemo(() => {
    if (initialProduct) {
      return (
        name !== initialProduct.name ||
        sku !== initialProduct.sku ||
        barcode !== initialProduct.barcode ||
        description !== initialProduct.description ||
        selectedCategoryName !== initialProduct.category ||
        selectedSubName !== initialProduct.subcategory ||
        supplierName !== initialProduct.supplier ||
        supplierCode !== initialProduct.supplierProductCode ||
        openingStock !== initialProduct.stock ||
        reorderLevel !== initialProduct.reorderLevel ||
        unitType !== initialProduct.unitType ||
        costPrice !== initialProduct.costPrice ||
        sellingPrice !== initialProduct.sellingPrice ||
        imageUrl !== initialProduct.imageUrl
      );
    }
    return (
      name !== '' ||
      sku !== '' ||
      barcode !== '' ||
      description !== '' ||
      openingStock !== 0 ||
      costPrice !== 0 ||
      sellingPrice !== 0 ||
      imageUrl !== null
    );
  }, [
    name,
    sku,
    barcode,
    description,
    selectedCategoryName,
    selectedSubName,
    supplierName,
    supplierCode,
    openingStock,
    reorderLevel,
    unitType,
    costPrice,
    sellingPrice,
    imageUrl,
    initialProduct
  ]);

  // SKU Prefix dynamic generation rules
  useEffect(() => {
    if (skuMode === 'auto' && selectedCategoryName && !initialProduct) {
      let prefix = 'GRO'; // defaults to grocery
      if (selectedCategoryName.includes('Beverage')) prefix = 'BEV';
      else if (selectedCategoryName.includes('Dairy')) prefix = 'DAI';
      else if (selectedCategoryName.includes('Snacks')) prefix = 'SNA';
      else if (selectedCategoryName.includes('Household')) prefix = 'HOU';
      else if (selectedCategoryName.includes('Personal')) prefix = 'PER';
      else if (selectedCategoryName.includes('Frozen')) prefix = 'FRO';
      else if (selectedCategoryName.includes('Bakery')) prefix = 'BAK';

      const randomNum = Math.floor(100 + Math.random() * 900);
      setSku(`${prefix}-${randomNum}`);
    }
  }, [skuMode, selectedCategoryName, initialProduct]);

  // Dynamic calculations:
  // Gross Profit Margin % = (selling - cost) / selling * 100
  // Markup % = (selling - cost) / cost * 100
  const marginMetrics = useMemo(() => {
    const profit = sellingPrice - costPrice;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
    return { profit, margin, markup };
  }, [costPrice, sellingPrice]);

  const handleCancelClick = () => {
    if (isFormDirty) {
      setPendingAction('cancel');
      setShowUnsavedWarning(true);
    } else {
      onCancel();
    }
  };

  const handleDiscardConfirm = () => {
    setShowUnsavedWarning(false);
    onCancel(true);
  };

  const handleReset = () => {
    if (window.confirm('Reset form fields back to empty?')) {
      setName('');
      setSku('');
      setBarcode('');
      setDescription('');
      setOpeningStock(0);
      setReorderLevel(10);
      setCostPrice(0);
      setSellingPrice(0);
      setImageUrl(null);
    }
  };

  const handleSaveProduct = (e: React.FormEvent, status: 'Active' | 'Inactive') => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!sku.trim()) {
      alert('SKU is required.');
      return;
    }

    onSave({
      id: initialProduct?.id || `prod_${Date.now()}`,
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim() || `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      category: selectedCategoryName,
      subcategory: selectedSubName,
      supplier: supplierName,
      unitType,
      stock: openingStock,
      reorderLevel,
      costPrice,
      sellingPrice,
      status,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      imageUrl
    });
  };

  // Quick save categories local handlers
  const handleQuickCatSave = () => {
    const trimmed = quickCatName.trim();
    if (!trimmed) return;

    if (quickCatHierarchy === 'parent') {
      categories.push({ id: `cat_${Date.now()}`, name: trimmed, children: [] });
      setSelectedCategoryName(trimmed);
    } else {
      const parent = categories.find((cat) => cat.name === quickParentName);
      if (parent) {
        parent.children.push({ id: `sub_${Date.now()}`, name: trimmed });
        setSelectedCategoryName(parent.name);
        setSelectedSubName(trimmed);
      }
    }
    setQuickCatName('');
    setIsQuickCatOpen(false);
  };

  const handleQuickSupSave = () => {
    const trimmed = quickSupName.trim();
    if (!trimmed) return;

    const exists = suppliers.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      suppliers.push({ id: `sup_${Date.now()}`, name: trimmed });
    }
    setSupplierName(trimmed);
    setQuickSupName('');
    setQuickSupContact('');
    setIsQuickSupOpen(false);
  };

  return (
    <form onSubmit={(e) => handleSaveProduct(e, 'Active')} className="space-y-6">
      
      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Multi-section card layout */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 01: Product Basic Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              Section 01: Product Information
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anchor Milk Powder 400g, Coca-Cola 1L"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU configuration */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-wider">
                      SKU Code *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSkuMode('auto')}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${skuMode === 'auto' ? 'bg-primary text-white' : 'bg-slate-100 text-on-surface-variant'}`}
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => setSkuMode('manual')}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${skuMode === 'manual' ? 'bg-primary text-white' : 'bg-slate-100 text-on-surface-variant'}`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. BEV-001, DAI-005"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                    disabled={skuMode === 'auto'}
                  />
                </div>

                {/* Barcode input */}
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Barcode Number (UPC)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 4791029384729"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Item Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize product characteristics or storage limits..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none resize-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                />
              </div>
            </div>
          </div>

          {/* Section 02: Category Assignment */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                Section 02: Category Assignment
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickCatOpen(true)}
                className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                Quick Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Primary Category
                </label>
                <select
                  value={selectedCategoryName}
                  onChange={(e) => setSelectedCategoryName(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Subcategory dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Subcategory
                </label>
                <select
                  value={selectedSubName}
                  onChange={(e) => setSelectedSubName(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {subCategories.length === 0 ? (
                    <option value="">No subcategories available</option>
                  ) : (
                    subCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Section 03: Supplier Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
              Section 03: Supplier Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supplier dropdown */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">
                    Primary Supplier
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickSupOpen(true)}
                    className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px] font-black">add</span>
                    Quick Add
                  </button>
                </div>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Supplier code input */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Supplier Product Code
                </label>
                <input
                  type="text"
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  placeholder="e.g. SUP-MILK-92"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                />
              </div>
            </div>
          </div>

          {/* Section 04: Inventory Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              Section 04: Inventory Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Opening Stock */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Opening Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Reorder Level */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Reorder Level *
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Unit Type dropdown */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Unit Type
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Piece">Piece</option>
                  <option value="Pack">Pack</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Box">Box</option>
                  <option value="Kilogram">Kilogram</option>
                  <option value="Gram">Gram</option>
                  <option value="Liter">Liter</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Image Upload widgets */}
        <div className="space-y-6">
          
          {/* Section 05: Pricing Information */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
              Section 05: Pricing Information
            </h3>

            <div className="space-y-3.5">
              {/* Cost Price */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Cost Price (Rs.) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Selling Price (Rs.) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Financial Metrics Indicators */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-bold text-outline uppercase tracking-wider text-[8px]">Gross Margin</span>
                  <span className={`font-black text-xs mt-1 ${marginMetrics.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {marginMetrics.margin.toFixed(2)}%
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-3">
                  <span className="font-bold text-outline uppercase tracking-wider text-[8px]">Markup Rate</span>
                  <span className={`font-black text-xs mt-1 ${marginMetrics.markup >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {marginMetrics.markup.toFixed(2)}%
                  </span>
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-3">
                  <span className="font-bold text-outline uppercase tracking-wider text-[8px]">Net Profit</span>
                  <span className={`font-black text-xs mt-1 ${marginMetrics.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Rs. {marginMetrics.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 06: Product Image */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">image</span>
              Section 06: Product Image
            </h3>

            <ProductImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
          </div>

          {/* Live Preview Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider">Live Preview Card</h4>
            <div className="border border-slate-100 rounded-lg p-3 space-y-2 bg-slate-50 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-on-surface block truncate">{name || 'Unnamed Product'}</span>
                <span className="bg-primary/5 text-primary text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                  {selectedCategoryName}
                </span>
              </div>
              <p className="text-[10px] text-outline">SKU: {sku || '—'}</p>
              <div className="flex justify-between items-end pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-outline-variant">{openingStock} {unitType}s</span>
                <span className="font-extrabold text-primary text-sm">Rs. {sellingPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Buttons Action bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <span className="text-xs font-bold text-outline">
          {isFormDirty ? '⚠️ Unsaved modifications present' : '✓ Fields match default state'}
        </span>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-on-surface-variant rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={(e) => handleSaveProduct(e, 'Inactive')}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-on-surface rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-colors shadow-sm flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save Product
          </button>
        </div>
      </div>

      {/* Unsaved Changes protection overlay confirmation */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">You have unsaved changes</h3>
                  <p className="text-xs text-outline mt-0.5">Navigating away will discard your changes to this product form.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 bg-white border border-outline rounded-lg text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={handleDiscardConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={(e) => {
                  setShowUnsavedWarning(false);
                  handleSaveProduct(e, 'Inactive');
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {isQuickCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <h2 className="text-sm font-bold text-on-surface">Quick Add Category</h2>
              <button type="button" onClick={() => setIsQuickCatOpen(false)} className="text-outline">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={quickCatName}
                  onChange={(e) => setQuickCatName(e.target.value)}
                  placeholder="e.g. Frozen Foods"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Hierarchy Level</label>
                <div className="flex gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setQuickCatHierarchy('parent')}
                    className={`flex-1 py-2 border rounded-lg transition-colors ${quickCatHierarchy === 'parent' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant'}`}
                  >
                    Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCatHierarchy('sub')}
                    className={`flex-1 py-2 border rounded-lg transition-colors ${quickCatHierarchy === 'sub' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant'}`}
                  >
                    Subcategory
                  </button>
                </div>
              </div>

              {quickCatHierarchy === 'sub' && (
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Parent Category</label>
                  <select
                    value={quickParentName}
                    onChange={(e) => setQuickParentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2 text-xs font-bold">
              <button type="button" onClick={() => setIsQuickCatOpen(false)} className="px-4 py-2 bg-white border border-outline rounded-lg text-on-surface-variant">
                Cancel
              </button>
              <button type="button" onClick={handleQuickCatSave} className="px-5 py-2 bg-primary text-white rounded-lg">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Supplier Modal */}
      {isQuickSupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/60">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                Quick Add Supplier
              </h2>
              <button type="button" onClick={() => setIsQuickSupOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Supplier Name *</label>
                <input
                  type="text"
                  value={quickSupName}
                  onChange={(e) => setQuickSupName(e.target.value)}
                  placeholder="e.g. FreshFarm Supplies"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1.5">Contact Person (Optional)</label>
                <input
                  type="text"
                  value={quickSupContact}
                  onChange={(e) => setQuickSupContact(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2 text-xs font-bold">
              <button type="button" onClick={() => setIsQuickSupOpen(false)} className="px-4 py-2 bg-white border border-outline rounded-lg text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button type="button" onClick={handleQuickSupSave} className="px-5 py-2 bg-primary text-white rounded-lg hover:opacity-95 transition-opacity shadow-sm">
                Create Supplier
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
