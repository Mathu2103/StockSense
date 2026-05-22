import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Header Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      {/* TopNavBar */}
      <header
        className={`bg-surface/80 backdrop-blur-md fixed full-width top-0 left-0 right-0 z-50 border-b border-outline-variant shadow-sm transition-all duration-300 ${scrolled ? 'py-2 shadow-md' : 'py-4'
          }`}
      >
        <nav className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-primary">StockSense</div>
          <div className="hidden md:flex gap-8 items-center">
            <a
              className="text-primary font-bold border-b-2 border-primary text-sm transition-transform duration-150 active:scale-95"
              href="#"
            >
              Home
            </a>
            <a
              className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
              href="#"
            >
              Products
            </a>
            <a
              className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
              href="#"
            >
              Discount
            </a>
            <a
              className="text-on-surface-variant hover:text-primary text-sm transition-colors duration-200"
              href="#"
            >
              About Us
            </a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            Get Started
          </button>
        </nav>
      </header>

      <main className="pt-[72px]">
        {/* Hero Section */}
        <section
          className="hero-gradient relative overflow-hidden min-h-[85vh] flex items-center"
          style={{
            backgroundImage: `linear-gradient(to right, #f8f9ff 20%, rgba(248, 249, 255, 0.4) 50%, transparent 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXm1pVj0ejbx4rcvLprqJ3NCnhhWyCkAwRYR9q6SIoBP4NUf1pBL65dhocZgx5o3ZwB0MGg7FDmE6aM8FeACcyEs8BwSV1AvPTu_CNGAq7i-tIPQifonEKNNBPzvawbUN4P2463X2JGPze7JbhEyvSSulM2RU28cH7H4oFhEyzM---31b0gSV_YYGhbT0cuVToo9P4kwBYHjfJOHXoDHvNHWbDSNOeiSEQ6iSbg5emaC4nfZeN29ZEWNK2Bc9tX_qhIAj_v0hPQ8Z1')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 gap-8 items-center relative z-10">
            <div className="space-y-6 max-w-2xl py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Next-Gen Retail Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-background leading-tight">
                Smart Inventory &amp; Sales Intelligence for Modern Retail
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Optimize your stock levels, predict demand patterns, and unlock actionable sales insights with StockSense's AI-driven platform.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl text-sm font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  Get Started for Free
                </button>
                <button className="bg-surface-container-lowest border border-outline-variant px-8 py-4 rounded-xl text-sm font-semibold hover:bg-surface-container transition-all active:scale-95">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
          {/* Atmospheric Blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        </section>

        {/* Interactive Tabs Section */}
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
        <section className="bg-white py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Mockup Image */}
            <div className="relative flex justify-center items-center py-6">
              <div className="relative w-full flex items-center justify-center max-w-[500px]">
                {/* Decorative Blur */}
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                <img
                  alt="Smart Inventory &amp; Sales Intelligence"
                  className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
                  src="/smart_inventory.png"
                />
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-on-surface">Smart Inventory &amp; Sales Intelligence</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Manage your inventory with intelligent insights and real-time data. StockSense helps you monitor stock levels, predict demand, and make better decisions to improve efficiency and reduce losses.
              </p>
              <ul className="space-y-4">
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
              <div className="pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all active:scale-95"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section 2: Billing System */}
        <section className="py-16" style={{ backgroundColor: '#DDE9E1' }}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
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
              <button
                onClick={() => navigate('/login')}
                className="bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
              >
                Explore POS
              </button>
            </div>
            <div className="relative flex justify-center">
              <img
                alt="Modern POS Billing Interface"
                className="w-full max-w-[500px] h-auto object-contain transition-transform duration-700 hover:scale-105"
                src="/smart_billing.png"
              />
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section 3: Understand Your Business */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative group flex justify-center">
              <img
                alt="Business Performance Analytics Dashboard"
                className="w-full max-w-[500px] rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdpo8f9Jm5gCSydp8VLxFodgM3y5CB5AlkWzTjPOzQHWkND67Slhr3aDuIU3HNwIHgEKdpbU2YNfbCimMBFArQazGkdontTXQUN0O2GAqShG8BQaQlAyJF-tS7n2Qsjlkpp6SXAmmXDy3bpEfqDxcq4Nba8fx5MP-AH-8FbEcjca7lgF890DxP1Ct0fuNeTdPG9wJC42DEDJfoVgULOeCij73aO5gUpLWDtDmPpWonrGycDgpucIJy6h571rbYqXwIaC2FsGqaylVBX0Q"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
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
              <button
                onClick={() => navigate('/login')}
                className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
              >
                View Insights
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section 4: Customer Visibility */}
        <section className="bg-surface-container-low py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
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
              <button
                onClick={() => navigate('/offers')}
                className="bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
              >
                View Interface
              </button>
            </div>
            <div className="relative group flex justify-center">
              <img
                alt="Customer Facing Interface"
                className="w-full max-w-[500px] rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZbkk8Wrt-0RSz8SEAshI8AMCSkG88u_VQ6dCYFJo3YzX0iVcx0O_UY9Ntidh0WI_tjdmxkTtSoTmpK6GHYeCSciyJVgvQQIJJLpEF2Mf7fzqfPpqC8qdc4Fmq2RZ4AOMS33JyQ4jz1hlyt3A2Fv_4YgbPYjKyc4lAW_k7crwQ28m2d3mW3LY4Yji0gEV8J23Fde7Kc8g7txtFKfJVMTDqlHXwSLZuJPZmHZjEJrpQZK2uNk49gwq0Zq0kf3U7nPk645gzmt8KvpW1QdI"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <span className="text-primary text-xs font-bold uppercase tracking-widest block">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-on-background">
                Bridge the gap between physical retail and digital intelligence.
              </h2>
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
                StockSense was founded on the belief that every retailer, regardless of size, deserves access to the same high-level intelligence tools used by global giants. We've distilled complex data science into a beautiful, breathable interface that empowers you to make smarter decisions daily.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
          <div className="bg-primary p-12 md:p-20 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
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
            {/* Abstract Design Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/2 left-1/4 w-96 h-96 border border-on-primary rounded-full -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-1/4 w-64 h-64 border border-on-primary rounded-full -translate-y-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-tertiary text-tertiary-fixed full-width border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-12 max-w-7xl mx-auto gap-8">
          <div className="text-center md:text-left space-y-2">
            <div className="text-2xl font-bold text-surface-container-lowest">StockSense</div>
            <p className="text-sm text-tertiary-fixed-dim/70 max-w-xs leading-relaxed">
              © 2026 StockSense. All rights reserved. Retail Intelligence for the modern era.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
              Privacy Policy
            </a>
            <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
              Terms of Service
            </a>
            <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
              Cookie Policy
            </a>
            <a className="text-tertiary-fixed-dim/70 text-xs hover:underline decoration-secondary-fixed transition-all" href="#">
              Contact Support
            </a>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer text-surface-container-lowest">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer text-surface-container-lowest">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
