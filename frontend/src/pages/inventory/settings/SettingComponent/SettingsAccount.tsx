import React, { useState } from 'react';
import { Toggle } from './Toggle';

export default function SettingsAccount() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setError('');
    setSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl animate-in fade-in duration-300 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure your login preferences, password, and system settings.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold animate-pulse">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Settings updated successfully!
          </span>
        )}
      </div>

      {/* Security Form */}
      <form onSubmit={handlePasswordChange} className="space-y-4 p-5 rounded-xl border border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#0b8252]">lock</span>
          Change Password
        </h3>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0b8252]/20 focus:border-[#0b8252] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-[#0b8252] to-[#0a7048] hover:from-[#096b43] hover:to-[#085e3a] text-white font-bold text-sm rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Preferences Section */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#0b8252]">settings_suggest</span>
          Notification Preferences
        </h3>

        <div className="space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-[13px] font-bold text-slate-800">Email Alerts</h4>
              <p className="text-xs text-slate-500 mt-0.5">Receive daily notifications for low stock alerts</p>
            </div>
            <Toggle active={true} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-[13px] font-bold text-slate-800">Browser Push Notifications</h4>
              <p className="text-xs text-slate-500 mt-0.5">Enable real-time inventory change notifications</p>
            </div>
            <Toggle active={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
