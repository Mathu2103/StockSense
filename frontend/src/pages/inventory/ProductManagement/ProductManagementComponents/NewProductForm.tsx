import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductImageUploader from './SubComponents/ProductImageUploader';

type SupplierOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

type BrandOption = {
  id: string;
  name: string;
};

type NewProductFormProps = {
  categories: CategoryOption[];
  suppliers: SupplierOption[];
  brands: BrandOption[];
  onSave: (productData: any) => void;
  onCancel: (discarded?: boolean) => void;
  initialProduct?: any;
};

type ProductStructure = 'single' | 'variant';
type ProductStatus = 'Active' | 'Inactive';
type VariantImageMode = 'different' | 'shared';

type VariantItem = {
  id: string;
  variantName: string;
  attributeType: 'Size' | 'Flavor' | 'Color';
  attributeValue: string;
  unit: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  targetCapacity?: number;
  imageUrl: string | null;
};

const UNIT_OPTIONS = [
  'Piece (pcs)',
  'Packet',
  'Box',
  'Bottle',
  'Kg',
  'g',
  'L',
  'ml',
  'cm',
  'm'
];

const FORECAST_TAG_OPTIONS = ['Stable', 'Rising', 'Seasonal Peak', 'Promotion Spike', 'Declining'];

const createBarcode = () => `479${Math.floor(1000000000 + Math.random() * 9000000000)}`;

const createVariantDraft = (barcode: string): Omit<VariantItem, 'id'> => ({
  variantName: '',
  attributeType: 'Flavor',
  attributeValue: '',
  unit: UNIT_OPTIONS[0],
  barcode,
  costPrice: 0,
  sellingPrice: 0,
  stock: 0,
  reorderLevel: 0,
  targetCapacity: 100,
  imageUrl: null
});

