import React, { useState } from 'react';
import { Toggle } from './Toggle';
import { toast } from 'sonner';

export default function SettingsAccount() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-300 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure your login preferences, password, and system settings.</p>
        </div>
      </div>

      {/* Security Form */}
      <form onSubmit={handlePasswordChange} className="space-y-4 p-5 rounded-xl border border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#0b8252]">lock</span>
          Change Password
        </h3>


        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0b8252]">lock</span>
            Change Password
          </h3>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-[14px] text-red-600 font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-[15px] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-50 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0b8252] hover:bg-[#096b43] text-white font-bold text-[14px] rounded-xl shadow-sm active:scale-[0.98] transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
