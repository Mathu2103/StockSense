import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ScanLine, ShoppingCart, Settings, LogOut, 
  Trash2, Plus, Minus, Receipt, FileText, ChevronRight,
  Filter, Download, TerminalSquare, CreditCard, Banknote
} from 'lucide-react';
import CategoryMarquee from '../../components/shared/CategoryMarquee/CategoryMarquee';
import { AuthContext } from '../../context/AuthContext';

// --- MOCK DATA ---
const MOCK_PRODUCTS = [
  { id: 1, category: 'ELECTRONICS', name: 'Wireless Headphones', price: 129.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
  { id: 2, category: 'WEARABLES', name: 'Smart Watch Pro', price: 249.00, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop' },
  { id: 3, category: 'ACCESSORIES', name: 'Mechanical Keyboard', price: 89.50, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop' },
  { id: 4, category: 'ACCESSORIES', name: 'Ergonomic Mouse', price: 55.00, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop' },
  { id: 5, category: 'ELECTRONICS', name: 'USB-C Hub', price: 42.00, image: 'https://images.unsplash.com/photo-1528698827591-e192abc8f495?q=80&w=400&auto=format&fit=crop' },
  { id: 6, category: 'LIFESTYLE', name: 'Travel Mug - Sage', price: 35.50, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop' },
  { id: 7, category: 'BEVERAGES', name: 'Midnight Velvet Roast Coffee', price: 24.99, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop' },
  { id: 8, category: 'SNACKS', name: 'Golden Maple Granola', price: 14.50, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop' },
  { id: 9, category: 'BEVERAGES', name: 'Pure Alpine Sparkling Water', price: 8.95, image: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=600&auto=format&fit=crop' },
  { id: 10, category: 'PERSONAL CARE', name: 'Botanical Defense Soap', price: 22.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop' },
  { id: 11, category: 'BAKERY ITEMS', name: 'Artisan Sourdough Bread', price: 6.50, image: 'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?q=80&w=600&auto=format&fit=crop' },
  { id: 12, category: 'BEVERAGES', name: 'Cold Brew Coffee Concentrate', price: 12.00, image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=600&auto=format&fit=crop' },
  { id: 13, category: 'PACKAGED FOODS', name: 'Organic Forest Honey', price: 9.00, image: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed748d1?q=80&w=600&auto=format&fit=crop' },
  { id: 14, category: 'PACKAGED FOODS', name: 'Handcrafted Pink Sea Salt', price: 14.00, image: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=600&auto=format&fit=crop' },
  { id: 15, category: 'SNACKS', name: 'Artisanal Cocoa Cru Chocolate', price: 14.00, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop' },
  { id: 16, category: 'BEVERAGES', name: 'Premium Jasmine Green Tea', price: 18.50, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop' },
  { id: 17, category: 'HOUSEHOLD ESSENTIALS', name: 'Handcrafted Terra Mug', price: 26.00, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop' },
  { id: 18, category: 'PACKAGED FOODS', name: 'Small-Batch Extra Virgin Olive Oil', price: 32.00, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop' },
  { id: 19, category: 'DAIRY PRODUCTS', name: 'Organic Fresh Whole Milk', price: 4.50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop' },
  { id: 20, category: 'FRUITS & VEGETABLES', name: 'Fresh Organic Avocados (Pair)', price: 5.99, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop' },
];

const MOCK_ORDERS = [
  { id: '#SS-9402', time: '14:32 PM', items: 5, method: 'Visa **** 4291', status: 'Completed', total: 142.50 },
  { id: '#SS-9401', time: '14:15 PM', items: 2, method: 'Cash', status: 'Completed', total: 24.99 },
  { id: '#SS-9398', time: '13:58 PM', items: 12, method: 'MasterCard', status: 'Completed', total: 382.10 },
  { id: '#SS-9397', time: '13:45 PM', items: 1, method: 'Cash', status: 'Refunded', total: -12.00 },
  { id: '#SS-9395', time: '13:30 PM', items: 4, method: 'Apple Pay', status: 'Completed', total: 56.00 },
];

export default function POSPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'register'|'orders'>('register');
  const [registerSubTab, setRegisterSubTab] = useState<'products'|'discounts'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('');
  const [customerPaidInput, setCustomerPaidInput] = useState<string>('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(MOCK_ORDERS[0]);

  // --- FILTERED PRODUCTS LOGIC ---
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!selectedCategory) return matchesSearch;

      const normProdCat = product.category.toLowerCase();
      const normSelCat = selectedCategory.toLowerCase();

      // Check direct equality or mapping
      const matchesCategory = normProdCat === normSelCat
        || (normSelCat === 'beverages' && normProdCat === 'beverages')
        || (normSelCat === 'snacks' && normProdCat === 'snacks')
        || (normSelCat === 'dairy products' && normProdCat === 'dairy products')
        || (normSelCat === 'bakery items' && normProdCat === 'bakery items')
        || (normSelCat === 'fruits & vegetables' && normProdCat === 'fruits & vegetables')
        || (normSelCat === 'frozen foods' && normProdCat === 'frozen foods')
        || (normSelCat === 'household essentials' && normProdCat === 'household essentials')
        || (normSelCat === 'personal care' && normProdCat === 'personal care')
        || (normSelCat === 'packaged foods' && normProdCat === 'packaged foods')
        || (normSelCat === 'cleaning supplies' && normProdCat === 'cleaning supplies');

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // --- CART LOGIC ---
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number | string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number | string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * manualDiscount) / 100;
  const total = subtotal - discountAmount;

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setManualDiscount(val);
    }
  };

  // --- RENDER HELPERS ---
  const renderSidebar = () => (
    <div className="w-[240px] bg-[#f8f9fc] border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-xl font-extrabold text-[#111827]">StockSense POS</h1>
        <p className="text-sm text-gray-500 mt-1">Station 01</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <button 
          onClick={() => setActiveTab('register')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors font-semibold ${activeTab === 'register' ? 'bg-[#dcfce7] text-[#166534]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <TerminalSquare className="w-5 h-5 mr-3" />
          Register
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors font-semibold ${activeTab === 'orders' ? 'bg-[#dcfce7] text-[#166534]' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Receipt className="w-5 h-5 mr-3" />
          Orders
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {activeTab === 'orders' && (
          <button 
            onClick={() => setActiveTab('register')}
            className="w-full bg-[#166534] hover:bg-[#14532d] text-white py-3 rounded-xl flex items-center justify-center font-semibold transition-colors shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-2"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Sale
          </button>
        )}

        <div className="px-2">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3">
              <img src="https://ui-avatars.com/api/?name=Alex+Mercer&background=random" alt="Cashier" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Alex Mercer</p>
              <p className="text-xs text-gray-500">Staff #4209</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              if (authContext?.logout) {
                await authContext.logout();
              } else {
                localStorage.removeItem('stocksense_logged_in');
              }
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant font-medium hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-outline-variant">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegisterDiscounts = () => {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8f9fc] relative">
        <div className="max-w-7xl mx-auto relative z-10 font-sans pb-16">
          
          {/* 1. Curated Combos Section */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#103e2c] mb-1">Curated Combos</h2>
              <p className="text-gray-500 text-xs">Perfect pairings at a premium price.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Combo Card */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative w-full sm:w-1/2 h-44 sm:h-auto bg-gray-50">
                  <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop" alt="Coffee" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-[#0a3822] text-white text-[9px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm">
                    COMBO SAVER
                  </div>
                </div>
                <div className="w-full sm:w-1/2 p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Morning Ritual</h3>
                  <p className="text-gray-500 text-[11px] mb-3 leading-relaxed">Artisanal Coffee + Handcrafted Cookies</p>
                  <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-gray-900 font-extrabold text-xl">$6.49</span>
                    <span className="text-gray-400 line-through text-xs font-medium">$8.50</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => addToCart({
                        id: 'offer-morning-ritual',
                        name: 'Morning Ritual Combo',
                        price: 6.49,
                        image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
                        category: 'COMBO'
                      })}
                      className="border border-[#0a3822] text-[#0a3822] hover:bg-emerald-50 px-4 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => {
                        setManualDiscount(24);
                        setDiscountInput('24');
                      }}
                      className="bg-[#0a3822] text-white hover:bg-[#072a19] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Apply 24% Off
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Combo Card */}
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col sm:flex-row border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative w-full sm:w-1/2 h-44 sm:h-auto bg-gray-50">
                  <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop" alt="Milk and Bread" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/95 text-emerald-600 text-[9px] font-bold px-3 py-1 rounded-full tracking-wide shadow-sm backdrop-blur-sm">
                    DAILY FRESH
                  </div>
                </div>
                <div className="w-full sm:w-1/2 p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">Baker's Pick</h3>
                  <p className="text-gray-500 text-[11px] mb-3 leading-relaxed">Organic Milk + Sourdough Loaf</p>
                  <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-gray-900 font-extrabold text-xl">$2.99</span>
                    <span className="text-gray-400 line-through text-xs font-medium">$4.20</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => addToCart({
                        id: 'offer-bakers-pick',
                        name: "Baker's Pick Combo",
                        price: 2.99,
                        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop',
                        category: 'COMBO'
                      })}
                      className="border border-[#0a3822] text-[#0a3822] hover:bg-emerald-50 px-4 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => {
                        setManualDiscount(29);
                        setDiscountInput('29');
                      }}
                      className="bg-[#0a3822] text-white hover:bg-[#072a19] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Apply 29% Off
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Seasonal Specials Section */}
          <section className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#103e2c] mb-1">Seasonal Specials</h2>
              <p className="text-gray-500 text-xs">Fresh savings for the current season.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Item 1 */}
              <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-40 h-40 shrink-0 rounded-full overflow-hidden shadow-md border-4 border-gray-50 bg-white mb-4">
                  <img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop" alt="Terra Mug" className="w-full h-full object-cover" />
                </div>
                <span className="inline-block bg-[#475569] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wide mb-2">Summer Special</span>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">Handcrafted Terra Mug</h3>
                <p className="text-gray-500 text-xs mb-3 max-w-xs leading-relaxed">Sip your favorite beverages in a vessel carved by tradition.</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-[#103e2c] font-extrabold text-2xl">$8.99</span>
                  <span className="text-gray-400 line-through text-xs font-medium">$12.50</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart({
                      id: 'offer-terra-mug',
                      name: 'Handcrafted Terra Mug',
                      price: 8.99,
                      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop',
                      category: 'SPECIAL'
                    })}
                    className="border border-[#0a3822] text-[#0a3822] hover:bg-emerald-50 px-4 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => {
                      setManualDiscount(28);
                      setDiscountInput('28');
                    }}
                    className="bg-[#0a3822] text-white hover:bg-[#072a19] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    Apply 28% Off
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-40 h-40 shrink-0 rounded-full overflow-hidden shadow-md border-4 border-gray-50 bg-white mb-4">
                  <img src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop" alt="Granola" className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <span className="inline-block bg-[#16a34a] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wide mb-2">Festival Offer</span>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">Organic Granola</h3>
                <p className="text-gray-500 text-xs mb-3 max-w-xs leading-relaxed">Start your day with wholesome crunch and naturally sweet ingredients.</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-[#103e2c] font-extrabold text-2xl">$4.50</span>
                  <span className="text-gray-400 line-through text-xs font-medium">$6.00</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart({
                      id: 'offer-granola',
                      name: 'Organic Granola',
                      price: 4.50,
                      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=600&auto=format&fit=crop',
                      category: 'SPECIAL'
                    })}
                    className="border border-[#0a3822] text-[#0a3822] hover:bg-emerald-50 px-4 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => {
                      setManualDiscount(25);
                      setDiscountInput('25');
                    }}
                    className="bg-[#0a3822] text-white hover:bg-[#072a19] px-3 py-1.5 rounded text-xs font-bold transition-colors"
                  >
                    Apply 25% Off
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Flash Sales Section */}
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#103e2c] mb-1 flex items-center gap-2">Flash Sales <span className="text-emerald-400">⚡</span></h2>
                <p className="text-gray-500 text-xs">Limited time offers. Act fast!</p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5">
                <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">ENDS IN:</span>
                <span className="font-mono font-bold text-base text-gray-900 tracking-wider">04 : 31 : 53</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Flash Sale Card 1 */}
              <div className="relative h-[280px] rounded-2xl overflow-hidden group shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <img src="https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop" alt="Sparkling Water" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#436f5b]/95 via-[#436f5b]/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-5 pb-[70px]">
                  <h3 className="text-white text-lg font-bold mb-0.5">Pure Alpine Sparkling</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-2xl">$1.80</span>
                    <span className="text-white/60 line-through text-xs font-medium">$3.20</span>
                  </div>
                </div>
                
                <div className="absolute bottom-[75px] right-5 w-12 h-12 rounded-full bg-[#bbf7d0] text-[#166534] flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[7px] font-bold uppercase leading-none mb-0.5">Save</span>
                  <span className="text-xs font-extrabold leading-none">40%</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <button 
                    onClick={() => addToCart({
                      id: 'offer-alpine-sparkling',
                      name: 'Pure Alpine Sparkling',
                      price: 1.80,
                      image: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=800&auto=format&fit=crop',
                      category: 'FLASH'
                    })}
                    className="flex-1 bg-white text-gray-900 py-2 rounded font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm text-center font-semibold"
                  >
                    Claim Offer
                  </button>
                  <button 
                    onClick={() => {
                      setManualDiscount(40);
                      setDiscountInput('40');
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded font-bold text-xs transition-colors font-semibold"
                  >
                    Apply 40% Off
                  </button>
                </div>
              </div>

              {/* Flash Sale Card 2 */}
              <div className="relative h-[280px] rounded-2xl overflow-hidden group shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <img src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop" alt="Chocolate Bar" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3f5144]/95 via-[#3f5144]/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-5 pb-[70px]">
                  <h3 className="text-white text-lg font-bold mb-0.5">Artisanal Cocoa Cru</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-2xl">$3.49</span>
                    <span className="text-white/60 line-through text-xs font-medium">$5.69</span>
                  </div>
                </div>
                
                <div className="absolute bottom-[75px] right-5 w-12 h-12 rounded-full bg-[#bbf7d0] text-[#166534] flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[7px] font-bold uppercase leading-none mb-0.5">Off</span>
                  <span className="text-xs font-extrabold leading-none tracking-tight">$2.20</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <button 
                    onClick={() => addToCart({
                      id: 'offer-cocoa-cru',
                      name: 'Artisanal Cocoa Cru',
                      price: 3.49,
                      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop',
                      category: 'FLASH'
                    })}
                    className="flex-1 bg-white text-gray-900 py-2 rounded font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm text-center font-semibold"
                  >
                    Claim Offer
                  </button>
                  <button 
                    onClick={() => {
                      setManualDiscount(39);
                      setDiscountInput('39');
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded font-bold text-xs transition-colors font-semibold"
                  >
                    Apply 39% Off
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Daily Essentials Section */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#103e2c] mb-1">Daily Essentials</h2>
              <p className="text-gray-500 text-xs">Everyday value on your retail favorites.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Essential Card 1 */}
              <div 
                onClick={() => addToCart({
                  id: 'offer-botanical-defense',
                  name: 'Botanical Defense',
                  price: 2.25,
                  image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop',
                  category: 'ESSENTIAL'
                })}
                className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer group"
              >
                <div className="relative h-36 bg-[#eef1eb] p-4 flex items-center justify-center">
                  <div className="absolute top-3 left-3 z-10 bg-[#dc2626] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">
                    10% OFF
                  </div>
                  <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop" alt="Botanical Defense" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Botanical Defense</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-gray-900 font-extrabold text-sm">$2.25</span>
                      <span className="text-gray-400 line-through text-[10px] font-medium">$2.50</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualDiscount(10);
                      setDiscountInput('10');
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] py-1 rounded transition-colors text-center"
                  >
                    Apply 10% Off
                  </button>
                </div>
              </div>

              {/* Essential Card 2 */}
              <div 
                onClick={() => addToCart({
                  id: 'offer-olive-oil',
                  name: 'Artisan Olive Oil',
                  price: 14.50,
                  image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
                  category: 'ESSENTIAL'
                })}
                className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer group"
              >
                <div className="relative h-36 bg-[#f1f4ed] overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 bg-[#0a3822] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">
                    $0.50 OFF
                  </div>
                  <img src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop" alt="Artisan Olive Oil" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Artisan Olive Oil</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-gray-900 font-extrabold text-sm">$14.50</span>
                      <span className="text-gray-400 line-through text-[10px] font-medium">$15.00</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualDiscount(3);
                      setDiscountInput('3');
                    }}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] py-1 rounded transition-colors text-center"
                  >
                    Apply 3% Off
                  </button>
                </div>
              </div>

              {/* Essential Card 3 */}
              <div 
                onClick={() => addToCart({
                  id: 'offer-terra-mug-pair',
                  name: 'Terra Mug (Pair)',
                  price: 12.50,
                  image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop',
                  category: 'ESSENTIAL'
                })}
                className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col cursor-pointer group"
              >
                <div className="relative h-36 bg-gray-50 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 bg-[#dc2626] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">
                    BOGO
                  </div>
                  <img src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop" alt="Terra Mug (Pair)" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-gray-900 font-bold text-xs mb-1 truncate">Terra Mug (Pair)</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-gray-900 font-extrabold text-sm">$12.50</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setManualDiscount(50);
                      setDiscountInput('50');
                    }}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] py-1 rounded transition-colors text-center"
                  >
                    Apply 50% Off (BOGO)
                  </button>
                </div>
              </div>

              {/* Essential Card 4 (Placeholder) */}
              <div 
                onClick={() => setRegisterSubTab('products')}
                className="bg-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg hover:bg-[#cbd5e1] transition-all flex flex-col items-center justify-center p-6 text-center h-full min-h-[170px] relative cursor-pointer border border-transparent"
              >
                <div className="absolute top-3 left-3 z-10 bg-[#0a3822] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wider">
                  VIEW ALL
                </div>
                <h3 className="text-gray-900 font-bold text-xs mb-1">Explore Products</h3>
                <p className="text-gray-500 text-[9px] font-medium">Return to active catalog</p>
              </div>

            </div>
          </section>

        </div>
      </div>
    );
  };

  const renderRegisterProducts = () => (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders, IDs, or items..." 
              className="w-full bg-[#f3f4f6] text-gray-800 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#166534]/20 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowBarcodeModal(true)}
            className="flex items-center px-5 py-3 bg-[#eff6ff] text-[#1d4ed8] rounded-xl font-semibold hover:bg-blue-100 transition-colors shrink-0"
          >
            <ScanLine className="w-5 h-5 mr-2" /> Scan Barcode
          </button>
        </div>
        
        <div className="flex bg-[#f3f4f6] rounded-xl p-1 w-fit">
          <button 
            onClick={() => setRegisterSubTab('products')}
            className={`px-8 py-2 rounded-lg font-semibold transition-all ${registerSubTab === 'products' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setRegisterSubTab('discounts')}
            className={`px-8 py-2 rounded-lg font-semibold transition-all ${registerSubTab === 'discounts' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Discounts
          </button>
        </div>
      </div>

      {registerSubTab === 'products' ? (
        /* Product Grid - Matching ProductsPage UI */
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8f9fc] relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#111827] leading-tight tracking-tight">
                  Shop by Categories
                </h1>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs font-bold text-[#166534] hover:underline px-3 py-1.5 bg-[#dcfce7] rounded-lg transition-colors border border-green-200"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <CategoryMarquee 
                onCategorySelect={(categoryName) => {
                  setSelectedCategory(prev => prev === categoryName ? null : categoryName);
                }}
                activeCategory={selectedCategory || undefined}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-[20px] p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="bg-[#f4f6f8] rounded-[14px] h-48 relative overflow-hidden mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.category && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full shadow-sm z-10 bg-[#1b4332] text-white">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="px-2 pb-2">
                    <h3 className="text-[13px] font-bold text-gray-800 mb-1.5 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-600 text-[15px] font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                      <button className="w-7 h-7 rounded-full bg-[#eff6ff] text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <span className="text-[16px] leading-none font-medium mb-[1px]">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderRegisterDiscounts()
      )}
    </div>
  );

  const renderActiveCart = () => (
    <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-screen shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="h-20 border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold flex items-center text-gray-800">
          <ShoppingCart className="w-6 h-6 mr-3 text-gray-800" />
          Active Cart
        </h2>
        {cart.length > 0 && (
          <button onClick={() => setCart([])} className="text-gray-400 hover:text-red-500 transition-colors p-2">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <ShoppingCart className="w-16 h-16 opacity-20" />
            <p className="font-medium">Cart is empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-[#f3f4f6] rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-gray-900 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-gray-900 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-[#166534]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-[#f8f9fc] border-t border-gray-200 shrink-0">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-gray-800 font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Manual Discount (%)" 
                value={discountInput}
                onChange={e => setDiscountInput(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-800 rounded-lg pl-3 pr-3 py-2 text-sm focus:outline-none focus:border-[#166534] transition-colors"
              />
            </div>
            <button onClick={handleApplyDiscount} className="px-4 py-2 bg-[#e0e7ff] text-[#4338ca] rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors">
              Apply
            </button>
          </div>
          {manualDiscount > 0 && (
             <div className="flex justify-between text-sm text-green-600">
               <span className="font-medium">Discount ({manualDiscount}%)</span>
               <span className="font-bold">-${discountAmount.toFixed(2)}</span>
             </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Customer Paid ($)" 
                value={customerPaidInput}
                onChange={e => setCustomerPaidInput(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-800 rounded-lg pl-3 pr-3 py-2 text-sm focus:outline-none focus:border-[#166534] transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-6">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Amount</p>
          <div className="flex justify-between items-end">
            <h1 className="text-4xl font-extrabold text-[#166534]">${total.toFixed(2)}</h1>
            <span className="px-3 py-1 bg-[#dcfce7] text-[#166534] text-xs font-bold rounded-full mb-1">
              {cart.reduce((a,b)=>a+b.quantity, 0)} Items
            </span>
          </div>
        </div>

        <button 
          className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg transition-all shadow-md ${cart.length > 0 ? 'bg-[#166534] hover:bg-[#14532d] text-white hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
          disabled={cart.length === 0}
          onClick={() => setShowInvoiceModal(true)}
        >
          <CreditCard className="w-6 h-6 mr-3" />
          Complete Payment
        </button>
      </div>
    </div>
  );

  const renderOrdersView = () => (
    <div className="flex-1 flex bg-[#f8f9fc] overflow-hidden h-screen">
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
            <p className="text-gray-500 mt-2 font-medium">Thursday, Oct 24 • {MOCK_ORDERS.length} Transactions Today</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-2">NET SALES</p>
            <h2 className="text-3xl font-extrabold text-[#166534]">$4,280.50</h2>
            <p className="text-xs text-green-600 font-semibold mt-2 flex items-center">
              <span className="mr-1">↗</span> +12% vs yesterday
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-2">TOTAL ORDERS</p>
            <h2 className="text-3xl font-extrabold text-gray-900">128</h2>
            <p className="text-xs text-gray-500 font-semibold mt-2 flex items-center">
              <FileText className="w-3 h-3 mr-1" /> Average $33.44/ticket
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 tracking-wider mb-2">CASH PAYMENTS</p>
            <h2 className="text-3xl font-extrabold text-gray-900">$1,120.00</h2>
            <p className="text-xs text-gray-500 font-semibold mt-2 flex items-center">
              <Banknote className="w-3 h-3 mr-1" /> 26% of transactions
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8f9fc] border-b border-gray-200 text-gray-500 font-bold text-xs">
              <tr>
                <th className="py-4 px-6">ORDER ID</th>
                <th className="py-4 px-6">TIME</th>
                <th className="py-4 px-6">ITEMS</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ORDERS.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#f0fdf4]' : ''}`}
                >
                  <td className="py-4 px-6 font-bold text-gray-900">{order.id}</td>
                  <td className="py-4 px-6 text-gray-500 font-medium">{order.time}</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{order.items} {order.items === 1 ? 'Item' : 'Items'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Completed' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={`py-4 px-6 text-right font-extrabold text-lg ${order.total < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {order.total < 0 ? '-' : ''}${Math.abs(order.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 text-center border-t border-gray-100 bg-[#f8f9fc]">
            <button className="text-sm font-bold text-[#166534] hover:underline">Load older transactions</button>
          </div>
        </div>
      </div>

      {/* Right Details Panel */}
      {selectedOrder && (
        <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900">Order {selectedOrder.id}</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Today at {selectedOrder.time} • Counter 1</p>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fc]">
             {/* Receipt Preview */}
             <div className="bg-white border border-gray-200 rounded shadow-sm mx-auto max-w-[340px] p-6 flex flex-col font-mono text-[13px] text-black leading-snug">
                <div className="text-center mb-5 space-y-0.5">
                  <div className="font-bold text-base">Sales Receipt</div>
                  <div className="font-bold text-base">Chamson Shop</div>
                  <div>123 Main Street</div>
                  <div>City, State 12345</div>
                  <div>(555) 123-4567</div>
                </div>

                <div className="mb-2 space-y-0.5">
                  <div>Receipt {selectedOrder.id}</div>
                  <div>Date: {new Date().toLocaleDateString('en-GB')} {selectedOrder.time}</div>
                  <div>Cashier: POS System</div>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>
                
                <div className="flex font-bold pb-1">
                  <div className="flex-1">Item</div>
                  <div className="w-12 text-right">Qty</div>
                  <div className="w-16 text-right">Price</div>
                  <div className="w-16 text-right">Total</div>
                </div>
                
                <div className="flex pb-1">
                  <div className="flex-1 truncate pr-1">Organic Coffee Beans</div>
                  <div className="w-12 text-right">2.00</div>
                  <div className="w-16 text-right">$18.50</div>
                  <div className="w-16 text-right">$37.00</div>
                </div>
                <div className="flex pb-1">
                  <div className="flex-1 truncate pr-1">Cold Brew Pitcher</div>
                  <div className="w-12 text-right">1.00</div>
                  <div className="w-16 text-right">$45.00</div>
                  <div className="w-16 text-right">$45.00</div>
                </div>
                <div className="flex pb-1">
                  <div className="flex-1 truncate pr-1">Paper Filters (100ct)</div>
                  <div className="w-12 text-right">2.00</div>
                  <div className="w-16 text-right">$12.50</div>
                  <div className="w-16 text-right">$25.00</div>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>$107.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Loyalty Discount:</span>
                  <span>-$10.70</span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${selectedOrder.total > 0 ? selectedOrder.total.toFixed(2) : '104.24'}</span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>${selectedOrder.total > 0 ? selectedOrder.total.toFixed(2) : '104.24'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>$0.00</span>
                </div>

                <div className="text-center mt-6">
                  Thank You Come Again!
                </div>
             </div>
          </div>
          <div className="p-6 border-t border-gray-200 bg-white space-y-3">
             <button className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors">
                <Receipt className="w-5 h-5 mr-2" /> Print Receipt
             </button>
             <button className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold hover:bg-black flex items-center justify-center transition-colors">
                <ChevronRight className="w-5 h-5 mr-2 rotate-180" /> Refund Order
             </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInvoiceModal = () => {
    if (!showInvoiceModal) return null;
    
    const paid = parseFloat(customerPaidInput) || total;
    const change = Math.max(0, paid - total);
    
    // Create formatted date string for the receipt
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-8 overflow-y-auto bg-white flex-1 flex justify-center">
             {/* Text-based Receipt Style */}
             <div className="font-mono text-[13px] text-black w-full max-w-[320px] mx-auto flex flex-col leading-snug">
                <div className="text-center mb-5 space-y-0.5">
                  <div className="font-bold text-base">Sales Receipt</div>
                  <div className="font-bold text-base">Chamson Shop</div>
                  <div>123 Main Street</div>
                  <div>City, State 12345</div>
                  <div>(555) 123-4567</div>
                </div>

                <div className="mb-2 space-y-0.5">
                  <div>Receipt #: 1000</div>
                  <div>Date: {dateStr}</div>
                  <div>Cashier: POS System</div>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>
                
                <div className="flex font-bold pb-1">
                  <div className="flex-1">Item</div>
                  <div className="w-12 text-right">Qty</div>
                  <div className="w-16 text-right">Price</div>
                  <div className="w-16 text-right">Total</div>
                </div>
                
                {cart.map(item => (
                  <div key={item.id} className="flex pb-1">
                    <div className="flex-1 truncate pr-1">{item.name}</div>
                    <div className="w-12 text-right">{item.quantity.toFixed(2)}</div>
                    <div className="w-16 text-right">${item.price.toFixed(2)}</div>
                    <div className="w-16 text-right">${(item.quantity * item.price).toFixed(2)}</div>
                  </div>
                ))}

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {manualDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="border-t border-dashed border-black my-2"></div>

                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>${paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>${change.toFixed(2)}</span>
                </div>

                <div className="text-center mt-6">
                  Thank You Come Again!
                </div>
             </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
             <button className="flex-1 py-2.5 bg-[#2563eb] text-white rounded font-bold hover:bg-blue-700 transition-colors text-sm">
                Print
             </button>
             <button className="flex-1 py-2.5 bg-[#16a34a] text-white rounded font-bold hover:bg-green-700 transition-colors text-sm">
                Download
             </button>
             <button 
               onClick={() => {
                 setShowInvoiceModal(false);
                 setCart([]);
                 setCustomerPaidInput('');
                 setDiscountInput('');
                 setManualDiscount(0);
               }}
               className="flex-1 py-2.5 bg-[#4b5563] text-white rounded font-bold hover:bg-gray-700 transition-colors text-sm"
             >
                Close
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBarcodeModal = () => {
    if (!showBarcodeModal) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ScanLine className="w-6 h-6 mr-2 text-[#1d4ed8]" /> Scan Barcode
            </h2>
            <button onClick={() => setShowBarcodeModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <div className="p-8 bg-gray-50 flex flex-col items-center">
             <div className="relative w-64 h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                {/* Simulated Camera View */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity"></div>
                {/* Scanner Frame */}
                <div className="absolute w-48 h-48 border-2 border-white/40 rounded-lg box-border"></div>
                {/* Scanning Line Animation */}
                <style>{`
                  @keyframes scanLine {
                    0% { top: 10%; }
                    50% { top: 90%; }
                    100% { top: 10%; }
                  }
                `}</style>
                <div 
                  className="absolute w-48 h-[2px] bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]"
                  style={{ animation: 'scanLine 2s linear infinite' }}
                ></div>
             </div>
             <p className="mt-6 text-sm font-medium text-gray-600">Place the product barcode inside the frame</p>
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
             <button onClick={() => setShowBarcodeModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
               Cancel
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      {renderSidebar()}
      {activeTab === 'register' ? (
        <>
          {renderRegisterProducts()}
          {renderActiveCart()}
        </>
      ) : (
        renderOrdersView()
      )}
      {renderInvoiceModal()}
      {renderBarcodeModal()}
    </div>
  );
}
