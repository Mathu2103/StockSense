import { useEffect, useState } from 'react';
import { DiscountService } from '../../services/discountService';

export default function OffersPage() {
  const [mounted, setMounted] = useState(false);
  const [combos, setCombos] = useState<any[]>([]);
  const [seasonals, setSeasonals] = useState<any[]>([]);
  const [dailys, setDailys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchOffers = async () => {
      try {
        const response = await DiscountService.getDiscounts();
        if (response.success) {
          const allDiscounts = response.data.filter((d: any) => d.isActive && d.approvalStatus === 'APPROVED');
          
          setCombos(allDiscounts.filter((d: any) => d.type === 'COMBO'));
          setSeasonals(allDiscounts.filter((d: any) => d.type === 'SEASONAL'));
          setDailys(allDiscounts.filter((d: any) => d.type === 'DAILY'));
        }
      } catch (error) {
        console.error("Failed to fetch discounts", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden font-sans pb-32">
      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111827]"></div>
          </div>
        ) : (
          <>
            {/* 1. Curated Combos Section */}
            {combos.length > 0 && (
              <section className="mb-24">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-[#103e2c] mb-1">Combo Offers</h2>
                  <p className="text-gray-600 text-sm">Perfect pairings at a premium price.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {combos.map((combo: any) => {
                    const originalPrice = combo.comboItems?.reduce((sum: number, item: any) => sum + (item.sellingPrice * item.minQty), 0) || 0;
                    const displayPrice = combo.comboPrice || originalPrice * (1 - (combo.discountValue || 0) / 100);
                    
                    return (
                      <div key={combo.id} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row h-auto sm:h-72 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="relative w-full sm:w-1/2 h-48 sm:h-full bg-gray-50 flex items-center justify-center p-4">
                          <img 
                            src={combo.imageUrl || "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop"} 
                            alt={combo.name} 
                            className="w-full h-full object-cover rounded-lg shadow-sm" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop'; }}
                          />
                          <div className="absolute top-6 left-6 bg-[#0a3822] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                            {combo.discountValue ? `${combo.discountValue}% OFF` : 'COMBO'}
                          </div>
                        </div>
                        <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center">
                          <h3 className="text-xl font-extrabold text-gray-900 mb-1">{combo.name}</h3>
                          {combo.label && <p className="text-[#166534] font-semibold text-xs mb-2">{combo.label}</p>}
                          <div className="text-gray-500 text-xs mb-5 leading-relaxed pr-4 space-y-1">
                            {combo.comboItems?.map((i: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">{i.minQty}x</span>
                                <span>{i.productName}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mb-1">
                            <span className="text-gray-400 line-through text-xs mr-2 font-medium">Rs. {originalPrice.toFixed(2)}</span>
                          </div>
                          <div className="text-gray-900 font-extrabold text-2xl mb-6">Rs. {displayPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. Seasonal Specials Section */}
            {seasonals.length > 0 && (
              <section className="mb-32">
                <div className="mb-14 text-center">
                  <h2 className="text-3xl font-bold text-[#103e2c] mb-2">Seasonal Offers</h2>
                  <p className="text-gray-600 text-sm">Fresh savings for the current season.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                  {seasonals.slice(0, 3).map((seasonal: any) => {
                    return (
                      <div key={seasonal.id} className="flex flex-col items-center text-center">
                        <div className="w-64 h-64 shrink-0 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white mb-6 flex justify-center items-center">
                          <img 
                            src={seasonal.imageUrl || seasonal.products?.[0]?.imageUrl || "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"} 
                            alt={seasonal.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = seasonal.products?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop'; }}
                          />
                        </div>
                        <span className="inline-block bg-[#475569] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide mb-3">
                          {seasonal.discountValue ? `${seasonal.discountValue}% OFF` : 'SPECIAL'}
                        </span>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{seasonal.name}</h3>
                        <p className="text-[#0f766e] font-medium text-sm mb-2">{seasonal.label || 'Exclusive Seasonal Offer'}</p>
                        
                        {seasonal.endDate && (
                          <p className="text-gray-400 text-xs mb-3">Valid till: {new Date(seasonal.endDate).toLocaleDateString()}</p>
                        )}
                        
                        {seasonal.products && seasonal.products.length > 0 && (
                          <p className="text-gray-500 text-xs mb-6 px-4 truncate w-full max-w-[250px]">
                            On {seasonal.products[0].name} {seasonal.products.length > 1 ? `& ${seasonal.products.length - 1} more items` : ''}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Daily Sales Section */}
            {dailys.length > 0 && (
              <section className="mb-24">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#103e2c] mb-1 flex items-center gap-2">Daily Offers <span className="text-emerald-400">⚡</span></h2>
                    <p className="text-gray-600 text-sm">Limited time daily offers. Act fast!</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dailys.slice(0, 3).map((daily: any) => {
                    return (
                      <div key={daily.id} className="relative h-[340px] rounded-2xl overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-300">
                        <img 
                          src={daily.imageUrl || daily.products?.[0]?.imageUrl || "https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop"} 
                          alt={daily.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          onError={(e) => { (e.target as HTMLImageElement).src = daily.products?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/95 via-[#064e3b]/60 to-transparent"></div>
                        
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 flex items-center gap-2">
                           <span className="material-symbols-outlined text-white text-[14px]">schedule</span>
                           <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                             {daily.dailyEndTime ? `Ends ${daily.dailyEndTime}` : 'ENDS TODAY'}
                           </span>
                        </div>

                        <div className="absolute top-4 left-4">
                           <span className="bg-[#fbbf24] text-amber-900 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wide">
                             FLASH SALE
                           </span>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 pb-[90px]">
                          <p className="text-[#a7f3d0] font-semibold text-xs mb-1 uppercase tracking-wider">{daily.label || 'Daily Deal'}</p>
                          <h3 className="text-white text-2xl font-bold mb-2 leading-tight">{daily.name}</h3>
                          
                          {daily.products && daily.products.length > 0 && (
                            <p className="text-white/80 text-sm mb-2 truncate">
                              Incl. {daily.products[0].name} {daily.products.length > 1 ? `+${daily.products.length - 1} items` : ''}
                            </p>
                          )}
                        </div>
                        
                        <div className="absolute bottom-[90px] right-6 w-[70px] h-[70px] rounded-full bg-[#34d399] text-[#064e3b] flex flex-col items-center justify-center shadow-lg shadow-green-900/30 border-2 border-[#a7f3d0]">
                          <span className="text-[9px] font-bold uppercase leading-none mb-1">Save</span>
                          <span className="text-lg font-extrabold leading-none">{daily.discountValue || 0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty State if no offers at all */}
            {combos.length === 0 && seasonals.length === 0 && dailys.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No active offers right now</h3>
                <p className="text-gray-500">Please check back later for exciting deals and combos!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
