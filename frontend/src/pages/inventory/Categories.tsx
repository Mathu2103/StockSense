import Sidebar from './Sidebar';
import InventoryHeader from './InventoryHeader';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Category() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hierarchy, setHierarchy] = useState<'parent' | 'sub'>('parent');

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
                  <span className="text-on-surface-variant font-medium">Categories</span>
                  <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                  <span className="text-on-surface font-bold">All Parents</span>
                </div>
                <h1 className="text-3xl font-bold text-on-surface mb-1 tracking-tight">Parent Categories</h1>
                <p className="text-on-surface-variant text-sm">Organize and track your high-level product catalogs.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-colors shadow-sm shrink-0">
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Category
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total Categories</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-on-surface leading-none">24</span>
                  <span className="text-xs font-bold text-emerald-600 mb-1">+2 this month</span>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Total SKUs</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-on-surface leading-none">1,842</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Low Stock Categories</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-red-600 leading-none">3</span>
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

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              
              {/* Grocery */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="h-32 relative">
                  <img src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop" alt="Grocery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">In Stock</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-on-surface">Grocery</h3>
                    <div className="flex items-center gap-1 text-primary bg-secondary-container px-2 py-1 rounded text-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">account_tree</span>
                      4 Sub-categories
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Active SKUs</span>
                      <span>482 items</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                        View Sub-categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center text-outline hover:bg-background hover:text-on-surface-variant transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dairy */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="h-32 relative">
                  <img src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop" alt="Dairy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-[#d97706] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Low Stock</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-on-surface">Dairy</h3>
                    <div className="flex items-center gap-1 text-primary bg-secondary-container px-2 py-1 rounded text-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">account_tree</span>
                      4 Sub-categories
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Active SKUs</span>
                      <span>124 items</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
                      <div className="h-full bg-[#d97706] rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                        View Sub-categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center text-outline hover:bg-background hover:text-on-surface-variant transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bakery */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="h-32 relative">
                  <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop" alt="Bakery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">In Stock</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-on-surface">Bakery</h3>
                    <div className="flex items-center gap-1 text-primary bg-secondary-container px-2 py-1 rounded text-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">account_tree</span>
                      3 Sub-categories
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                      <span>Active SKUs</span>
                      <span>95 items</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-1">
                        View Sub-categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <button className="w-10 h-10 border border-outline-variant rounded-lg flex items-center justify-center text-outline hover:bg-background hover:text-on-surface-variant transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Category */}
              <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-outline rounded-xl flex flex-col items-center justify-center min-h-[340px] text-outline hover:bg-surface-container hover:border-primary-fixed hover:text-primary transition-colors group">
                <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-secondary-container flex items-center justify-center mb-4 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-outline-variant group-hover:text-primary">add</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface-variant group-hover:text-primary mb-1">New Parent<br/>Category</h3>
                <p className="text-sm text-outline max-w-[160px] text-center">Create custom category for cataloging</p>
              </button>

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
