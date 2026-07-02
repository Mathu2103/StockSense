import { useEffect, useState } from 'react';
import { DiscountService } from '../../services/discountService';

export default function OffersPage() {
  const [mounted, setMounted] = useState(false);
  const [combos, setCombos] = useState<any[]>([]);
  const [seasonals, setSeasonals] = useState<any[]>([]);
  const [dailys, setDailys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [showAllSeasonal, setShowAllSeasonal] = useState(false);
  const [showAllDaily, setShowAllDaily] = useState(false);

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

  const seasonalProducts = seasonals.flatMap(discount => 
    (discount.products || []).map((prod: any) => ({ discount, prod }))
  );

  const dailyProducts = dailys.flatMap(discount => 
    (discount.products || []).map((prod: any) => ({ discount, prod }))
  );

  // Example add to cart for public page
  const handleAddToCart = (prod: any, discount: any) => {
    // In a real public page, this would add to a local cart state or redirect to login.
    // For now, we'll just show an alert or placeholder.
    alert(`Added ${prod.name} to cart with ${discount.discountValue}% off!`);
  };

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
                  {(showAllCombos ? combos : combos.slice(0, 2)).map((combo: any) => {
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
                
                {combos.length > 2 && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => setShowAllCombos(!showAllCombos)}
                      className="px-6 py-2 border-2 border-[#103e2c] text-[#103e2c] font-bold rounded-full hover:bg-[#103e2c] hover:text-white transition-colors"
                    >
                      {showAllCombos ? 'Show Less' : `See All Combos (${combos.length})`}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 2. Seasonal Specials Section */}
            {seasonalProducts.length > 0 && (
              <section className="mb-32">
                <div className="mb-14 text-center">
                  <h2 className="text-3xl font-bold text-[#103e2c] mb-2">Seasonal Offers</h2>
                  <p className="text-gray-600 text-sm">Fresh savings for the current season.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
                  {(showAllSeasonal ? seasonalProducts : seasonalProducts.slice(0, 5)).map(({ discount, prod }, idx) => {
                    const discountedPrice = prod.sellingPrice * (1 - discount.discountValue / 100);
                    return (
                      <div key={`${discount.id}-${prod.sku}-${idx}`} className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all border border-gray-100 group">
                        <div className="w-32 h-32 shrink-0 rounded-full overflow-hidden shadow-md border-2 border-emerald-50 bg-gray-50 mb-4 flex justify-center items-center group-hover:scale-105 transition-transform">
                          <img 
                            src={prod.imageUrl || "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"} 
                            alt={prod.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="inline-block bg-[#103e2c] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider mb-3">
                          {discount.label || 'SPECIAL'}
                        </span>
                        
                        <h3 className="text-sm font-extrabold text-gray-900 mb-1 line-clamp-2 min-h-[40px] leading-snug">{prod.name}</h3>
                        
                        <div className="flex flex-col items-center gap-0.5 mb-2 mt-1">
                          <span className="text-gray-400 line-through text-xs font-semibold">Rs. {prod.sellingPrice.toFixed(2)}</span>
                          <span className="text-emerald-700 font-black text-lg">Rs. {discountedPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {seasonalProducts.length > 5 && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => setShowAllSeasonal(!showAllSeasonal)}
                      className="px-6 py-2 border-2 border-[#103e2c] text-[#103e2c] font-bold rounded-full hover:bg-[#103e2c] hover:text-white transition-colors"
                    >
                      {showAllSeasonal ? 'Show Less' : `See All Seasonal Deals (${seasonalProducts.length})`}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* 3. Daily Sales Section */}
            {dailyProducts.length > 0 && (
              <section className="mb-24">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#103e2c] mb-1 flex items-center gap-2">Daily Offers <span className="text-emerald-400">⚡</span></h2>
                    <p className="text-gray-600 text-sm">Limited time daily offers. Act fast!</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(showAllDaily ? dailyProducts : dailyProducts.slice(0, 4)).map(({ discount, prod }, idx) => {
                    const discountedPrice = prod.sellingPrice * (1 - discount.discountValue / 100);
                    return (
                      <div key={`${discount.id}-${prod.sku}-${idx}`} className="relative h-[250px] rounded-2xl overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-300">
                        <img 
                          src={prod.imageUrl || "https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop"} 
                          alt={prod.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/95 via-[#064e3b]/70 to-black/20"></div>
                        
                        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded border border-white/30 flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-white text-[12px]">schedule</span>
                           <span className="text-[9px] font-bold tracking-wider text-white uppercase">
                             {discount.dailyEndTime ? `Ends ${discount.dailyEndTime}` : 'ENDS TODAY'}
                           </span>
                        </div>

                        <div className="absolute top-3 right-3">
                           <span className="bg-[#fbbf24] text-amber-900 text-[10px] font-extrabold px-2 py-1 rounded shadow-sm tracking-wide">
                             {discount.discountValue}% OFF
                           </span>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
                          <p className="text-[#a7f3d0] font-semibold text-[10px] mb-1 uppercase tracking-wider line-clamp-1">{discount.label || 'Daily Deal'}</p>
                          <h3 className="text-white text-base font-bold mb-2 leading-tight line-clamp-2 min-h-[40px]">{prod.name}</h3>
                          
                          <div className="flex items-end gap-2 mb-2">
                            <span className="text-white font-black text-xl">Rs. {discountedPrice.toFixed(2)}</span>
                            <span className="text-white/60 line-through text-xs font-semibold mb-1">Rs. {prod.sellingPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {dailyProducts.length > 4 && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => setShowAllDaily(!showAllDaily)}
                      className="px-6 py-2 border-2 border-[#103e2c] text-[#103e2c] font-bold rounded-full hover:bg-[#103e2c] hover:text-white transition-colors"
                    >
                      {showAllDaily ? 'Show Less' : `See All Daily Offers (${dailyProducts.length})`}
                    </button>
                  </div>
                )}
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
