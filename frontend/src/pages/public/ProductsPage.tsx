export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: '$299.00',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Minimalist Desk Lamp',
      category: 'Home & Living',
      price: '$89.00',
      status: 'Low Stock',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      price: '$450.00',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      price: '$150.00',
      status: 'Out of Stock',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 5,
      name: 'Ceramic Coffee Mug',
      category: 'Home & Living',
      price: '$24.00',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 6,
      name: 'Smart Fitness Watch',
      category: 'Electronics',
      price: '$199.00',
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=1000&auto=format&fit=crop',
    }
  ]

  return (
    <div className="bg-surface-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary pt-24 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest/20 text-on-primary rounded-full text-xs font-semibold mb-6 backdrop-blur-md border border-white/20">
            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
            Product Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-primary mb-6">
            Discover Premium Products
          </h1>
          <p className="text-lg md:text-xl text-surface-container-high max-w-2xl mx-auto">
            Browse our curated collection of high-quality items designed to elevate your everyday life.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-secondary rounded-full blur-[80px]"></div>
          <div className="absolute top-20 right-0 w-72 h-72 bg-tertiary rounded-full blur-[80px]"></div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-surface-container-low text-on-surface rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Electronics', 'Home & Living', 'Furniture'].map((cat) => (
              <button 
                key={cat}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  cat === 'All' 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/20 flex flex-col cursor-pointer">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-surface-container-low">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
                    product.status === 'In Stock' ? 'bg-primary-container/90 text-on-primary-container' : 
                    product.status === 'Low Stock' ? 'bg-warning-200/90 text-warning-700' : 
                    'bg-error-container/90 text-on-error-container'
                  }`}>
                    {product.status}
                  </span>
                </div>
                {/* Quick Action Button */}
                <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95">
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">{product.category}</div>
                <h3 className="text-xl font-bold text-on-surface mb-2">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/20">
                  <span className="text-2xl font-extrabold text-on-surface">{product.price}</span>
                  <div className="flex items-center gap-1 text-warning-500">
                    <span className="material-symbols-outlined text-[18px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-bold text-on-surface-variant">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
