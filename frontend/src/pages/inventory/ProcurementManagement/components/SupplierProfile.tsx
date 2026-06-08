import { Supplier } from '../constants/supplierConstants';

interface SupplierProfileProps {
  supplier: Supplier;
  profileData: {
    purchasesCount: number;
    totalPurchaseValueFormatted: string;
    lastPurchase: string;
    averageOrderValueFormatted: string;
    frequency: string;
  };
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export default function SupplierProfile({
  supplier,
  profileData,
  onEditClick,
  onDeleteClick,
}: SupplierProfileProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Card Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-primary font-bold">store</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-on-surface">{supplier.name}</h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  supplier.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {supplier.status}
              </span>
            </div>

            {/* Legal Company details */}
            <p className="text-xs font-bold text-slate-500 mt-1">
              {supplier.companyName}
            </p>

            {/* Contact information details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">person</span> {supplier.contact} {supplier.contactPhone ? `(${supplier.contactPhone})` : ''}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">call</span> {supplier.phone}
              </span>
              {supplier.email && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">mail</span> {supplier.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span> {supplier.street}, {supplier.city}, {supplier.province}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEditClick}
            className="px-4 py-2 border border-outline-variant hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-xs">edit</span>
            Edit Profile
          </button>
          <button
            onClick={onDeleteClick}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
            Delete Supplier
          </button>
        </div>
      </div>

      {/* 2. Dynamic Statistics Grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Total Purchases</span>
          <div className="text-3xl font-black text-slate-800">{profileData.purchasesCount} orders</div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Non-cancelled consignments</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Total Purchase Value</span>
          <div className="text-3xl font-black text-primary">{profileData.totalPurchaseValueFormatted}</div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Cumulative procurement cost</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Products Supplied</span>
          <div className="text-3xl font-black text-slate-800">{supplier.products} products</div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Registered grocery lines</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Last Purchase Date</span>
          <div className="text-3xl font-black text-amber-600">{profileData.lastPurchase}</div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Last transaction received</p>
        </div>
      </div>
    </div>
  );
}
