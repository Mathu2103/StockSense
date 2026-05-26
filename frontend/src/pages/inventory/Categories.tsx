import Sidebar from './Components/Sidebar';
import InventoryHeader from './Components/InventoryHeader';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const categoryData = [
  {
    id: 'dairy',
    name: 'Dairy Products',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
    status: 'Low Stock',
    statusClass: 'bg-[#d97706]',
    skus: 124,
    health: '25%',
    children: [
      { id: 'milk', name: 'Milk Products', products: [{ name: 'Whole Milk', price: '$4.50' }, { name: 'Skim Milk', price: '$4.00' }] },
      { id: 'cheese', name: 'Cheese Products', products: [{ name: 'Cheddar Block', price: '$2.99' }] },
      { id: 'yogurt', name: 'Yogurt & Desserts', products: [] },
      { id: 'butter', name: 'Butter & Margarine', products: [] },
      { id: 'cream', name: 'Cream Products', products: [] },
    ]
  },
  {
    id: 'food',
    name: 'Food & Grains',
    icon: '🍚',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 482,
    health: '85%',
    children: [
      { id: 'rice', name: 'Rice & Grains', products: [] },
      { id: 'flour', name: 'Flour Products', products: [] },
      { id: 'pasta', name: 'Pasta & Noodles', products: [] },
      { id: 'lentils', name: 'Lentils & Pulses', products: [] },
      { id: 'breakfast', name: 'Breakfast Items', products: [] },
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1559553156-2e97137af16f?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 310,
    health: '75%',
    children: [
      { id: 'soft-drinks', name: 'Soft Drinks', products: [] },
      { id: 'fruit-juices', name: 'Fruit Juices', products: [] },
      { id: 'tea-coffee', name: 'Tea & Coffee', products: [] },
      { id: 'energy-drinks', name: 'Energy Drinks', products: [] },
      { id: 'bottled-water', name: 'Bottled Water', products: [] },
    ]
  },
  {
    id: 'snacks',
    name: 'Snacks & Confectionery',
    icon: '🍪',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    status: 'In Stock',
    statusClass: 'bg-emerald-600',
    skus: 520,
    health: '65%',
    children: [
      { id: 'biscuits', name: 'Biscuits & Cookies', products: [] },
      { id: 'chips', name: 'Chips & Crisps', products: [] },
      { id: 'chocolates', name: 'Chocolates', products: [] },
      { id: 'candy', name: 'Candy & Sweets', products: [] },
      { id: 'bakery-snacks', name: 'Bakery Snacks', products: [] },
    ]
  },
  {
    id: 'household',
    name: 'Household & Cleaning',
    icon: '🧼',
    image: 'https://images.unsplash.com/photo-1585906560946-17b5f13426e2?q=80&w=600&auto=format&fit=crop',
    status: 'Critical',
    statusClass: 'bg-red-600',
    skus: 406,
    health: '15%',
    children: [
      { 
        id: 'laundry', 
        name: 'Laundry Products', 
        products: [
          { name: 'Sunlight Liquid 1L', price: '$8.50' },
          { name: 'Sunlight Power Powder 2kg', price: '$12.00' },
          { name: 'Fabric Softener 500ml', price: '$4.20' }
        ] 
      },
      { id: 'dishwashing', name: 'Dishwashing Items', products: [] },
      { id: 'cleaning-chems', name: 'Cleaning Chemicals', products: [] },
      { id: 'air-fresheners', name: 'Air Fresheners', products: [] },
      { id: 'paper-tissues', name: 'Paper & Tissues', products: [] },
    ]
  },
];

export default function Category() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hierarchy, setHierarchy] = useState<'parent' | 'sub'>('parent');

  const [activeView, setActiveView] = useState<'parents' | 'children' | 'products'>('parents');
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // View Handlers
  const handleViewChildren = (parent: any) => {
    setSelectedParent(parent);
    setActiveView('children');
  };

  const handleViewProducts = (child: any) => {
    setSelectedChild(child);
    setActiveView('products');
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <InventoryHeader>

        </InventoryHeader>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col relative">

          <div className="w-full max-w-7xl mx-auto space-y-6 pb-24">

            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="material-symbols-outlined text-outline text-[18px]">category</span>
                  <button onClick={() => setActiveView('parents')} className="text-on-surface-variant font-medium hover:text-primary transition-colors">Categories</button>
                  <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                  
                  {activeView !== 'parents' && selectedParent && (
                    <>
                      <button onClick={() => setActiveView('children')} className="text-on-surface-variant font-medium hover:text-primary transition-colors">{selectedParent.name}</button>
                      <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                    </>
                  )}
                  
                  <span className="text-on-surface font-bold">
                    {activeView === 'parents' ? 'All Parents' : activeView === 'children' ? 'Sub-categories' : selectedChild?.name}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-on-surface mb-1 tracking-tight">
                  {activeView === 'parents' ? 'Parent Categories' : activeView === 'children' ? selectedParent?.name : selectedChild?.name}
                </h1>
                <p className="text-on-surface-variant text-sm">
                  {activeView === 'parents' ? 'Organize and track your high-level product catalogs.' : activeView === 'children' ? 'Manage sub-categories under this parent.' : 'Manage products in this sub-category.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setHierarchy(activeView === 'parents' ? 'parent' : 'sub');
                  setIsModalOpen(true);
                }} 
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New {activeView === 'parents' ? 'Category' : activeView === 'children' ? 'Sub-category' : 'Product'}
              </button>
            </div>

            {/* Metrics (Only on parents view for cleaner look) */}
            {activeView === 'parents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total Categories</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-on-surface leading-none">{categoryData.length}</span>
                    <span className="text-xs font-bold text-emerald-600 mb-1">+2 this month</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total SKUs</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-on-surface leading-none">
                      {categoryData.reduce((acc, cat) => acc + cat.skus, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Low Stock Categories</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-red-600 leading-none">1</span>
                    <span className="text-xs font-medium text-red-600 mb-1">Requires attention</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Last Sync</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">sync</span>
                    <span className="text-lg font-medium text-on-surface-variant">12 mins ago</span>
                  </div>
                </div>
              </div>
            )}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              
              {activeView === 'parents' && categoryData.map((category) => (
                <div key={category.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-32 relative">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className={`absolute bottom-3 left-3 ${category.statusClass} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                      {category.status}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                        {category.icon} {category.name}
                      </h3>
                      <div className="flex items-center gap-1 text-primary bg-secondary-container px-2 py-1 rounded text-xs font-medium">
                        <span className="material-symbols-outlined text-[14px]">account_tree</span>
                        {category.children.length} Sub
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                        <span>Active SKUs</span>
                        <span>{category.skus} items</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
                        <div className={`h-full ${category.statusClass} rounded-full`} style={{ width: category.health }}></div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewChildren(category)}
                          className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-1"
                        >
                          View Sub-categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {activeView === 'children' && selectedParent && selectedParent.children.map((child: any) => (
                <div key={child.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col hover:border-primary transition-colors cursor-pointer" onClick={() => handleViewProducts(child)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary-container text-primary rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <span className="bg-slate-100 text-on-surface-variant px-2 py-1 rounded text-xs font-bold">
                      {child.products.length} Products
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">{child.name}</h3>
                  <p className="text-sm text-outline mb-6">Manage all products under {child.name}.</p>
                  
                  <button className="mt-auto w-full border border-outline-variant py-2 rounded-lg text-sm font-semibold text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-1">
                    Manage Products <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              ))}

              {activeView === 'products' && selectedChild && (
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                  {selectedChild.products.length > 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm text-on-surface-variant">
                        <thead className="bg-background border-b border-outline-variant">
                          <tr>
                            <th className="px-6 py-4 font-bold text-outline uppercase tracking-wider text-xs">Product Name</th>
                            <th className="px-6 py-4 font-bold text-outline uppercase tracking-wider text-xs">Price</th>
                            <th className="px-6 py-4 font-bold text-outline uppercase tracking-wider text-xs text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedChild.products.map((p: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-on-surface">{p.name}</td>
                              <td className="px-6 py-4">{p.price}</td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button className="text-primary hover:bg-secondary-container p-1.5 rounded transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                                <button className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-outline-variant">
                        <span className="material-symbols-outlined text-3xl">inventory_2</span>
                      </div>
                      <h3 className="text-lg font-bold text-on-surface mb-2">No Products Found</h3>
                      <p className="text-sm text-outline max-w-sm mb-6">There are no products listed in {selectedChild.name} yet.</p>
                      <button className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> Add New Product
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Add New Category button card (only in parents or children view) */}
              {activeView !== 'products' && (
                <button 
                  onClick={() => {
                    setHierarchy(activeView === 'parents' ? 'parent' : 'sub');
                    setIsModalOpen(true);
                  }} 
                  className="border-2 border-dashed border-outline rounded-xl flex flex-col items-center justify-center min-h-[220px] text-outline hover:bg-surface-container hover:border-primary-fixed hover:text-primary transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-secondary-container flex items-center justify-center mb-4 transition-colors">
                    <span className="material-symbols-outlined text-2xl text-outline-variant group-hover:text-primary">add</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface-variant group-hover:text-primary mb-1">
                    New {activeView === 'parents' ? 'Parent Category' : 'Sub-category'}
                  </h3>
                  <p className="text-sm text-outline max-w-[160px] text-center">
                    {activeView === 'parents' ? 'Create custom category for cataloging' : `Add to ${selectedParent?.name}`}
                  </p>
                </button>
              )}

            </div>
          </div>

          {/* Floating Action Button */}
          <button onClick={() => setIsModalOpen(true)} className="absolute bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:opacity-90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20">
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>

        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/50">
              <h2 className="text-xl font-bold text-on-surface">Manage Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* Category Name */}
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Category Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Milk"
                  className="w-full px-4 py-3 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-base text-on-surface-variant placeholder:text-outline-variant"
                />
              </div>

              {/* Hierarchy Level */}
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Hierarchy Level</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setHierarchy('parent')}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${hierarchy === 'parent' ? 'border-primary bg-secondary-container/30' : 'border-outline-variant hover:border-outline'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${hierarchy === 'parent' ? 'border-primary' : 'border-outline'}`}>
                      {hierarchy === 'parent' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className={`font-bold ${hierarchy === 'parent' ? 'text-on-surface' : 'text-on-surface-variant'}`}>Parent</h4>
                      <p className="text-xs text-outline font-medium mt-0.5">Top-level group</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setHierarchy('sub')}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${hierarchy === 'sub' ? 'border-primary bg-secondary-container/30' : 'border-outline-variant hover:border-outline'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${hierarchy === 'sub' ? 'border-primary' : 'border-outline'}`}>
                      {hierarchy === 'sub' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className={`font-bold ${hierarchy === 'sub' ? 'text-on-surface' : 'text-on-surface-variant'}`}>Sub-category</h4>
                      <p className="text-xs text-outline font-medium mt-0.5">Belongs to a parent</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Select Parent Category */}
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Select Parent Category</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-base text-on-surface-variant appearance-none"
                    disabled={hierarchy === 'parent'}
                  >
                    <option>Grocery</option>
                    <option>Dairy</option>
                    <option>Bakery</option>
                  </select>
                  <span className={`material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${hierarchy === 'parent' ? 'text-slate-300' : 'text-outline'}`}>expand_more</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-background border-t border-outline-variant/50 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-colors shadow-sm">
                Save Category
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