export default function NewProductForm({
  categories,
  suppliers,
  brands,
  onSave,
  onCancel,
  initialProduct
}: NewProductFormProps) {
  const navigate = useNavigate();
  const categoryPickerRef = useRef<HTMLDivElement | null>(null);
  const [productName, setProductName] = useState(initialProduct?.name || '');
  const [productType] = useState<'Goods'>('Goods');
  const [category, setCategory] = useState(initialProduct?.category || categories[0]?.name || '');
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '');
  const [brand, setBrand] = useState(initialProduct?.brand || brands[0]?.name || '');
  const [supplier, setSupplier] = useState(initialProduct?.supplier || suppliers[0]?.name || '');
  const [manufacturer, setManufacturer] = useState(initialProduct?.manufacturer || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(
    initialProduct?.frontImageUrl || initialProduct?.imageUrl || null
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialProduct?.additionalImages || []);

  const [structure, setStructure] = useState<ProductStructure>(initialProduct?.variants?.length ? 'variant' : 'single');

  const [singleCostPrice, setSingleCostPrice] = useState<number>(initialProduct?.costPrice || 0);
  const [singleSellingPrice, setSingleSellingPrice] = useState<number>(initialProduct?.sellingPrice || 0);
  const [singleDiscountPrice, setSingleDiscountPrice] = useState<number>(initialProduct?.discountPrice || 0);
  const [singleStock, setSingleStock] = useState<number>(initialProduct?.stock || 0);
  const [singleTargetCapacity, setSingleTargetCapacity] = useState<number>(
    initialProduct?.targetCapacity || 100
  );
  const [singleUnit, setSingleUnit] = useState(initialProduct?.unitType || UNIT_OPTIONS[0]);
  const [singleBarcode, setSingleBarcode] = useState<string>(initialProduct?.barcode || createBarcode());

  const [reorderPercent, setReorderPercent] = useState<number>(25);
  useEffect(() => {
    const configStr = localStorage.getItem('stocksense_settings_config');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        if (config.defaultReorderLevel) {
          setReorderPercent(parseInt(config.defaultReorderLevel, 10) || 25);
        }
      } catch (e) {
        // keep 25
      }
    }
  }, []);

  const calculatedReorderPoint = Math.round((reorderPercent / 100) * singleTargetCapacity);

  const [variantImageMode, setVariantImageMode] = useState<VariantImageMode>('different');
  const [autoVariantBarcode, setAutoVariantBarcode] = useState(true);
  const [variants, setVariants] = useState<VariantItem[]>(initialProduct?.variants || []);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantDraft, setVariantDraft] = useState<Omit<VariantItem, 'id'>>(createVariantDraft(createBarcode()));

  const [mfgDate, setMfgDate] = useState(initialProduct?.mfgDate || '');
  const [expiryDate, setExpiryDate] = useState(initialProduct?.expiryDate || '');
  const [batchNumber, setBatchNumber] = useState(initialProduct?.batchNumber || '');

  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'Active');
  const [promotionEligible, setPromotionEligible] = useState<boolean>(Boolean(initialProduct?.promotionEligible));
  const [seasonalProduct, setSeasonalProduct] = useState<boolean>(Boolean(initialProduct?.seasonalProduct));

  const [fastMoving, setFastMoving] = useState<boolean>(Boolean(initialProduct?.fastMoving));
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState<number>(
    initialProduct?.lowStockAlertThreshold || 0
  );
  const [demandForecastTag, setDemandForecastTag] = useState<string>(initialProduct?.demandForecastTag || 'Stable');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  const selectedCategoryLabel = subcategory ? `${category} / ${subcategory}` : category;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(event.target as Node)) {
        setIsCategoryPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCategorySelect = (parentName: string, childName?: string) => {
    setCategory(parentName);
    setSubcategory(childName || '');
    setIsCategoryPickerOpen(false);
  };

  const singleMetrics = useMemo(() => {
    const profit = singleSellingPrice - singleCostPrice;
    const margin = singleSellingPrice > 0 ? (profit / singleSellingPrice) * 100 : 0;
    const markup = singleCostPrice > 0 ? (profit / singleCostPrice) * 100 : 0;
    return { profit, margin, markup };
  }, [singleCostPrice, singleSellingPrice]);

  const variantBarcodes = useMemo(() => variants.map((item) => item.barcode), [variants]);

  const isFormDirty = useMemo(() => {
    return (
      Boolean(productName.trim()) ||
      Boolean(description.trim()) ||
      Boolean(frontImageUrl) ||
      additionalImages.length > 0 ||
      structure !== 'single' ||
      singleCostPrice > 0 ||
      singleSellingPrice > 0 ||
      singleStock > 0 ||
      variants.length > 0 ||
      mfgDate !== '' ||
      expiryDate !== '' ||
      batchNumber.trim() !== ''
    );
  }, [
    productName,
    description,
    frontImageUrl,
    additionalImages.length,
    structure,
    singleCostPrice,
    singleSellingPrice,
    singleStock,
    variants.length,
    mfgDate,
    expiryDate,
    batchNumber
  ]);

  const resetVariantDraft = () => {
    setVariantDraft(createVariantDraft(autoVariantBarcode ? createBarcode() : ''));
    setEditingVariantId(null);
  };

  const openNewVariantModal = () => {
    resetVariantDraft();
    setIsVariantModalOpen(true);
  };

  const openEditVariantModal = (variant: VariantItem) => {
    setEditingVariantId(variant.id);
    setVariantDraft({ ...variant });
    setIsVariantModalOpen(true);
  };

  const handleVariantSave = () => {
    const trimmedName = variantDraft.variantName.trim();
    const trimmedBarcode = variantDraft.barcode.trim();

    if (!trimmedName) {
      alert('Variant Name is required.');
      return;
    }
    if (!trimmedBarcode) {
      alert('Variant Barcode is required.');
      return;
    }
    if (variantImageMode === 'different' && !variantDraft.imageUrl) {
      alert('Variant image is required when "different images" is enabled.');
      return;
    }

    const duplicate = variants.some(
      (item) => item.barcode === trimmedBarcode && item.id !== editingVariantId
    );
    if (duplicate) {
      alert('Each variant must have a unique barcode.');
      return;
    }

    const payload: VariantItem = {
      id: editingVariantId || `var_${Date.now()}`,
      ...variantDraft,
      variantName: trimmedName,
      barcode: trimmedBarcode
    };

    if (editingVariantId) {
      setVariants((prev) => prev.map((item) => (item.id === editingVariantId ? payload : item)));
    } else {
      setVariants((prev) => [...prev, payload]);
    }

    setIsVariantModalOpen(false);
    resetVariantDraft();
  };

  const handleVariantDelete = (id: string) => {
    setVariants((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddAdditionalImage = () => {
    if (additionalImages.length >= 5) return;
    setAdditionalImages((prev) => [...prev, '']);
  };

  const handleUpdateAdditionalImage = (index: number, value: string) => {
    setAdditionalImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateBeforeSave = () => {
    if (!productName.trim()) {
      alert('Product Name is required.');
      return false;
    }
    if (!description.trim()) {
      alert('Product Description is required.');
      return false;
    }
    if (!frontImageUrl) {
      alert('Front Image is required.');
      return false;
    }

    if (structure === 'single') {
      if (!singleBarcode.trim()) {
        alert('Barcode Number is required for single product.');
        return false;
      }
      if (!singleUnit) {
        alert('Unit of Measurement is required.');
        return false;
      }
    }

    if (structure === 'variant') {
      if (variants.length === 0) {
        alert('Add at least one variant.');
        return false;
      }
      const uniqueCount = new Set(variantBarcodes).size;
      if (uniqueCount !== variants.length) {
        alert('Each variant must have a unique barcode.');
        return false;
      }
      if (variantImageMode === 'different' && variants.some((item) => !item.imageUrl)) {
        alert('Every variant must include an image when different images are enabled.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent, draftMode = false) => {
    e.preventDefault();
    if (!validateBeforeSave()) return;

    onSave({
      id: initialProduct?.id || `prod_${Date.now()}`,
      productStructure: structure,
      name: productName.trim(),
      type: productType,
      category,
      subcategory,
      brand,
      supplier,
      manufacturer: manufacturer.trim(),
      description: description.trim(),
      frontImageUrl,
      additionalImages:
        structure === 'single' ? additionalImages.filter((item) => item.trim() !== '') : [],

      barcode: structure === 'single' ? singleBarcode.trim() : null,
      unitType: structure === 'single' ? singleUnit : null,
      stock: structure === 'single' ? singleStock : null,
      reorderLevel: structure === 'single' ? calculatedReorderPoint : null,
      targetCapacity: structure === 'single' ? singleTargetCapacity : null,
      costPrice: structure === 'single' ? singleCostPrice : null,
      sellingPrice: structure === 'single' ? singleSellingPrice : null,
      discountPrice: structure === 'single' ? singleDiscountPrice : null,

      variants: structure === 'variant' ? variants : [],
      variantSettings:
        structure === 'variant'
          ? {
            imageMode: variantImageMode,
            autoGenerateBarcode: autoVariantBarcode
          }
          : null,

      mfgDate,
      expiryDate,
      batchNumber: batchNumber.trim(),

      status: draftMode ? 'Inactive' : status,
      promotionEligible,
      seasonalProduct,

      fastMoving,
      lowStockAlertThreshold,
      demandForecastTag,
      lastUpdated: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Anchor Milk Powder 400g"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Product Type</label>
                <input
                  type="text"
                  value={productType}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-sm text-on-surface-variant"
                />
              </div>

              <div className="relative" ref={categoryPickerRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Category *</label>
                  <button
                    type="button"
                    onClick={() => navigate('/manage-products?tab=categories&action=add')}
                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">add_link</span>
                    Quick Add Category
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryPickerOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-background border rounded-xl text-left shadow-sm transition-all ${isCategoryPickerOpen ? 'border-primary ring-2 ring-primary/15' : 'border-outline-variant hover:border-primary/60'
                    }`}
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">Selected Category</span>
                    <span className="block truncate text-sm font-medium text-on-surface">{selectedCategoryLabel || 'Select a category'}</span>
                  </div>
                  <span className={`material-symbols-outlined text-outline-variant text-[20px] transition-transform ${isCategoryPickerOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isCategoryPickerOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-hidden">
                    <div className="max-h-72 overflow-auto py-2">
                      {categories.map((parentCategory) => (
                        <div key={parentCategory.id} className="px-2 pb-2 last:pb-0">
                          <button
                            type="button"
                            onClick={() => handleCategorySelect(parentCategory.name)}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${category === parentCategory.name && !subcategory
                              ? 'bg-primary text-white shadow-sm'
                              : 'hover:bg-slate-50 text-on-surface'
                              }`}
                          >
                            <span className="flex items-center gap-2 font-semibold text-sm">
                              <span className={`material-symbols-outlined text-[17px] ${category === parentCategory.name && !subcategory ? 'text-white' : 'text-primary'}`}>
                                category
                              </span>
                              {parentCategory.name}
                            </span>
                            {category === parentCategory.name && !subcategory && (
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            )}
                          </button>

                          {parentCategory.children.length > 0 && (
                            <div className="mt-1 ml-2 border-l border-outline-variant/40 pl-3 space-y-1">
                              {parentCategory.children.map((childCategory) => {
                                const isSelected = category === parentCategory.name && subcategory === childCategory.name;
                                return (
                                  <button
                                    key={childCategory.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(parentCategory.name, childCategory.name)}
                                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${isSelected ? 'bg-primary/10 text-primary shadow-sm' : 'hover:bg-slate-50 text-on-surface-variant'
                                      }`}
                                  >
                                    <span className="flex items-center gap-2 text-sm">
                                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-outline-variant'}`} />
                                      {childCategory.name}
                                    </span>
                                    {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Brand *</label>
                  <button
                    type="button"
                    onClick={() => navigate('/manage-products?tab=brands')}
                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">add_link</span>
                    Quick Add Brand
                  </button>
                </div>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {brands.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">expand_more</span>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Supplier *</label>
                  <button
                    type="button"
                    onClick={() => navigate('/procurement?tab=suppliers')}
                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">add_link</span>
                    Quick Add Supplier
                  </button>
                </div>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {suppliers.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">expand_more</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Manufacturer (Optional)</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Ceylon Biscuits Ltd"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Product Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Summarize product characteristics, storage notes, and handling details..."
                className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">photo_library</span>
              Product Images
            </h3>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Front Image *</p>
              <ProductImageUploader imageUrl={frontImageUrl} setImageUrl={setFrontImageUrl} />
              <p className="text-xs text-outline mt-2">
                {structure === 'single'
                  ? 'Image scope: Product-level and single item display.'
                  : 'Image scope: Product-level cover image. Variant images are managed inside each variant entry.'}
              </p>
            </div>

            {structure === 'single' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider">
                    Additional Images (Optional, max 5)
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAdditionalImage}
                    disabled={additionalImages.length >= 5}
                    className="text-[11px] font-bold text-primary disabled:text-outline-variant"
                  >
                    + Add Image Slot
                  </button>
                </div>
                {additionalImages.length === 0 && (
                  <p className="text-xs text-outline">No additional images added.</p>
                )}
                {additionalImages.map((img, index) => (
                  <div key={`additional-${index}`} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => handleUpdateAdditionalImage(index, e.target.value)}
                      placeholder="Paste image URL"
                      className="flex-1 px-3 py-2 bg-background border border-outline-variant rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(index)}
                      className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">schema</span>
              Product Structure Selection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`border rounded-lg p-3 cursor-pointer ${structure === 'single' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="product-structure"
                    checked={structure === 'single'}
                    onChange={() => setStructure('single')}
                  />
                  <span className="font-bold text-sm">Single Product</span>
                </div>
                <p className="text-xs text-outline mt-1">Simple stock model with one barcode and one inventory stream.</p>
              </label>

              <label className={`border rounded-lg p-3 cursor-pointer ${structure === 'variant' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="product-structure"
                    checked={structure === 'variant'}
                    onChange={() => setStructure('variant')}
                  />
                  <span className="font-bold text-sm">Has Variants</span>
                </div>
                <p className="text-xs text-outline mt-1">Multi-SKU model for flavors, sizes, and per-variant pricing/stock.</p>
              </label>
            </div>
          </div>

          {structure === 'single' ? (
            <>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                  Pricing (Single Product)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Cost Price *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={singleCostPrice}
                      onChange={(e) => setSingleCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Selling Price *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={singleSellingPrice}
                      onChange={(e) => setSingleSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Discount Price (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={singleDiscountPrice}
                      onChange={(e) => setSingleDiscountPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-outline">Gross Margin</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">{singleMetrics.margin.toFixed(2)}%</p>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <p className="text-[9px] font-bold uppercase text-outline">Markup</p>
                    <p className="text-xs font-bold text-blue-700 mt-1">{singleMetrics.markup.toFixed(2)}%</p>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <p className="text-[9px] font-bold uppercase text-outline">Net Profit</p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">Rs. {singleMetrics.profit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">store</span>
                  Inventory, Unit & Barcode (Single Product)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Target Stock Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      value={singleTargetCapacity}
                      onChange={(e) => setSingleTargetCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-[9px] text-outline mt-1 font-medium">100% capacity limit of the product.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Current Stock *</label>
                    <input
                      type="number"
                      min="0"
                      value={singleStock}
                      onChange={(e) => setSingleStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-[9px] text-outline mt-1 font-medium">Current physical stock quantity.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Calculated Reorder Point (Preview)</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        disabled
                        value={`${calculatedReorderPoint} units (${reorderPercent}%)`}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-sm text-on-surface-variant font-bold outline-none"
                      />
                      <span className="absolute right-3 text-xs font-bold text-[#0b8252] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60 select-none">Auto</span>
                    </div>
                    <p className="text-[9px] text-outline mt-1 font-medium">Triggers alert at {reorderPercent}% of Target Capacity.</p>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Unit of Measurement *</label>
                    <select
                      value={singleUnit}
                      onChange={(e) => setSingleUnit(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {UNIT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Barcode Number *</label>
                    <button
                      type="button"
                      onClick={() => setSingleBarcode(createBarcode())}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Generate Barcode
                    </button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={singleBarcode}
                      onChange={(e) => setSingleBarcode(e.target.value)}
                      placeholder="e.g. 4791029384729"
                      className="flex-1 px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    {singleBarcode && (
                      <div className="flex flex-col items-center justify-center p-1.5 border border-outline-variant rounded-lg bg-white h-[42px] min-w-[70px] shrink-0">
                        <div className="flex items-center justify-center h-4 gap-[0.5px] overflow-hidden select-none">
                          {singleBarcode.split('').map((char, index) => {
                            const num = parseInt(char, 10) || 0;
                            const widthClass = num % 3 === 0 ? 'w-[2px]' : 'w-[1px]';
                            const colorClass = index % 3 === 0 && num > 4 ? 'bg-transparent' : 'bg-black';
                            return <div key={`${char}-${index}`} className={`h-full ${widthClass} ${colorClass}`} />;
                          })}
                        </div>
                        <span className="text-[7px] font-mono tracking-widest text-outline mt-0.5">{singleBarcode.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                  Variant Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variantImageMode === 'different'}
                      onChange={(e) => setVariantImageMode(e.target.checked ? 'different' : 'shared')}
                    />
                    Variants have different images
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variantImageMode === 'shared'}
                      onChange={(e) => setVariantImageMode(e.target.checked ? 'shared' : 'different')}
                    />
                    Variants share same image
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoVariantBarcode}
                      onChange={(e) => setAutoVariantBarcode(e.target.checked)}
                    />
                    Auto-generate barcode for variants
                  </label>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">table_view</span>
                    Variant Table
                  </h3>
                  <button
                    type="button"
                    onClick={openNewVariantModal}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full min-w-[980px] text-xs">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-outline uppercase tracking-wider">
                        <th className="px-3 py-2">Variant Name</th>
                        <th className="px-3 py-2">Attributes</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Image</th>
                        <th className="px-3 py-2">Barcode</th>
                        <th className="px-3 py-2">Cost</th>
                        <th className="px-3 py-2">Selling</th>
                        <th className="px-3 py-2">Stock / Capacity</th>
                        <th className="px-3 py-2">Reorder Point</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-3 py-6 text-center text-outline">
                            No variants added yet.
                          </td>
                        </tr>
                      )}
                      {variants.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-bold text-on-surface">{item.variantName}</td>
                          <td className="px-3 py-2">{item.attributeType}: {item.attributeValue || '-'}</td>
                          <td className="px-3 py-2">{item.unit}</td>
                          <td className="px-3 py-2">{item.imageUrl ? 'Uploaded' : 'N/A'}</td>
                          <td className="px-3 py-2">{item.barcode}</td>
                          <td className="px-3 py-2">{item.costPrice.toFixed(2)}</td>
                          <td className="px-3 py-2">{item.sellingPrice.toFixed(2)}</td>
                          <td className="px-3 py-2">{item.stock} / {item.targetCapacity || 100}</td>
                          <td className="px-3 py-2">{item.reorderLevel} units ({reorderPercent}%)</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditVariantModal(item)}
                                className="px-2 py-1 rounded bg-slate-100 text-on-surface-variant font-bold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVariantDelete(item.id)}
                                className="px-2 py-1 rounded bg-red-50 text-red-700 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">event</span>
              Expiry Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Manufacturing Date</label>
                <input
                  type="date"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Expiry Date (Recommended)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BAT-2026-050"
                  className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">toggle_on</span>
              Status & Flags
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Status</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="radio" checked={status === 'Active'} onChange={() => setStatus('Active')} />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input type="radio" checked={status === 'Inactive'} onChange={() => setStatus('Inactive')} />
                    Inactive
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={promotionEligible}
                  onChange={(e) => setPromotionEligible(e.target.checked)}
                />
                Promotion Eligible
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={seasonalProduct}
                  onChange={(e) => setSeasonalProduct(e.target.checked)}
                />
                Seasonal Product
              </label>
            </div>
          </div>


          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
            <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider">Live Summary</h4>
            <div className="border border-slate-100 rounded-lg p-3 space-y-2 bg-slate-50 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-on-surface block truncate">{productName || 'Unnamed Product'}</span>
                <span className="bg-primary/5 text-primary text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap">{structure}</span>
              </div>
              <p className="text-[10px] text-outline">Category: {category || '-'}</p>
              <p className="text-[10px] text-outline">Supplier: {supplier || '-'}</p>
              {structure === 'single' ? (
                <p className="text-[10px] text-outline">Stock: {singleStock} {singleUnit}</p>
              ) : (
                <p className="text-[10px] text-outline">Variants: {variants.length}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <span className="text-xs font-bold text-outline">
          {isFormDirty ? 'Unsaved changes in this form' : 'No unsaved changes'}
        </span>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onCancel(isFormDirty)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-on-surface rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-colors shadow-sm"
          >
            Save Product
          </button>
        </div>
      </div>

      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/60">
              <h3 className="text-sm font-bold text-on-surface">
                {editingVariantId ? 'Edit Variant' : 'Add Variant'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsVariantModalOpen(false);
                  resetVariantDraft();
                }}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Variant Name *</label>
                  <input
                    type="text"
                    value={variantDraft.variantName}
                    onChange={(e) => setVariantDraft((prev) => ({ ...prev, variantName: e.target.value }))}
                    placeholder="e.g. Chocolate"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Attribute Type</label>
                  <select
                    value={variantDraft.attributeType}
                    onChange={(e) =>
                      setVariantDraft((prev) => ({
                        ...prev,
                        attributeType: e.target.value as VariantItem['attributeType']
                      }))
                    }
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Size">Size</option>
                    <option value="Flavor">Flavor</option>
                    <option value="Color">Color</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">expand_more</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Attribute Value</label>
                  <input
                    type="text"
                    value={variantDraft.attributeValue}
                    onChange={(e) => setVariantDraft((prev) => ({ ...prev, attributeValue: e.target.value }))}
                    placeholder="e.g. 500g"
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Unit *</label>
                  <select
                    value={variantDraft.unit}
                    onChange={(e) => setVariantDraft((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {UNIT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-[34px] text-outline-variant text-[20px] pointer-events-none">expand_more</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Barcode *</label>
                    <button
                      type="button"
                      onClick={() => setVariantDraft((prev) => ({ ...prev, barcode: createBarcode() }))}
                      className="text-[11px] font-bold text-primary"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={variantDraft.barcode}
                    onChange={(e) => setVariantDraft((prev) => ({ ...prev, barcode: e.target.value }))}
                    disabled={autoVariantBarcode}
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Target Stock Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={variantDraft.targetCapacity || 100}
                    onChange={(e) => {
                      const capacity = Math.max(1, parseInt(e.target.value, 10) || 1);
                      const reorderVal = Math.round((reorderPercent / 100) * capacity);
                      setVariantDraft((prev) => ({
                        ...prev,
                        targetCapacity: capacity,
                        reorderLevel: reorderVal
                      }));
                    }}
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={variantDraft.stock}
                    onChange={(e) =>
                      setVariantDraft((prev) => ({ ...prev, stock: Math.max(0, parseInt(e.target.value, 10) || 0) }))
                    }
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Calculated Reorder Point (Preview)</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      value={`${Math.round((reorderPercent / 100) * (variantDraft.targetCapacity || 100))} units (${reorderPercent}%)`}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-outline-variant rounded-lg text-sm text-on-surface-variant font-bold outline-none"
                    />
                    <span className="absolute right-3 text-xs font-bold text-[#0b8252] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60 select-none">Auto</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Cost Price *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantDraft.costPrice}
                    onChange={(e) =>
                      setVariantDraft((prev) => ({ ...prev, costPrice: Math.max(0, parseFloat(e.target.value) || 0) }))
                    }
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Selling Price *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variantDraft.sellingPrice}
                    onChange={(e) =>
                      setVariantDraft((prev) => ({ ...prev, sellingPrice: Math.max(0, parseFloat(e.target.value) || 0) }))
                    }
                    className="w-full px-4 py-2.5 bg-background border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
                  Variant Image {variantImageMode === 'different' ? '*' : '(Optional)'}
                </label>
                <ProductImageUploader
                  imageUrl={variantDraft.imageUrl}
                  setImageUrl={(value) => setVariantDraft((prev) => ({ ...prev, imageUrl: value }))}
                />
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsVariantModalOpen(false);
                  resetVariantDraft();
                }}
                className="px-4 py-2 bg-white border border-outline rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVariantSave}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                Save Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
