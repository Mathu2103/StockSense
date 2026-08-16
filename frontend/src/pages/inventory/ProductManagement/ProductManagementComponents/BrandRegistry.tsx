import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductItem } from './ProductsRegistry';
import Pagination from '@/components/shared/Pagination';
import { toast } from 'sonner';

export type BrandItem = {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
};

type BrandRegistryProps = {
  brands: BrandItem[];
  products: ProductItem[];
  onAddBrand: (brand: Omit<BrandItem, 'id' | 'status'>) => void;
  onEditBrand: (id: string, updatedFields: Partial<BrandItem>) => void;
  onArchiveBrand: (id: string) => void;
  onRestoreBrand: (id: string) => void;
  openAddModalTrigger?: number;
};

export default function BrandRegistry({
  brands,
  products,
  onAddBrand,
  onEditBrand,
  onArchiveBrand,
  onRestoreBrand,
  openAddModalTrigger,
}: BrandRegistryProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (openAddModalTrigger && openAddModalTrigger > 0) {
      setEditingBrand(null);
      setBrandName('');
      setDescription('');
      setIsModalOpen(true);
    }
  }, [openAddModalTrigger]);

  // Filter & Status States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Brand Counts
  const countAllBrands = brands.length;
  const countActiveBrands = useMemo(() => brands.filter(b => b.status === 'Active').length, [brands]);
  const countInactiveBrands = useMemo(() => brands.filter(b => b.status === 'Inactive').length, [brands]);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    return brands.filter((b) => {
      const matchesSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (statusFilter === 'ACTIVE') return b.status === 'Active';
      if (statusFilter === 'INACTIVE') return b.status === 'Inactive';
      return true;
    });
  }, [brands, search, statusFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, brands, statusFilter]);

  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBrands.slice(start, start + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  const getBrandProductCount = (brandName: string) =>
    products.filter((product) => product.brand.toLowerCase() === brandName.toLowerCase()).length;

  const getBrandProducts = (brandName: string) =>
    products.filter((product) => product.brand.toLowerCase() === brandName.toLowerCase());

  const handleToggleExpandedBrand = (brandId: string) => {
    setExpandedBrandId((current) => (current === brandId ? null : brandId));
  };

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setBrandName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: BrandItem) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setDescription(brand.description);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const trimmedName = brandName.trim();
    const trimmedDesc = description.trim();
    if (!trimmedName) {
      toast.error('Please enter a valid brand name.');
      return;
    }
    if (trimmedName.length > 50) {
      toast.error('Brand name must be 50 characters or less.');
      return;
    }
    if (trimmedDesc.length > 250) {
      toast.error('Brand description must be 250 characters or less.');
      return;
    }

    if (editingBrand) {
      onEditBrand(editingBrand.id, { name: trimmedName, description: trimmedDesc });
    } else {
      onAddBrand({ name: trimmedName, description: trimmedDesc });
    }

    setBrandName('');
    setDescription('');
    setEditingBrand(null);
    setIsModalOpen(false);

    if (!editingBrand && returnTo) {
      navigate(`/manage-products?tab=${returnTo}`);
    }
  };


  return (
    <div className="space-y-6">
      
      {/* 1. Compact Search & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 bg-surface-container-lowest border border-outline-variant/60 p-3 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by name or details..."
            className="w-full bg-background border border-outline-variant rounded-lg pl-9 pr-8 py-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="inline-flex p-1 bg-slate-100/90 border border-outline-variant/50 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'ALL' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Brands</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countAllBrands}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'ACTIVE' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${statusFilter === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countActiveBrands}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              statusFilter === 'INACTIVE' ? 'bg-[#0b8252] text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Inactive</span>
            <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${statusFilter === 'INACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>{countInactiveBrands}</span>
          </button>
        </div>
      </div>

      {/* 2. Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-slate-50 border border-outline-variant rounded-full flex items-center justify-center mb-3 text-outline-variant">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface mb-1">No Brands Found</h4>
          <p className="text-xs text-outline max-w-sm">
            {brands.length === 0
              ? 'Register new grocery brands or supermarket private labels to associate with catalog products.'
              : 'No brands match your search query. Try typing another brand label.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paginatedBrands.map((brand) => (
              <div
                key={brand.id}
                role="button"
                tabIndex={0}
                onClick={() => handleToggleExpandedBrand(brand.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleExpandedBrand(brand.id);
                  }
                }}
                className={`group bg-surface-container-lowest border rounded-2xl p-5 shadow-sm hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer ${expandedBrandId === brand.id ? 'border-primary/50 shadow-md ring-1 ring-primary/10' : 'border-outline-variant'}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary-container text-primary flex items-center justify-center font-black text-sm uppercase shadow-sm ring-1 ring-primary/10">
                        {brand.name.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-on-surface text-base tracking-tight">{brand.name}</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.12em] ${brand.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {brand.status}
                          </span>
                          <span className="text-[10px] font-bold text-outline">
                            {getBrandProductCount(brand.name)} products
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-0.5 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(brand);
                        }}
                        title="Edit Brand"
                        className="p-1.5 rounded-lg text-outline-variant hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      {brand.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchiveBrand(brand.id);
                          }}
                          title="Archive Brand"
                          className="p-1.5 rounded-lg text-outline-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">archive</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreBrand(brand.id);
                          }}
                          title="Restore Brand"
                          className="p-1.5 rounded-lg text-outline-variant hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">unarchive</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 min-h-[48px]">
                    {brand.description || 'No description provided for this supermarket brand.'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-outline-variant">
                      {expandedBrandId === brand.id ? 'Click to hide products' : 'Click to view allocated products'}
                    </span>
                    <span className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-300 ${expandedBrandId === brand.id ? 'rotate-90' : 'group-hover:translate-x-1'}`}>
                      arrow_forward
                    </span>
                  </div>

                  {expandedBrandId === brand.id && (
                    <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Allocated Products</p>
                          <p className="text-[11px] text-outline">Products assigned to {brand.name}</p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary border border-primary/10">
                          {getBrandProductCount(brand.name)} total
                        </div>
                      </div>

                      {getBrandProducts(brand.name).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-outline-variant bg-white px-4 py-5 text-center text-xs text-outline">
                          No products are currently assigned to this brand.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                          {getBrandProducts(brand.name).map((product) => (
                            <div key={product.id} className="rounded-xl border border-outline-variant/60 bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-on-surface truncate">{product.name}</p>
                                <p className="text-[11px] text-outline">SKU {product.sku} · {product.category}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-black text-primary">Rs. {product.sellingPrice.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-outline">Stock {product.stock}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBrands.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 9, 12]}
            itemName="brands"
            className="rounded-xl border"
          />
        </div>
      )}

      {/* 3. Add/Edit Brand Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/60 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">workspace_premium</span>
                  <h2 className="text-base font-bold text-on-surface">
                    {editingBrand ? 'Modify Brand Details' : 'Register New Brand'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setBrandName('');
                    setDescription('');
                    setEditingBrand(null);
                    if (returnTo) navigate(`/manage-products?tab=${returnTo}`);
                  }}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Brand Label Name *
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Anchor, Coca-Cola, Sunlight"
                    className="w-full px-3.5 py-2.5 bg-background border border-outline-variant rounded-lg text-xs font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Brand Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe manufacturing lines, supply origin, or catalog details..."
                    rows={4}
                    className="w-full px-3.5 py-2 bg-background border border-outline-variant rounded-lg text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-outline-variant/60 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setBrandName('');
                    setDescription('');
                    setEditingBrand(null);
                    if (returnTo) navigate(`/manage-products?tab=${returnTo}`);
                  }}
                  className="px-4 py-2 bg-white border border-outline rounded-lg text-xs font-bold text-on-surface-variant hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  {editingBrand ? 'Save Changes' : 'Register Brand'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
}
