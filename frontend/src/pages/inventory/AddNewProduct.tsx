import Sidebar from './Sidebar';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AddNewProduct() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'category' | 'brand' | 'manufacturer' | 'supplier' | null>(null);

  return (
    <div className="flex h-screen bg-surface-container-lowest text-on-surface font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 text-sm">
            <Link to="/manage-products" className="text-outline hover:text-on-surface font-medium">Products</Link>
            <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
            <span className="text-primary font-bold">Add New Item</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full pl-9 pr-4 py-1.5 bg-background border border-outline-variant rounded-full focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-xl">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-surface-container-lowest flex flex-col">
          
          <div className="max-w-[1100px] w-full mx-auto pb-12">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Create New Inventory Item</h1>
              <p className="text-on-surface-variant text-sm">Fill in the primary details to list a new product in the central warehouse.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Details Panel */}
                <div className="border border-outline-variant rounded-xl p-6 bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                    <h2 className="text-xl font-bold text-on-surface">Basic Details</h2>
                  </div>

                  <div className="space-y-5">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Product Name *</label>
                      <input 
                        type="text" 
                        defaultValue="e.g. Organic Whole Milk" 
                        className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant"
                      />
                    </div>

                    {/* Item Type & Category */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Item Type</label>
                        <div className="relative">
                          <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                            <option>Goods</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Category</label>
                          <button type="button" onClick={() => setActiveModal('category')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                            <option>Dairy & Eggs</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Brand & SKU */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Brand</label>
                          <button type="button" onClick={() => setActiveModal('brand')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                            <option>Select Brand</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">SKU (Stock Keeping Unit)</label>
                        <input 
                          type="text" 
                          defaultValue="MILK-ORG-1L" 
                          className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant"
                        />
                      </div>
                    </div>

                    {/* Manufacturer (half width) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Manufacturer</label>
                          <button type="button" onClick={() => setActiveModal('manufacturer')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                            <option>Select Manufacturer</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Description</label>
                      <textarea 
                        placeholder="Brief details about the product..." 
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant resize-none"
                      ></textarea>
                    </div>

                    {/* Supplier & Product Code */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-sm font-medium text-on-surface-variant">Supplier</label>
                          <button type="button" onClick={() => setActiveModal('supplier')} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            <span className="material-symbols-outlined text-[14px]">settings</span> Manage
                          </button>
                        </div>
                        <div className="relative">
                          <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                            <option>Select Supplier</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Supplier Product Code</label>
                        <input 
                          type="text" 
                          defaultValue="SUP-12345" 
                          className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Additional Panels (Just to match layout feeling if there's more below) */}
                <div className="grid grid-cols-2 gap-6 opacity-30 pointer-events-none">
                    <div className="h-16 border border-outline-variant rounded-xl"></div>
                    <div className="h-16 border border-outline-variant rounded-xl"></div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Item Media */}
                <div className="border border-outline-variant rounded-xl p-6 bg-surface-container-lowest shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-xl">image</span>
                    <h2 className="text-xl font-bold text-on-surface">Item Media</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-on-surface-variant mb-2">Front View (Required)</p>
                      <div className="w-full h-48 border-2 border-dashed border-outline rounded-xl bg-background flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">add_photo_alternate</span>
                        <p className="text-sm font-medium text-on-surface-variant mb-1">Click to upload main image</p>
                        <p className="text-[10px] text-outline-variant">Max size: 5MB (PNG, JPG)</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-on-surface-variant mb-2">Gallery Images</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="aspect-square border border-outline-variant rounded-lg bg-background flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-outline-variant">add</span>
                        </div>
                        <div className="aspect-square border border-outline-variant rounded-lg bg-background flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-outline-variant">add</span>
                        </div>
                        <div className="aspect-square border border-outline-variant rounded-lg bg-background flex items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-outline-variant">add</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden shadow-md">
                  <div className="relative z-10">
                    <h3 className="font-bold mb-2">Quick Tip</h3>
                    <p className="text-sm text-blue-50 leading-relaxed">
                      Adding high-quality images and clear descriptions helps the billing team identify products faster during peak hours.
                    </p>
                  </div>
                  <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-blue-500 opacity-30 pointer-events-none">lightbulb</span>
                </div>

              </div>

            </div>

          </div>

        </main>

        {/* Bottom Sticky Bar */}
        <div className="bg-background border-t border-outline-variant px-8 py-4 flex items-center justify-between z-10 shrink-0">
          <span className="text-sm font-medium text-outline">Unsaved changes detected</span>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/manage-products')}
              className="px-6 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Product
            </button>
          </div>
        </div>

      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/50">
              <h2 className="text-lg font-bold text-on-surface">
                {activeModal === 'category' ? 'Manage Categories' : 
                 activeModal === 'brand' ? 'Manage Brands' : 
                 activeModal === 'manufacturer' ? 'Manage Manufacturers' :
                 'Manage Suppliers'}
              </h2>
              <button type="button" onClick={() => setActiveModal(null)} className="text-outline-variant hover:text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  {activeModal === 'category' ? 'Add New Category' : 
                   activeModal === 'brand' ? 'Add New Brand' : 
                   activeModal === 'manufacturer' ? 'Add New Manufacturer' :
                   'Add New Supplier'}
                </label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder={`e.g. ${
                      activeModal === 'category' ? 'Snacks & Sweets' : 
                      activeModal === 'brand' ? 'Nestle' : 
                      activeModal === 'manufacturer' ? 'General Mills' :
                      'Acme Corp'
                    }`}
                    className="flex-1 px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant placeholder:text-outline-variant"
                  />
                  <button type="button" className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-colors">
                    Add
                  </button>
                </div>
              </div>

              {activeModal === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Parent Category</label>
                  <div className="relative">
                    <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                      <option>None (Root Category)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-3">
                  Existing {activeModal === 'category' ? 'Categories' : 
                            activeModal === 'brand' ? 'Brands' : 
                            activeModal === 'manufacturer' ? 'Manufacturers' :
                            'Suppliers'}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border border-outline-variant rounded-lg p-2 bg-background/50">
                  <div className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {activeModal === 'category' ? 'folder' : 
                       activeModal === 'brand' ? 'label' : 
                       'factory'}
                    </span>
                    <span className="text-sm font-medium text-on-surface-variant">Samboo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-outline-variant/50 flex justify-start bg-background">
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-lowest border border-outline rounded-lg hover:bg-background transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
