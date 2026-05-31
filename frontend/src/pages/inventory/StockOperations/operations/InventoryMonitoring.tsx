import { useEffect, useState, useMemo } from 'react';
import { inventoryOperationsService, ProductItem } from './inventoryOperationsService';

export default function InventoryMonitoring() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'stock-desc' | 'stock-asc' | 'value-desc'>('stock-asc');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const prods = await inventoryOperationsService.getProducts();
    setProducts(prods);
  };

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Mock ordering trigger for smart reorder suggestions
  const handleRestockOrder = (productName: string) => {
    triggerToast(`Restock purchase order initiated for: "${productName}" (sent to Procurement)`);
  };

  // 1. DYNAMIC CATEGORIES FOR SELECTOR
  const categoriesList = useMemo(() => {
    const unique = new Set(products.map(p => p.category));
    return ['All', ...Array.from(unique)];
  }, [products]);

  // 2. STOCK HEALTH CALCULATIONS & VALUE METRICS
  const healthStats = useMemo(() => {
    let optimalCount = 0;
    let lowCount = 0;
    let outCount = 0;
    let totalCostVal = 0;
    let totalSellingVal = 0;

    products.forEach(p => {
      const costVal = p.stock * p.costPrice;
      const sellingVal = p.stock * p.sellingPrice;
      totalCostVal += costVal;
      totalSellingVal += sellingVal;

      if (p.stock === 0) {
        outCount++;
      } else if (p.stock <= p.reorderLevel) {
        lowCount++;
      } else {
        optimalCount++;
      }
    });

    const totalCount = products.length;
    const optimalPct = totalCount > 0 ? Math.round((optimalCount / totalCount) * 100) : 0;
    const lowPct = totalCount > 0 ? Math.round((lowCount / totalCount) * 100) : 0;
    const outPct = totalCount > 0 ? Math.round((outCount / totalCount) * 100) : 0;

    return {
      optimalCount,
      lowCount,
      outCount,
      optimalPct,
      lowPct,
      outPct,
      totalCostVal,
      totalSellingVal,
      totalCount
    };
  }, [products]);

  // 3. SMART REORDER SUGGESTIONS
  const reorderSuggestions = useMemo(() => {
    return products
      .filter(p => p.stock <= p.reorderLevel)
      .map(p => {
        const severity = p.stock === 0 ? 'CRITICAL' : 'WARNING';
        const neededQty = Math.max(50, p.reorderLevel * 3 - p.stock); // Suggest optimal restock order
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          threshold: p.reorderLevel,
          severity,
          suggestedQty: neededQty
        };
      });
  }, [products]);

  // 4. FILTER & SORT PROCESSOR
  const processedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stock-desc') {
      filtered.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'stock-asc') {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'value-desc') {
      filtered.sort((a, b) => (b.stock * b.sellingPrice) - (a.stock * a.sellingPrice));
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-emerald-400">info</span>
          <span className="text-xs font-extrabold text-white">{toast}</span>
        </div>
      )}

      {/* DOCK STATISTICS AND VALUE CALCULATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Optimal Stock Level</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800">{healthStats.optimalCount} SKU(s)</span>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{healthStats.optimalPct}% Health</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${healthStats.optimalPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Low Stock Alert</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800">{healthStats.lowCount} SKU(s)</span>
            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{healthStats.lowPct}% Warning</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${healthStats.lowPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Out of Stock Count</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-800">{healthStats.outCount} SKU(s)</span>
            <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">{healthStats.outPct}% Critical</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${healthStats.outPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Inventory Value Summary</span>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Estimated Cost Value:</span>
              <span className="font-mono text-slate-700">Rs. {healthStats.totalCostVal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-[#0b8252]">
              <span>Potential Retail Value:</span>
              <span className="font-mono">Rs. {healthStats.totalSellingVal.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-extrabold text-center border-t border-slate-100 pt-1">
            Auditing {healthStats.totalCount} active items in stock catalog.
          </div>
        </div>
      </div>

      {/* SMART REORDER SUGGESTIONS CORNER */}
      {reorderSuggestions.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 animate-bounce">info</span>
            <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider">Smart Reorder Suggestions ({reorderSuggestions.length})</h3>
          </div>
          <p className="text-[11px] text-amber-700 font-bold">
            The following catalog products have dipped below reorder thresholds. Restock processes are advised to prevent replenishment delays.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {reorderSuggestions.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white border border-amber-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                <div>
                  <span className={`inline-block px-2 py-0.5 text-[8px] font-black rounded mb-1.5 ${item.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {item.severity}
                  </span>
                  <h4 className="text-xs font-black text-slate-800 truncate max-w-[150px]">{item.name}</h4>
                  <div className="text-[10px] text-slate-400 font-extrabold mt-0.5">
                    Stock: <span className="text-slate-700 font-black">{item.stock}</span> / Threshold: {item.threshold}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestockOrder(item.name)}
                  className="px-2.5 py-1.5 bg-amber-600 text-white rounded text-[10px] font-black hover:bg-amber-700 transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span className="material-symbols-outlined text-[12px]">refresh</span>
                  Restock ({item.suggestedQty})
                </button>
              </div>
            ))}
            {reorderSuggestions.length > 3 && (
              <div className="bg-amber-100/30 border border-dashed border-amber-200 rounded-xl p-4 flex items-center justify-center text-center">
                <span className="text-xs font-black text-amber-800">
                  + {reorderSuggestions.length - 3} more critical restock warnings.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER & REGISTRY GRID */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        {/* Real-time search and sorting control bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex-1 flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by SKU, name..."
                className="w-full md:w-80 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[16px]">search</span>
            </div>

            {/* Filter Category */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
              >
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Sorter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sort Status</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
            >
              <option value="stock-asc">Stock Level (Low to High)</option>
              <option value="stock-desc">Stock Level (High to Low)</option>
              <option value="name">Product Alphabetical</option>
              <option value="value-desc">Highest Stock Value</option>
            </select>
          </div>
        </div>

        {/* HIGH-DENSITY AUDIT REGISTRY TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] border-b border-slate-200 sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm">
                <th className="px-4 py-3">Product Profile</th>
                <th className="px-4 py-3">SKU ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Reorder Threshold</th>
                <th className="px-4 py-3 text-center">Available Stock</th>
                <th className="px-4 py-3 text-right">Selling Price</th>
                <th className="px-4 py-3 text-right">Potential Value</th>
                <th className="px-4 py-3 text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {processedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-bold">
                    No active product nodes match filters.
                  </td>
                </tr>
              ) : (
                processedProducts.map((p) => {
                  const stockValue = p.stock * p.sellingPrice;
                  let badge = null;

                  if (p.stock === 0) {
                    badge = (
                      <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded-full border border-rose-100">
                        Out of Stock
                      </span>
                    );
                  } else if (p.stock <= p.reorderLevel) {
                    badge = (
                      <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[10px] rounded-full border border-amber-100">
                        Low Stock Alert
                      </span>
                    );
                  } else {
                    badge = (
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-100">
                        In Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      {/* Product Name profile */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover border border-slate-100" alt={p.name} />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 text-slate-500 font-extrabold rounded-lg flex items-center justify-center text-xs">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="block font-black text-slate-800 text-xs">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Barcode: {p.barcode}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-bold">{p.sku}</td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-500 font-bold">{p.category}</td>

                      {/* Reorder Level */}
                      <td className="px-4 py-3.5 text-center text-slate-500 font-bold">{p.reorderLevel} {p.unitType}s</td>

                      {/* Stock count */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-black text-xs ${p.stock === 0 ? 'text-rose-600 font-black' : p.stock <= p.reorderLevel ? 'text-amber-600' : 'text-slate-800'}`}>
                          {p.stock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-extrabold">{p.unitType}s</span>
                      </td>

                      {/* Selling price */}
                      <td className="px-4 py-3.5 text-right font-bold text-slate-600">Rs. {p.sellingPrice.toFixed(2)}</td>

                      {/* Value summary */}
                      <td className="px-4 py-3.5 text-right font-black text-slate-800 font-mono">Rs. {stockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>

                      {/* Badge status */}
                      <td className="px-4 py-3.5 text-center">{badge}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
