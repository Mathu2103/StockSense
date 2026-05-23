import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import homeBgImg from '../../assets/images/homebg.png'
import smartInventoryImg from '../../assets/images/pic1.png'
import fastBillingImg from '../../assets/images/pic2.png'
import businessInsightsImg from '../../assets/images/pic3.png'
import customerVisibilityImg from '../../assets/images/pic4.png'

import vegeImg from '../../assets/images/vege.png'
import flourImg from '../../assets/images/floor.png'
import biscuitsImg from '../../assets/images/biscuits.png'
import beveragesImg from '../../assets/images/beverages.png'

export default function HomePage() {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Tab System Auto Switch Logic with Segmented Control progress bar
  useEffect(() => {
    if (isPaused) return

    const intervalTime = 40 // ~25 fps
    const step = (intervalTime / 4000) * 100 // amount to increment each interval (4 seconds total)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentTab((tab) => (tab + 1) % 3)
          return 0
        }
        return prev + step
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isPaused])

  const handleTabClick = (index: number) => {
    setCurrentTab(index)
    setProgress(0)
  }

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main>
        {/* Hero Section */}
        <section
          className="hero-gradient relative overflow-hidden min-h-[85vh] flex items-start pt-28"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 15%), radial-gradient(ellipse 55% 65% at 20% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0) 75%), url(${homeBgImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 gap-8 items-center relative z-10">
            <div className="space-y-6 max-w-none pt-4 pb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Next-Gen Retail Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-background leading-tight">
                Smart Inventory &amp; Sales Intelligence<br />for Modern Retail
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl leading-relaxed font-medium">
                Optimize your stock levels, predict demand patterns, and unlock actionable sales insights with StockSense's AI-driven platform.
              </p>
            </div>
          </div>
          {/* Atmospheric Blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        </section>

        {/* Interactive Tabs Section */}
        <div className="w-full bg-white">
          <section
            className="py-16 max-w-7xl mx-auto px-6 md:px-12"
            id="interactive-features"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-on-background">
                Intelligence that moves with your business
              </h2>
              <p className="text-base text-on-surface-variant mt-2">
                Built for high-velocity retailers who need precision.
              </p>
            </div>

            {/* Segmented Control Header */}
            <div className="flex justify-center mb-8">
              <div className="segmented-control p-1 rounded-full flex items-center relative min-w-[320px] md:min-w-[700px] select-none">
                <div
                  className="active-pill"
                  style={{
                    width: 'calc((100% - 8px) / 3)',
                    transform: `translateX(${currentTab * 100}%)`,
                  }}
                >
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <button
                  onClick={() => handleTabClick(0)}
                  className={`tab-btn flex-1 px-4 md:px-8 py-4 rounded-full text-xs md:text-sm transition-all duration-300 ${currentTab === 0 ? 'text-on-background font-bold' : 'text-on-surface-variant/50 hover:text-on-background'
                    }`}
                >
                  Automate Operations
                </button>
                <button
                  onClick={() => handleTabClick(1)}
                  className={`tab-btn flex-1 px-4 md:px-8 py-4 rounded-full text-xs md:text-sm transition-all duration-300 ${currentTab === 1 ? 'text-on-background font-bold' : 'text-on-surface-variant/50 hover:text-on-background'
                    }`}
                >
                  Predict Inventory
                </button>
                <button
                  onClick={() => handleTabClick(2)}
                  className={`tab-btn flex-1 px-4 md:px-8 py-4 rounded-full text-xs md:text-sm transition-all duration-300 ${currentTab === 2 ? 'text-on-background font-bold' : 'text-on-surface-variant/50 hover:text-on-background'
                    }`}
                >
                  Business Insights
                </button>
              </div>
            </div>

            {/* Card Container */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 overflow-hidden min-h-[480px] transition-all duration-500 ease-in-out">
              {/* Tab Content 1: Automate Operations */}
              {currentTab === 0 && (
                <div className="tab-content h-full block tab-content-active">
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center">
                    <div className="p-8 lg:p-16 space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          POS Billing
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Inventory Sync
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Real-time Updates
                        </span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-on-background">
                        Automate and simplify daily retail operations
                      </h3>
                      <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                        Reduce manual work by integrating billing, inventory, and stock monitoring into one seamless system. Improve speed, accuracy, and efficiency during daily shop activities.
                      </p>
                    </div>
                    <div className="bg-surface-container-low/30 p-8 h-full flex items-center justify-center overflow-hidden">
                      <img
                        alt="Automate Operations Dashboard"
                        className="w-full max-w-[500px] h-auto rounded-xl shadow-2xl transition-transform duration-700 hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2MzIjXlA8P95m1h_MX0whvxl3sa9Fpb2qd2hp359W4iVLyweGR5R5hIS6l6WPw-JG3z2y4l2paQfCK4XSSG14OdAbsn_gyPdPZY_KbqsUwY2lxuD5ohXe7143anhSmpSJ3zouNLnm2yxbLEQ3h7aJiVvxSVuiOMElPT8YQEmf7WksYGyTUHj2gDmSsQtydKuGV7_gntU-3l2JFcDp8SrPkJFm0OVIuZ8gerhfC3Nm1xKgalrxcrd3PU5u0HZ6SlNvnmXDqrc9NyL5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Predict Inventory */}
              {currentTab === 1 && (
                <div className="tab-content h-full block tab-content-active">
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center">
                    <div className="p-8 lg:p-16 space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Demand Forecasting
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Stock Alerts
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Smart Classification
                        </span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-on-background">
                        Make smarter inventory decisions with predictive analytics
                      </h3>
                      <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                        Use historical sales data to forecast demand, detect slow-moving products, and receive proactive restock alerts to maintain optimal stock levels.
                      </p>
                    </div>
                    <div className="bg-surface-container-low/30 p-8 h-full flex items-center justify-center overflow-hidden">
                      <img
                        alt="Predict Inventory Dashboard"
                        className="w-full max-w-[500px] h-auto rounded-xl shadow-2xl transition-transform duration-700 hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuARd4n3QJfFyGGyqEqdQ9T3ScI930PeLeHMx1VOLz8k3CYHLZdrBkKC8Js4-g3hZXC86eZD97GVJck1eR9gCyPebyrcTVg0gxZsebZ8Wh8uQ6k40BhAD4nJaOHnM1rdjtth0DUbLxHP1x0o9NnMcasyK-Bk-NwDAllrxmpBI4cf4nJtnIFTa4i2Npxghda6VdUX9b8f2PPj1Lhoi-NhzXvjlByKycRqz6uiSliO6wmrweK_oOZYmuYEQTBkiR4dTrw0f6S_QdF1exhj"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Business Insights */}
              {currentTab === 2 && (
                <div className="tab-content h-full block tab-content-active">
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full items-center">
                    <div className="p-8 lg:p-16 space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Sales Analytics
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Combo Suggestions
                        </span>
                        <span className="px-3 py-1 bg-surface-container-low text-primary rounded-full text-xs font-semibold">
                          Profit Insights
                        </span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-on-background">
                        Drive better decisions with intelligent insights
                      </h3>
                      <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                        Analyze sales trends, customer purchase patterns, and product performance to generate profitable combos and improve overall business performance.
                      </p>
                    </div>
                    <div className="bg-surface-container-low/30 p-8 h-full flex items-center justify-center overflow-hidden">
                      <img
                        alt="Business Insights Dashboard"
                        className="w-full max-w-[500px] h-auto rounded-xl shadow-2xl transition-transform duration-700 hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1HD1h-3Gwyck2YVCpd89KTiyCDoH7TfHPIo--jkaQoS6gqvSmsh731prh86jChy7iaPnx7c47L-txGeUZMckVEHRkd4FtmM6fuJEmgPQerreS8VQsC4qtm2yQ9eakwySinplSott3teAOz1UChO6TGwt7_S1-xmxqv6EtpiHchigdeqIPJxp76cdIrPJssSBmwreTLwxwQIrD9W7vjfSJppnbTXfxTjjiAUvw5xOfwoLbAT-ab64IYeiPrEDk8iZSfZ-FAA_bEjp5"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Dashboard Preview Section 1: Smart Inventory */}
          <section className="bg-white py-4 overflow-hidden">
            <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
              {/* Left Side: Mockup Image */}
              <div className="relative flex justify-center items-center">
                <div className="relative w-full flex items-center justify-center">
                  <img
                    alt="Inventory Management Analytics"
                    className="w-full max-w-[300px] lg:max-w-[330px] h-auto object-contain scale-[2.0] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.55] hover:drop-shadow-2xl"
                    src={smartInventoryImg}
                  />
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-on-surface">Smart Inventory &amp; Sales Intelligence</h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  Manage your inventory with intelligent insights and real-time data. StockSense helps you monitor stock levels, predict demand, and make better decisions to improve efficiency and reduce losses.
                </p>
                <ul className="space-y-3">
                  {[
                    'Real-time inventory tracking and updates',
                    'AI-based demand prediction and stock planning',
                    'Automatic low stock and expiry alerts',
                    'Identification of slow-moving and dead stock',
                    'Smart discount suggestions for stock clearance',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                      </div>
                      <span className="text-base text-on-surface-variant font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Dashboard Preview Section 2: Billing System */}
        <section className="py-4" style={{ backgroundColor: '#DCE7E0' }}>
          <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-on-background">Fast and Efficient Billing System</h2>
              <p className="text-base lg:text-lg text-on-surface-variant leading-relaxed">
                Simplify checkout with a smooth POS interface that enables quick billing, accurate transactions, and real-time inventory updates.
              </p>
              <ul className="space-y-3">
                {[
                  'Barcode-based product scanning',
                  'Instant invoice generation',
                  'Real-time stock updates after billing',
                  'Easy discount application',
                  'Secure transaction handling',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-base font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center">
              <img
                alt="Modern POS Billing Interface"
                className="w-full max-w-[300px] lg:max-w-[330px] h-auto object-contain scale-[2.0] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.55] hover:drop-shadow-2xl"
                src={fastBillingImg}
              />
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section 3: Understand Your Business */}
        <section className="bg-white py-4">
          <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="order-2 lg:order-1 relative group flex justify-center">
              <img
                alt="Business Performance Analytics Dashboard"
                className="w-full max-w-[300px] lg:max-w-[330px] h-auto object-contain scale-[2.0] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.55] hover:drop-shadow-2xl"
                src={businessInsightsImg}
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <h2 className="text-3xl font-bold text-on-background">Understand Your Business Better</h2>
              <p className="text-base lg:text-lg text-on-surface-variant leading-relaxed">
                Gain valuable insights into sales and product performance to support better decision making and business growth.
              </p>
              <ul className="space-y-3">
                {[
                  'Sales and revenue tracking',
                  'Identification of top-selling products',
                  'Monitoring slow-moving items',
                  'Performance analytics and reports',
                  'Trend-based decision support',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-base font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section 4: Customer Visibility */}
        <section className="py-4" style={{ backgroundColor: '#DCE7E0' }}>
          <div className="w-full px-4 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-on-background">Enhancing Customer Visibility</h2>
              <p className="text-base lg:text-lg text-on-surface-variant leading-relaxed">
                Provide customers with easy access to product information, pricing, and promotions through a simple and user-friendly interface.
              </p>
              <ul className="space-y-3">
                {[
                  'View products and pricing',
                  'Access ongoing offers and discounts',
                  'Browse product categories easily',
                  'No login required',
                  'Simple and accessible design',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-base font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group flex justify-center">
              <img
                alt="Customer Facing Interface"
                className="w-full max-w-[300px] lg:max-w-[330px] h-auto object-contain scale-[2.0] transition-all duration-500 hover:-translate-y-4 hover:scale-[1.55] hover:drop-shadow-2xl"
                src={customerVisibilityImg}
              />
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">

            {/* Header */}
            <div className="text-center mb-12">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest block mb-2">
                SHOP @ Chamson Multi Shop
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-background uppercase tracking-wide">
                FEATURED CATEGORIES
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant mt-2">
                Only high quality products available
              </p>
              <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'BEVERAGES', img: beveragesImg },
                { title: 'FLOURS, DALS & RICE', img: flourImg },
                { title: 'SNACKS & BISCUITS', img: biscuitsImg },
                { title: 'VEGETABLES & FRUITS', img: vegeImg, imgClass: 'brightness-[1.05] contrast-[1.15]' },
              ].map((category, idx) => (
                <div
                  key={idx}
                  className="group relative block overflow-hidden bg-white border border-gray-200 rounded-xl aspect-[4/5] cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => navigate('/products')}
                >
                  {/* Product Image */}
                  <div className="absolute inset-0 p-6 flex items-center justify-center">
                    <img
                      src={category.img}
                      alt={category.title}
                      className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110 ${category.imgClass || ''}`}
                    />
                  </div>

                  {/* Dark Overlay (hidden by default, shows on hover) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 z-10" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <h3 className="text-white font-bold text-lg md:text-xl uppercase tracking-wider text-center px-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {category.title}
                    </h3>

                    {/* Hover Content */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 mt-2 flex flex-col items-center">
                      <span className="text-white font-semibold text-sm border-b border-white pb-0.5 hover:text-primary hover:border-primary transition-colors">
                        View More
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
        {/* Discount Details Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Header */}
            <div className="text-center mb-12">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest block mb-2">
                SPECIAL OFFERS
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-background uppercase tracking-wide">
                DISCOUNT DETAILS
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant mt-2">
                Grab these amazing deals before they run out
              </p>
              <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  discount: 'Save up to 49%', 
                  title: 'WEEKEND LOYALTY OFFERS', 
                  desc: '23 products • Ends today', 
                  img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800&h=600' // Groceries flatlay
                },
                { 
                  discount: 'Flat 20% Off', 
                  title: 'FRESH PRODUCE COMBO', 
                  desc: '15 products • Ends tomorrow', 
                  img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800&h=600' // Veggies/Fruits
                },
                { 
                  discount: 'Buy 1 Get 1 Free', 
                  title: 'PANTRY ESSENTIALS', 
                  desc: '42 products • Limited time', 
                  img: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&q=80&w=800&h=600' // Pantry/Grains
                },
              ].map((offer, idx) => (
                <div 
                  key={idx} 
                  className="group relative block overflow-hidden rounded-2xl aspect-[16/9] lg:aspect-[4/3] cursor-pointer shadow-md transition-shadow hover:shadow-xl"
                  onClick={() => navigate('/offers')}
                >
                  {/* Background Image */}
                  <img 
                    src={offer.img} 
                    alt={offer.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Dark Gradient Overlay for better contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top Left Info Box */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-sm max-w-[75%] transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="text-[#00B488] font-bold text-sm block mb-1">
                      {offer.discount}
                    </span>
                    <h3 className="text-gray-800 font-bold text-[11px] sm:text-xs uppercase tracking-wide leading-tight mb-1">
                      {offer.title}
                    </h3>
                    <p className="text-gray-500 text-[10px] sm:text-[11px]">
                      {offer.desc}
                    </p>
                  </div>
                  
                  {/* Bottom Right CTA Button */}
                  <div className="absolute bottom-4 right-4 bg-[#00B488] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                    View Offer
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full">
          <div className="bg-primary p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
            <div className="relative z-10 space-y-6 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-on-primary">
                Start managing your retail smarter with StockSense
              </h2>
              <p className="text-secondary-container text-sm md:text-base max-w-lg mx-auto opacity-90">
                Join 2,000+ modern retailers who have optimized their inventory flow this year.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl text-sm font-semibold hover:scale-105 transition-transform duration-200 shadow-lg active:scale-95"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
