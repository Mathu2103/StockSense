export default function OffersPage() {
  const offers = [
    {
      id: 1,
      title: 'Summer Clearance Sale',
      discount: 'Up to 50% OFF',
      description: 'Massive discounts on all summer apparel and outdoor gear. Limited time only.',
      code: 'SUMMER50',
      validUntil: 'Ends in 3 days',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-primary-container text-on-primary-container'
    },
    {
      id: 2,
      title: 'Tech Bundle Deal',
      discount: 'Save $150',
      description: 'Buy any laptop and get a premium wireless mouse and keyboard bundle at a huge discount.',
      code: 'TECHBUNDLE',
      validUntil: 'Valid until month end',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-secondary-container text-on-secondary-container'
    },
    {
      id: 3,
      title: 'Welcome Discount',
      discount: '20% OFF First Order',
      description: 'New to StockSense? Enjoy a special discount on your first purchase across all categories.',
      code: 'WELCOME20',
      validUntil: 'No expiry',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=1000&auto=format&fit=crop',
      color: 'bg-tertiary-container text-on-tertiary-container'
    }
  ]

  return (
    <div className="bg-surface-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest/20 text-on-primary rounded-full text-xs font-semibold mb-6 backdrop-blur-md border border-white/20">
            <span className="material-symbols-outlined text-[14px]">local_offer</span>
            Exclusive Offers
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-primary mb-6">
            Unbeatable Deals & Discounts
          </h1>
          <p className="text-lg md:text-xl text-surface-container-high max-w-2xl mx-auto">
            Discover limited-time promotions, special bundles, and clearance sales designed to give you the best value.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-warning-400 rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-secondary rounded-full blur-[80px]"></div>
        </div>
      </section>

      {/* Featured Offer Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-12 mb-16">
        <div className="relative rounded-3xl overflow-hidden bg-surface-container-highest shadow-lg flex flex-col md:flex-row items-center border border-outline-variant/30">
          <div className="p-8 md:p-12 md:w-1/2 z-10">
            <span className="inline-block px-3 py-1 bg-error text-on-error rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm animate-pulse">Flash Sale</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Midnight Madness</h2>
            <p className="text-lg text-on-surface-variant mb-8">Get an extra 30% off on all clearance items between 12 AM and 6 AM. Don't miss out on these incredible savings!</p>
            <div className="flex items-center gap-4">
              <div className="bg-surface-container-lowest px-4 py-3 rounded-xl border border-dashed border-outline font-mono font-bold text-lg text-primary">
                MIDNIGHT30
              </div>
              <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
                Shop Now
              </button>
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-full min-h-[300px] relative">
            <img 
              src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1000&auto=format&fit=crop" 
              alt="Flash Sale" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest via-surface-container-highest/50 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <h3 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">sell</span>
          Active Promotions
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.id} className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/20 flex flex-col relative">
              {/* Image Header */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-4 right-4 backdrop-blur-md bg-white/90 text-on-surface px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  {offer.validUntil}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col flex-grow relative z-10">
                {/* Discount Badge overlapping image */}
                <div className={`absolute -top-6 left-8 px-6 py-2 rounded-xl text-sm font-extrabold shadow-lg ${offer.color}`}>
                  {offer.discount}
                </div>
                
                <h4 className="text-xl font-bold text-on-surface mt-4 mb-3">{offer.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
                  {offer.description}
                </p>
                
                <div className="mt-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex justify-between items-center group-hover:border-primary/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Promo Code</span>
                    <span className="font-mono font-bold text-primary">{offer.code}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
