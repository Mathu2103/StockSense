import { useEffect, useState } from 'react';
import CategoryMarquee from '../../components/shared/CategoryMarquee/CategoryMarquee';
import { MasterDataService } from '../../services/masterDataService';

interface Product {
  sku: string;
  name: string;
  sellingPrice: number;
  imageUrl?: string;
  badge?: string;
  badgeClass?: string;
  status: string;
  categoryName?: string;
  subCategoryName?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await MasterDataService.getProducts();
        if (response.success) {
          // Filter active products
          const activeProducts = response.data.filter((p: any) => p.status === 'ACTIVE');
          
          const mappedProducts = activeProducts.map((p: any) => {
             const badgeClasses = [
                'bg-[#1b4332] text-white',
                'bg-[#ffe4e6] text-[#be123c]',
                'bg-blue-100 text-blue-800'
             ];
             const randomBadgeClass = badgeClasses[Math.floor(Math.random() * badgeClasses.length)];

            return {
              sku: p.sku,
              name: p.name,
              sellingPrice: p.sellingPrice,
              imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop',
              badge: p.seasonal || (Math.random() > 0.8 ? 'New' : undefined),
              badgeClass: randomBadgeClass,
              status: p.status,
              categoryName: p.masterClass?.category?.name,
              subCategoryName: p.masterClass?.subCategory?.name,
            };
          });
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden font-sans">
      {/* Background Soft Glow */}
      <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-teal-800/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-[36px] md:text-[44px] lg:text-[48px] font-extrabold text-[#111827] leading-tight mb-6 tracking-tight">
            Shop by Categories
          </h1>
          <CategoryMarquee />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111827]"></div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div 
                  key={product.sku} 
                  className="bg-white rounded-[20px] p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  {/* Image Container */}
                  <div className="bg-[#f4f6f8] rounded-[14px] h-48 relative overflow-hidden mb-4 flex justify-center items-center shrink-0">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                    
                    {/* Badge */}
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full shadow-sm z-10 ${product.badgeClass}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="px-2 pb-2 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-1.5 items-center mb-2">
                      {product.categoryName && (
                        <span className="text-[9px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded tracking-wide border border-teal-100">
                          {product.categoryName}
                        </span>
                      )}
                      {product.subCategoryName && (
                        <span className="text-[9px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded tracking-wide border border-gray-200">
                          {product.subCategoryName}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-[14px] font-bold text-gray-800 mb-1 leading-tight flex-grow">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-900 text-[16px] font-extrabold">
                        Rs. {product.sellingPrice.toFixed(2)}
                      </span>
                      <button className="w-8 h-8 rounded-full bg-[#eff6ff] text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm">
                        <span className="text-[18px] leading-none font-medium mb-[1px]">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-3xl">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Products Found</h3>
                  <p className="text-gray-500 text-sm">We couldn't find any active products at the moment.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    
                    // Show first, last, current, and surrounding pages
                    if (
                      totalPages > 7 && 
                      pageNum !== 1 && 
                      pageNum !== totalPages && 
                      (pageNum < currentPage - 1 || pageNum > currentPage + 1)
                    ) {
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                          currentPage === pageNum 
                            ? 'bg-[#103e2c] text-white shadow-md' 
                            : 'border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <div className="sm:hidden text-sm font-medium text-gray-600 px-4">
                  Page {currentPage} of {totalPages}
                </div>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
