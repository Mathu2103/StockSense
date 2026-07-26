import { useEffect, useState } from 'react';
import { comboService } from '../../services/comboService';

export default function CashierCombos() {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosCombos = async () => {
    try {
      setLoading(true);
      const payload = await comboService.getPosActiveCombos();
      if (payload.success) {
        setCombos(payload.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosCombos();
  }, []);

  const filtered = combos.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.comboCode.toLowerCase().includes(search.toLowerCase()) ||
    c.items.some((i: any) => i.product?.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans text-gray-900 bg-gray-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          POS Active Combo Deals <span className="text-emerald-500">⚡</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Cashier search screen for looking up active bundle discount codes at checkout.</p>
      </div>

      {/* Search Filter */}
      <div className="max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-gray-400 pl-2">search</span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by combo code, product name..."
          className="w-full text-sm outline-none bg-transparent py-2"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading active cashier offers...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-gray-400">
          No matching active combo promotions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((combo) => (
            <div key={combo.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-gray-900 leading-snug">{combo.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">CODE: {combo.comboCode}</p>
                </div>
                <span className="bg-emerald-800 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                  {combo.discountPercentage.toFixed(0)}% OFF
                </span>
              </div>

              {/* Items details */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Required Items</p>
                {combo.items.map((item: any, idx: number) => (
                  <div key={idx} className="text-xs flex justify-between items-baseline font-medium text-gray-700">
                    <span className="line-clamp-1 w-2/3">{item.quantity}x {item.product?.name}</span>
                    <span className="text-gray-400 font-mono text-[10px]">({item.product?.sku})</span>
                  </div>
                ))}
              </div>

              {/* Pricing detail */}
              <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                <div>
                  <span className="text-gray-400 line-through text-xs">Rs. {combo.normalTotalPrice.toFixed(0)}</span>
                  <p className="text-lg font-black text-emerald-800">Rs. {combo.comboPrice.toFixed(0)}</p>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-bold">
                  Ends: {new Date(combo.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
