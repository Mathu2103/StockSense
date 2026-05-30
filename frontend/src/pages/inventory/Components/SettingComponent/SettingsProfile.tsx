import React, { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

export default function SettingsProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [avatar, setAvatar] = useState(`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0b8252&color=fff&bold=true&size=128`);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your personal details and public profile info.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold animate-pulse">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Changes saved successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload Preview */}
        <div className="flex items-center gap-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <img
            src={avatar}
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800">Profile Picture</h4>
            <p className="text-xs text-slate-500 mt-0.5">Avatar is automatically generated from your name.</p>
            <button
              type="button"
              className="mt-2.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              onClick={() => {
                const names = ['John Doe', 'Alice Smith', 'Bob Johnson', 'Emily Brown'];
                const randomName = names[Math.floor(Math.random() * names.length)];
                setFullName(randomName);
                setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=0b8252&color=fff&bold=true&size=128`);
              }}
            >
              Generate New Avatar
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Role</label>
            <div className="relative">
              <input
                type="text"
                value={user?.role || 'INVENTORY_MANAGER'}
                disabled
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed font-medium"
              />
              <span className="absolute right-3 top-2 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-[#0b8252] to-[#0a7048] hover:from-[#096b43] hover:to-[#085e3a] text-white font-bold text-sm rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
}
