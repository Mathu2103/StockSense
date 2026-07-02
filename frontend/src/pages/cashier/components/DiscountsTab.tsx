import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface DiscountsTabProps {
  discounts: any[];
  products: any[];
  addComboToCart: (discount: any) => void;
  addDiscountProductsToCart: (discount: any) => void;
  addSingleDiscountProduct?: (product: any, discount: any) => void;
}

export const DiscountsTab: React.FC<DiscountsTabProps> = ({
  discounts,
  products,
  addComboToCart,
  addDiscountProductsToCart,
  addSingleDiscountProduct
}) => {
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [showAllSeasonal, setShowAllSeasonal] = useState(false);
  const [showAllDaily, setShowAllDaily] = useState(false);

  const combos = discounts.filter(d => d.type === 'COMBO');
  
  const seasonalProducts = discounts.filter(d => d.type === 'SEASONAL').flatMap(discount => 
    (discount.productIds || []).map((skuId: string) => {
      const prod = products.find(p => p.sku === skuId || p.id === skuId);
      return { discount, prod, skuId };
    })
  ).filter(item => item.prod);

  const dailyProducts = discounts.filter(d => d.type === 'DAILY').flatMap(discount => 
    (discount.productIds || []).map((skuId: string) => {
      const prod = products.find(p => p.sku === skuId || p.id === skuId);
      return { discount, prod, skuId };
    })
  ).filter(item => item.prod);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8f9fc] relative">
      <div className="max-w-7xl mx-auto relative z-10 font-sans pb-16 space-y-12">
        
        {/* 1. Curated Combos Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#103e2c] mb-1">Curated Combos</h2>
            <p className="text-gray-500 text-xs">Buy these products together to unlock bundle deals.</p>
          </div>

          {combos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500 font-bold text-xs shadow-sm">
              No active combo bundles available.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {(showAllCombos ? combos : combos.slice(0, 2)).map(discount => {
                const originalTotal = discount.comboItems.reduce((sum: number, item: any) => {
                  const prod = products.find(p => p.sku === item.productId || p.id === item.productId);
                  return sum + (prod ? prod.price * item.minQty : 0);
                }, 0);
                const finalTotal = originalTotal * (1 - discount.discountValue / 100);

                return (
                  <div key={discount.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative w-full sm:w-1/2 h-44 sm:h-auto bg-gray-50 shrink-0">
                      <img 
                        src={discount.imageUrl || "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop"} 
                        alt={discount.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-4 left-4 bg-[#0a3822] text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                        {discount.label || 'COMBO SAVER'}
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900 mb-1 leading-snug">{discount.name}</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Required Items:</p>
                          {discount.comboItems.map((item: any, idx: number) => {
                            const prod = products.find(p => p.sku === item.productId || p.id === item.productId);
                            return (
                              <div key={idx} className="text-xs text-gray-700 font-bold flex justify-between">
                                <span className="truncate pr-1">• {prod ? prod.name : 'Unknown Product'}</span>
                                <span className="text-[#0a3822] shrink-0">Qty: {item.minQty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col justify-end">
                        <div className="mb-3 flex items-baseline gap-1.5 justify-between">
                          <span className="text-gray-500 text-[10px] font-bold">Bundle Price:</span>
                          <div className="text-right">
                            <span className="text-gray-900 font-extrabold text-lg block">Rs. {finalTotal.toFixed(2)}</span>
                            <span className="text-gray-400 line-through text-xs font-medium">Rs. {originalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addComboToCart(discount)}
                          className="w-full bg-[#0a3822] text-white hover:bg-[#072a19] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add Combo to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {combos.length > 2 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowAllCombos(!showAllCombos)}
                className="px-5 py-2 border border-[#103e2c] text-[#103e2c] font-bold rounded-lg text-xs hover:bg-[#103e2c] hover:text-white transition-colors"
              >
                {showAllCombos ? 'Show Less' : `See All Combos (${combos.length})`}
              </button>
            </div>
          )}
        </section>

        {/* 2. Seasonal Specials Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#103e2c] mb-1">Seasonal Deals</h2>
            <p className="text-gray-500 text-xs">Fresh savings for the current season.</p>
          </div>

          {seasonalProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500 font-bold text-xs shadow-sm">
              No active seasonal deals available.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {(showAllSeasonal ? seasonalProducts : seasonalProducts.slice(0, 4)).map(({ discount, prod, skuId }, idx) => {
                const discountedPrice = prod.price * (1 - discount.discountValue / 100);
                return (
                  <div key={`${discount.id}-${skuId}-${idx}`} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-32 w-full relative bg-gray-50 shrink-0">
                      <img 
                        src={prod.imageUrl || "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"} 
                        alt={prod.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        {discount.discountValue}% OFF
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider mb-1 truncate">
                          {discount.label || discount.name}
                        </div>
                        <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-tight line-clamp-2" title={prod.name}>
                          {prod.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-gray-900 font-extrabold text-base">Rs. {discountedPrice.toFixed(2)}</span>
                          <span className="text-gray-400 line-through text-[10px] font-semibold">Rs. {prod.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addSingleDiscountProduct && addSingleDiscountProduct(prod, discount)}
                        className="w-full bg-[#0a3822] text-white hover:bg-[#072a19] py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {seasonalProducts.length > 4 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowAllSeasonal(!showAllSeasonal)}
                className="px-5 py-2 border border-[#103e2c] text-[#103e2c] font-bold rounded-lg text-xs hover:bg-[#103e2c] hover:text-white transition-colors"
              >
                {showAllSeasonal ? 'Show Less' : `See All Seasonal Deals (${seasonalProducts.length})`}
              </button>
            </div>
          )}
        </section>

        {/* 3. Daily Specials Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#103e2c] mb-1 flex items-center gap-1.5">Daily Offers ⚡</h2>
            <p className="text-gray-500 text-xs">Happy hour value deals active today.</p>
          </div>

          {dailyProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500 font-bold text-xs shadow-sm">
              No active daily specials available.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {(showAllDaily ? dailyProducts : dailyProducts.slice(0, 4)).map(({ discount, prod, skuId }, idx) => {
                const discountedPrice = prod.price * (1 - discount.discountValue / 100);
                return (
                  <div key={`${discount.id}-${skuId}-${idx}`} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col relative group">
                    <div className="h-32 w-full relative bg-gray-50 shrink-0">
                      <img 
                        src={prod.imageUrl || "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"} 
                        alt={prod.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        {discount.discountValue}% OFF
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        ENDS {discount.dailyEndTime}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between z-10 bg-white">
                      <div>
                        <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1 truncate">
                          ⚡ {discount.label || discount.name}
                        </div>
                        <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-tight line-clamp-2" title={prod.name}>
                          {prod.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-gray-900 font-extrabold text-base">Rs. {discountedPrice.toFixed(2)}</span>
                          <span className="text-gray-400 line-through text-[10px] font-semibold">Rs. {prod.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addSingleDiscountProduct && addSingleDiscountProduct(prod, discount)}
                        className="w-full bg-[#b45309] text-white hover:bg-[#92400e] py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {dailyProducts.length > 4 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowAllDaily(!showAllDaily)}
                className="px-5 py-2 border border-[#103e2c] text-[#103e2c] font-bold rounded-lg text-xs hover:bg-[#103e2c] hover:text-white transition-colors"
              >
                {showAllDaily ? 'Show Less' : `See All Daily Offers (${dailyProducts.length})`}
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
