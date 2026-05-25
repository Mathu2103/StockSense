import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ModalType = 'category' | 'brand' | 'manufacturer' | 'supplier' | null;

type SelectOption = {
  id: number;
  name: string;
  parent?: string;
};

type FormState = {
  name: string;
  itemType: string;
  categoryId: string;
  brandId: string;
  manufacturerId: string;
  sku: string;
  description: string;
  supplierId: string;
  supplierProductCode: string;
};

const initialCategories: SelectOption[] = [
  { id: 1, name: 'Dairy & Eggs' },
  { id: 2, name: 'Bakery' },
  { id: 3, name: 'Pantry' },
];

const initialBrands: SelectOption[] = [
  { id: 1, name: 'Fresh Farm' },
  { id: 2, name: 'Golden Crust' },
  { id: 3, name: 'Ocean Harvest' },
];

const initialManufacturers: SelectOption[] = [
  { id: 1, name: 'General Mills' },
  { id: 2, name: 'Nestle' },
  { id: 3, name: 'Olive & Co' },
];

const initialSuppliers: SelectOption[] = [
  { id: 1, name: 'FreshFarm Supplies' },
  { id: 2, name: 'Golden Crust Bakery' },
  { id: 3, name: 'Ocean Harvest' },
];

export default function AddNewProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalValue, setModalValue] = useState('');
  const [modalParent, setModalParent] = useState('None (Root Category)');

  const [categories, setCategories] = useState<SelectOption[]>(initialCategories);
  const [brands, setBrands] = useState<SelectOption[]>(initialBrands);
  const [manufacturers, setManufacturers] = useState<SelectOption[]>(initialManufacturers);
  const [suppliers, setSuppliers] = useState<SelectOption[]>(initialSuppliers);

  const [form, setForm] = useState<FormState>({
    name: 'Organic Whole Milk',
    itemType: 'Goods',
    categoryId: '1',
    brandId: '1',
    manufacturerId: '1',
    sku: 'MILK-ORG-1L',
    description: 'Pasteurized whole milk for daily retail sale.',
    supplierId: '1',
    supplierProductCode: 'SUP-12345',
  });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === form.categoryId),
    [categories, form.categoryId],
  );
  const selectedBrand = useMemo(
    () => brands.find((brand) => String(brand.id) === form.brandId),
    [brands, form.brandId],
  );
  const selectedManufacturer = useMemo(
    () => manufacturers.find((manufacturer) => String(manufacturer.id) === form.manufacturerId),
    [manufacturers, form.manufacturerId],
  );
  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.id) === form.supplierId),
    [suppliers, form.supplierId],
  );

  useEffect(() => {
    return () => {
      if (mainImage) URL.revokeObjectURL(mainImage);
      galleryImages.forEach((image) => URL.revokeObjectURL(image));
    };
  }, [mainImage, galleryImages]);

  const handleFieldChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setMainImage((current) => {
      if (current) URL.revokeObjectURL(current);
      return preview;
    });
  };

  const handleGalleryPick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setGalleryImages((current) => [...current, ...files.map((file) => URL.createObjectURL(file))].slice(0, 6));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const addModalEntry = () => {
    const value = modalValue.trim();
    if (!value) return;

    if (activeModal === 'category') {
      const nextId = categories.length ? Math.max(...categories.map((category) => category.id)) + 1 : 1;
      setCategories((current) => [...current, { id: nextId, name: value, parent: modalParent }]);
      setForm((current) => ({ ...current, categoryId: String(nextId) }));
    }

    if (activeModal === 'brand') {
      const nextId = brands.length ? Math.max(...brands.map((brand) => brand.id)) + 1 : 1;
      setBrands((current) => [...current, { id: nextId, name: value }]);
      setForm((current) => ({ ...current, brandId: String(nextId) }));
    }

    if (activeModal === 'manufacturer') {
      const nextId = manufacturers.length ? Math.max(...manufacturers.map((manufacturer) => manufacturer.id)) + 1 : 1;
      setManufacturers((current) => [...current, { id: nextId, name: value }]);
      setForm((current) => ({ ...current, manufacturerId: String(nextId) }));
    }

    if (activeModal === 'supplier') {
      const nextId = suppliers.length ? Math.max(...suppliers.map((supplier) => supplier.id)) + 1 : 1;
      setSuppliers((current) => [...current, { id: nextId, name: value }]);
      setForm((current) => ({ ...current, supplierId: String(nextId) }));
    }

    setModalValue('');
    setModalParent('None (Root Category)');
    setActiveModal(null);
  };

  const deleteModalEntry = (id: number) => {
    if (activeModal === 'category') {
      setCategories((current) => current.filter((item) => item.id !== id));
    }

    if (activeModal === 'brand') {
      setBrands((current) => current.filter((item) => item.id !== id));
    }

    if (activeModal === 'manufacturer') {
      setManufacturers((current) => current.filter((item) => item.id !== id));
    }

    if (activeModal === 'supplier') {
      setSuppliers((current) => current.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      window.alert(`Saved draft product: ${form.name}`);
      navigate('/manage-products');
    }, 350);
  };

  const gallerySlots = 6;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-surface-container-lowest font-sans text-on-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-container-lowest">
        {/* Header */}
        <InventoryHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Breadcrumbs */}
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
              <Link to="/manage-products" className="font-medium text-outline hover:text-on-surface">
                Products
              </Link>
              <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
              <span className="truncate font-bold text-primary">Add New Item</span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline-variant">search</span>
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full rounded-full border border-outline-variant bg-background py-2 pl-9 pr-4 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </InventoryHeader>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-surface-container-lowest px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <form className="mx-auto w-full max-w-[1100px] pb-10 sm:pb-12" onSubmit={handleSubmit}>

            <div className="mb-6 sm:mb-8">
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Create New Inventory Item</h1>
              <p className="text-on-surface-variant text-sm">Fill in the primary details to list a new product in the central warehouse.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Left Column - Form */}
              <div className="space-y-6 lg:col-span-2">

                {/* Basic Details Panel */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-center gap-2 sm:mb-6">
                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                    <h2 className="text-lg font-bold text-on-surface sm:text-xl">Basic Details</h2>
                  </div>

                  <div className="space-y-5">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Product Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={handleFieldChange('name')}
                        className="w-full rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Item Type & Category */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Item Type</label>
                        <div className="relative">
                          <select
                            value={form.itemType}
                            onChange={handleFieldChange('itemType')}
                            className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option>Goods</option>
                            <option>Raw Material</option>
                            <option>Finished Item</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Category</label>
                          <button type="button" onClick={() => setActiveModal('category')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select
                            value={form.categoryId}
                            onChange={handleFieldChange('categoryId')}
                            className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Brand & SKU */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Brand</label>
                          <button type="button" onClick={() => setActiveModal('brand')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select
                            value={form.brandId}
                            onChange={handleFieldChange('brandId')}
                            className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                          >
                            {brands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">SKU (Stock Keeping Unit)</label>
                        <input
                          type="text"
                          value={form.sku}
                          onChange={handleFieldChange('sku')}
                          className="w-full rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Manufacturer (half width) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Manufacturer</label>
                          <button type="button" onClick={() => setActiveModal('manufacturer')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select
                            value={form.manufacturerId}
                            onChange={handleFieldChange('manufacturerId')}
                            className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                          >
                            {manufacturers.map((manufacturer) => (
                              <option key={manufacturer.id} value={manufacturer.id}>
                                {manufacturer.name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
                      <textarea
                        placeholder="Brief details about the product..."
                        rows={4}
                        value={form.description}
                        onChange={handleFieldChange('description')}
                        className="w-full resize-none rounded-lg border border-outline-variant bg-background px-4 py-3 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>

                    {/* Supplier & Product Code */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Supplier</label>
                          <button type="button" onClick={() => setActiveModal('supplier')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select
                            value={form.supplierId}
                            onChange={handleFieldChange('supplierId')}
                            className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                          >
                            {suppliers.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Supplier Product Code</label>
                        <input
                          type="text"
                          value={form.supplierProductCode}
                          onChange={handleFieldChange('supplierProductCode')}
                          className="w-full rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Additional Panels (Just to match layout feeling if there's more below) */}
                <div className="grid grid-cols-1 gap-4 opacity-30 pointer-events-none sm:grid-cols-2 sm:gap-6">
                  <div className="h-16 border border-outline-variant rounded-xl"></div>
                  <div className="h-16 border border-outline-variant rounded-xl"></div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Item Media */}
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">image</span>
                    <h2 className="text-lg font-bold text-on-surface sm:text-xl">Item Media</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-on-surface-variant mb-2">Front View (Required)</p>
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline bg-background transition-colors hover:bg-surface-container sm:h-48"
                      >
                        {mainImage ? (
                          <>
                            <img src={mainImage} alt="Product preview" className="h-full w-full rounded-xl object-cover" />
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mb-2 text-4xl text-slate-300">add_photo_alternate</span>
                            <p className="mb-1 text-sm font-medium text-on-surface-variant">Click to upload main image</p>
                            <p className="text-[10px] text-outline-variant">Max size: 5MB (PNG, JPG)</p>
                          </>
                        )}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-on-surface-variant mb-2">Gallery Images</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {galleryImages.map((image, index) => (
                          <button key={image} type="button" className="aspect-square overflow-hidden rounded-lg border border-outline-variant bg-background transition-colors hover:bg-surface-container">
                            <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                        {Array.from({ length: Math.max(0, gallerySlots - galleryImages.length) }).map((_, index) => (
                          <button
                            key={`gallery-placeholder-${index}`}
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="aspect-square rounded-lg border border-outline-variant bg-background transition-colors hover:bg-surface-container"
                          >
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-outline-variant">add</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryPick} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">visibility</span>
                    <h2 className="text-lg font-bold text-on-surface sm:text-xl">Live Preview</h2>
                  </div>
                  <div className="space-y-3 rounded-xl border border-outline-variant bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-on-surface">{form.name}</p>
                        <p className="text-sm text-outline">SKU: {form.sku}</p>
                      </div>
                      <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">
                        {selectedCategory?.name ?? 'Category'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Brand</p>
                        <p className="mt-1 font-semibold text-on-surface">{selectedBrand?.name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Supplier</p>
                        <p className="mt-1 font-semibold text-on-surface">{selectedSupplier?.name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Manufacturer</p>
                        <p className="mt-1 font-semibold text-on-surface">{selectedManufacturer?.name ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Code</p>
                        <p className="mt-1 font-semibold text-on-surface">{form.supplierProductCode}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{form.description}</p>
                  </div>
                </div>

                {/* Quick Tip */}
                <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-white shadow-md sm:p-6">
                  <div className="relative z-10">
                    <h3 className="font-bold mb-2">Quick Tip</h3>
                    <p className="text-sm text-blue-50 leading-relaxed">
                      Adding high-quality images and clear descriptions helps the billing team identify products faster during peak hours.
                    </p>
                  </div>
                  <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-blue-500 opacity-30 pointer-events-none">lightbulb</span>
                </div>

              </div>

              <div className="shrink-0 border-t border-outline-variant bg-background px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-sm font-medium text-outline">Unsaved changes detected</span>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-4">
                    <button
                      type="button"
                      onClick={() => navigate('/manage-products')}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface sm:px-6"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="material-symbols-outlined text-sm">save</span>
                      {saving ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </form>

        </main>

      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/50 p-4 sm:p-5">
              <h2 className="text-base font-bold text-on-surface sm:text-lg">
                {activeModal === 'category' ? 'Manage Categories' :
                  activeModal === 'brand' ? 'Manage Brands' :
                    activeModal === 'manufacturer' ? 'Manage Manufacturers' :
                      'Manage Suppliers'}
              </h2>
              <button type="button" onClick={() => setActiveModal(null)} className="text-outline-variant hover:text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[calc(90vh-120px)] space-y-6 overflow-y-auto p-4 sm:p-6">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  {activeModal === 'category' ? 'Add New Category' :
                    activeModal === 'brand' ? 'Add New Brand' :
                      activeModal === 'manufacturer' ? 'Add New Manufacturer' :
                        'Add New Supplier'}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={modalValue}
                    onChange={(event) => setModalValue(event.target.value)}
                    placeholder={`e.g. ${activeModal === 'category' ? 'Snacks & Sweets' :
                      activeModal === 'brand' ? 'Nestle' :
                        activeModal === 'manufacturer' ? 'General Mills' :
                          'Acme Corp'
                      }`}
                    className="flex-1 rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
                  />
                  <button type="button" onClick={addModalEntry} className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:opacity-90">
                    Add
                  </button>
                </div>
              </div>

              {activeModal === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Parent Category</label>
                  <div className="relative">
                    <select
                      value={modalParent}
                      onChange={(event) => setModalParent(event.target.value)}
                      className="w-full appearance-none rounded-lg border border-outline-variant bg-background px-4 py-2.5 text-sm text-on-surface-variant outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>None (Root Category)</option>
                      {categories.map((category) => (
                        <option key={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-3">
                  Existing {activeModal === 'category' ? 'Categories' :
                    activeModal === 'brand' ? 'Brands' :
                      activeModal === 'manufacturer' ? 'Manufacturers' :
                        'Suppliers'}
                </label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-outline-variant bg-background/50 p-2 pr-2">
                  {(activeModal === 'category' ? categories : activeModal === 'brand' ? brands : activeModal === 'manufacturer' ? manufacturers : suppliers).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="material-symbols-outlined text-xl text-primary">
                          {activeModal === 'category' ? 'folder' :
                            activeModal === 'brand' ? 'label' :
                              'factory'}
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-on-surface-variant">{item.name}</span>
                          {item.parent && activeModal === 'category' ? <span className="block truncate text-[11px] text-outline">Parent: {item.parent}</span> : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteModalEntry(item.id)}
                        className="rounded-md p-1.5 text-outline-variant transition-colors hover:bg-background hover:text-red-600"
                        aria-label={`Delete ${item.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-start border-t border-outline-variant/50 bg-background p-4 sm:p-5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-outline bg-surface-container-lowest px-6 py-2.5 text-sm font-medium text-on-surface-variant shadow-sm transition-colors hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
