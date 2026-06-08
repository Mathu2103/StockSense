import React, { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

export default function SettingsProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
            <p className="text-[14px] text-slate-500 mt-1">Manage your personal details and public profile info.</p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e6f4ef] border border-[#0b8252]/20 text-[#0b8252] text-xs font-bold animate-pulse">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Changes saved successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Role</label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.role || 'INVENTORY_MANAGER'}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-[15px] rounded-xl px-4 py-3 cursor-not-allowed font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0b8252] hover:bg-[#096b43] text-white font-bold text-[14px] rounded-xl shadow-sm active:scale-[0.98] transition-all"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
