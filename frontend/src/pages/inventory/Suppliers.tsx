
import Sidebar from "./Sidebar";
import InventoryHeader from './InventoryHeader';
import { Link, useNavigate } from 'react-router-dom';


export default function Suppliers() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-surface-container-lowest text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest relative">
        {/* Header */}
        <InventoryHeader>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/inventory" className="text-outline hover:text-on-surface font-medium">Suppliers</Link>
            <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
            <span className="text-primary font-bold">New Supplier</span>
          </div>
        </InventoryHeader>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 flex flex-col relative pb-28">
          <div className="max-w-6xl w-full mx-auto">
            <h1 className="text-3xl font-bold text-on-surface mb-6">New Supplier</h1>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                
                {/* Supplier Basic Details */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">person_add</span>
                    <h2 className="text-lg font-medium text-on-surface">Supplier Basic Details</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Supplier Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. Acme Corp Logistics" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Company Name</label>
                        <input type="text" placeholder="Legal Entity Name" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Contact Person Name</label>
                        <input type="text" placeholder="Full Name" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Email Address</label>
                        <input type="email" placeholder="contact@supplier.com" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Mobile Number</label>
                        <input type="tel" placeholder="+94 77 000 0000" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Work Phone</label>
                      <input type="tel" placeholder="+94 11 000 0000" className="w-full max-w-[50%] px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <h2 className="text-lg font-medium text-on-surface">Address Information</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Address Line</label>
                      <input type="text" placeholder="Street name, building number, suite" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">City</label>
                        <input type="text" placeholder="City" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1.5">District</label>
                        <input type="text" placeholder="District or State" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">notes</span>
                    <h2 className="text-lg font-medium text-on-surface">Remarks / Notes</h2>
                  </div>
                  <div>
                    <textarea 
                      placeholder="Enter any additional information about the supplier..."
                      className="w-full h-32 px-4 py-3 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant resize-none"
                    ></textarea>
                    <p className="text-xs text-outline-variant mt-1">Maximum 500 characters</p>
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                
                {/* Business Details */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">work</span>
                    <h2 className="text-lg font-medium text-on-surface">Business Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Supplier Type</label>
                      <div className="relative">
                        <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                          <option>Local Supplier</option>
                          <option>International</option>
                          <option>Distributor</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Preferred Categories</label>
                      <div className="w-full min-h-[100px] p-2 bg-background border border-outline-variant rounded-lg flex flex-wrap gap-2 items-start focus-within:ring-2 focus-within:ring-primary">
                        <div className="flex items-center gap-1 bg-secondary-container text-primary px-3 py-1 rounded-full text-xs font-medium">
                          Grocery
                          <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-on-surface">close</span>
                        </div>
                        <div className="flex items-center gap-1 bg-secondary-container text-primary px-3 py-1 rounded-full text-xs font-medium">
                          Dairy
                          <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-on-surface">close</span>
                        </div>
                        <input type="text" placeholder="Type and enter..." className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] px-1 py-1" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Tax Rate (%) (Optional)</label>
                      <input type="text" placeholder="0.00" className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant" />
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    <h2 className="text-lg font-medium text-on-surface">Payment Info</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Payment Terms</label>
                      <div className="relative">
                        <select className="w-full px-4 py-2 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-on-surface-variant appearance-none">
                          <option>30 Days</option>
                          <option>15 Days</option>
                          <option>On Delivery</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Currency</label>
                      <div className="relative">
                        <select className="w-full px-4 py-2 bg-surface-container border border-outline-variant rounded-lg outline-none text-sm text-on-surface-variant appearance-none opacity-80" disabled>
                          <option>LKR</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant text-sm pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="text-lg font-medium text-on-surface">Documents</h2>
                  </div>

                  <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-8 bg-background flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-4xl text-outline mb-3">cloud_upload</span>
                    <p className="text-sm font-bold text-on-surface mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs text-outline-variant mb-4">Agreement, Catalog, etc.</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-outline font-bold tracking-wider uppercase">Max 5 Files</p>
                      <p className="text-[10px] text-outline font-bold tracking-wider uppercase">Max 10MB Each</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* Bottom Sticky Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant px-8 py-4 flex items-center justify-between z-10 shadow-lg">
          <span className="text-sm italic text-outline-variant">All fields marked with <span className="text-red-500">*</span> are mandatory.</span>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm font-bold text-on-surface-variant border border-outline rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Supplier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
