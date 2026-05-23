import { useEffect, useState } from 'react';

export default function OffersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden font-sans pb-32">
      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* 1. Curated Combos Section */}
        <section className="mb-24">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#103e2c] mb-1">Curated Combos</h2>
            <p className="text-gray-600 text-sm">Perfect pairings at a premium price.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row h-auto sm:h-72 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="relative w-full sm:w-1/2 h-48 sm:h-full bg-gray-50">
                <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop" alt="Coffee" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#0a3822] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                  COMBO SAVER
                </div>
              </div>
              <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Morning Ritual</h3>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed pr-4">Artisanal Coffee + Handcrafted Cookies</p>
                <div className="mb-1">
                  <span className="text-gray-400 line-through text-xs mr-2 font-medium">Rs. 850</span>
                </div>
                <div className="text-gray-900 font-extrabold text-2xl mb-6">Rs. 649</div>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-semibold hover:bg-gray-50 transition-colors w-max">
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-auto sm:h-72 border border-gray-100 hover:shadow-lg transition-shadow relative">
              <div className="h-44 w-full bg-gray-100 relative">
                <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop" alt="Milk and Bread" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/95 text-[#4ade80] text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm backdrop-blur-sm">
                  DAILY FRESH
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center bg-white">
                <h3 className="text-xl font-extrabold text-gray-900 mb-1">Baker's Pick</h3>
                <p className="text-gray-500 text-xs mb-3 font-medium">Organic Milk + Sourdough Loaf</p>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-extrabold text-2xl">Rs. 299</span>
                  <span className="text-gray-400 line-through text-xs font-medium">Rs. 420</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Seasonal Specials Section */}
        <section className="mb-32">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-[#103e2c] mb-2">Seasonal Specials</h2>
            <p className="text-gray-600 text-sm">Fresh savings for the current season.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Item 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-64 h-64 shrink-0 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white mb-6">
                <img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop" alt="Terra Mug" className="w-full h-full object-cover" />
              </div>
              <span className="inline-block bg-[#475569] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide mb-3">Summer Special</span>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Handcrafted Terra Mug</h3>
              <p className="text-gray-500 text-sm mb-4 max-w-xs leading-relaxed">Sip your favorite beverages in a vessel carved by time and tradition.</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-[#103e2c] font-extrabold text-3xl">Rs. 899</span>
                <span className="text-gray-400 line-through text-sm font-medium">Rs. 1,250</span>
              </div>
              <button className="bg-[#0a3822] text-white px-8 py-2.5 rounded-full font-semibold text-sm hover:bg-[#072a19] transition-colors flex items-center justify-center gap-2 shadow-md">
                Shop Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-64 h-64 shrink-0 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white mb-6">
                <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop" alt="Granola" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <span className="inline-block bg-[#16a34a] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide mb-3">Festival Offer</span>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Organic Granola</h3>
              <p className="text-gray-500 text-sm mb-4 max-w-xs leading-relaxed">Start your day with wholesome crunch and naturally sweet ingredients.</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-[#103e2c] font-extrabold text-3xl">Rs. 450</span>
                <span className="text-gray-400 line-through text-sm font-medium">Rs. 600</span>
              </div>
              <button className="bg-[#0a3822] text-white px-8 py-2.5 rounded-full font-semibold text-sm hover:bg-[#072a19] transition-colors flex items-center justify-center gap-2 shadow-md">
                Add to Cart <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Flash Sales Section */}
        <section className="mb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#103e2c] mb-1 flex items-center gap-2">Flash Sales <span className="text-emerald-400">⚡</span></h2>
              <p className="text-gray-600 text-sm">Limited time offers. Act fast!</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">ENDS IN:</span>
              <span className="font-mono font-bold text-lg text-gray-900 tracking-wider">04 : 31 : 53</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flash Sale Card 1 */}
            <div className="relative h-[340px] rounded-2xl overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-300">
              <img src="https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop" alt="Sparkling Water" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#436f5b]/90 via-[#436f5b]/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 pb-[90px]">
                <h3 className="text-white text-2xl font-bold mb-1">Pure Alpine Sparkling</h3>
                <div className="flex items-center gap-3">
                  <span className="text-white font-extrabold text-[32px]">Rs. 180</span>
                  <span className="text-white/60 line-through text-sm font-medium">Rs. 320</span>
                </div>
              </div>
              
              <div className="absolute bottom-[90px] right-6 w-[70px] h-[70px] rounded-full bg-[#bbf7d0] text-[#166534] flex flex-col items-center justify-center shadow-lg shadow-green-900/20">
                <span className="text-[9px] font-bold uppercase leading-none mb-1">Save</span>
                <span className="text-lg font-extrabold leading-none">40%</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <button className="w-full bg-white text-gray-900 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                  Claim Offer
                </button>
              </div>
            </div>

            {/* Flash Sale Card 2 */}
            <div className="relative h-[340px] rounded-2xl overflow-hidden group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-2xl transition-all duration-300">
              <img src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop" alt="Chocolate Bar" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3f5144]/90 via-[#3f5144]/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 pb-[90px]">
                <h3 className="text-white text-2xl font-bold mb-1">Artisanal Cocoa Cru</h3>
                <div className="flex items-center gap-3">
                  <span className="text-white font-extrabold text-[32px]">Rs. 349</span>
                  <span className="text-white/60 line-through text-sm font-medium">Rs. 569</span>
                </div>
              </div>
              
              <div className="absolute bottom-[90px] right-6 w-[70px] h-[70px] rounded-full bg-[#bbf7d0] text-[#166534] flex flex-col items-center justify-center shadow-lg shadow-green-900/20">
                <span className="text-[9px] font-bold uppercase leading-none mb-1">Off</span>
                <span className="text-base font-extrabold leading-none tracking-tight">₹250</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <button className="w-full bg-white text-gray-900 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                  Claim Offer
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Daily Essentials Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#103e2c] mb-1">Daily Essentials</h2>
            <p className="text-gray-600 text-sm">Everyday value on your retail favorites.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Essential Card 1 */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer">
              <div className="relative h-44 bg-[#eef1eb] p-4">
                <div className="absolute top-3 left-3 z-10 bg-[#dc2626] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                  10% OFF
                </div>
                <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop" alt="Botanical Defense" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Botanical Defense</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-gray-900 font-extrabold text-sm">Rs. 225</span>
                    <span className="text-gray-400 line-through text-[10px] font-medium">Rs. 250</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Card 2 */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer">
              <div className="relative h-44 bg-[#f1f4ed] p-4">
                <div className="absolute top-3 left-3 z-10 bg-[#0a3822] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                  Rs. 50 OFF
                </div>
                <img src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop" alt="Artisan Olive Oil" className="w-full h-full object-cover rounded shadow-sm" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Artisan Olive Oil</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-gray-900 font-extrabold text-sm">Rs. 1,450</span>
                    <span className="text-gray-400 line-through text-[10px] font-medium">Rs. 1,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Card 3 */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer">
              <div className="relative h-44 bg-gray-50">
                <div className="absolute top-3 left-3 z-10 bg-[#dc2626] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                  BOGO
                </div>
                <img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop" alt="Terra Mug (Pair)" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Terra Mug (Pair)</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-gray-900 font-extrabold text-sm">Rs. 1,250</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Essential Card 4 (Placeholder) */}
            <div className="bg-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg hover:bg-[#cbd5e1] transition-all flex flex-col items-center justify-center p-6 text-center h-full min-h-[240px] relative cursor-pointer border border-transparent">
              <div className="absolute top-3 left-3 z-10 bg-[#0a3822] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider">
                VIEW ALL
              </div>
              <div className="w-16 h-16 rounded-xl bg-white/50 flex flex-col items-center justify-center mb-3 text-gray-400 shadow-sm border border-white/60">
                <span className="material-symbols-outlined text-[32px]">inventory_2</span>
              </div>
              <h3 className="text-gray-900 font-bold text-xs mb-1">Explore More Deals</h3>
              <p className="text-gray-500 text-[9px] font-medium">Daily fresh updates</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
