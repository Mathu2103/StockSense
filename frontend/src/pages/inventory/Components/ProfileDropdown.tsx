import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface ProfileDropdownProps {
  activeDropdown: string | null;
  setActiveDropdown: (name: string | null) => void;
}

const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    ADMIN: 'Administrator',
    INVENTORY_MANAGER: 'Inventory Manager',
    CASHIER: 'Cashier',
  };
  return roleMap[role] || role;
};

export default function ProfileDropdown({ activeDropdown, setActiveDropdown }: ProfileDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isOpen = activeDropdown === 'profile';

  const toggle = () => setActiveDropdown(isOpen ? null : 'profile');
  const close = () => setActiveDropdown(null);

  const userName = user?.name || 'User';
  const userRole = user?.role ? formatRole(user.role) : 'Team Member';
  const userEmail = user?.email || '';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0b8252&color=fff&bold=true&size=128`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className={`
          flex items-center gap-2.5 px-2 py-1.5 rounded-xl
          cursor-pointer group transition-all duration-200
          hover:bg-slate-50 active:scale-[0.97]
          ${isOpen ? 'bg-slate-50 shadow-sm' : ''}
        `}
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <div className="text-right hidden md:block">
          <p className="text-[13px] font-bold leading-tight text-slate-800 group-hover:text-[#0b8252] transition-colors">{userName}</p>
          <p className="text-[10.5px] font-medium text-slate-500">{userRole}</p>
        </div>
        <div className="relative">
          <img src={avatarUrl} alt={userName} className="w-9 h-9 rounded-full border-2 border-[#34d399] object-cover shadow-sm" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <span className={`material-symbols-outlined text-[15px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[3.2rem] z-50 w-[17.5rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-white border-b border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <img src={avatarUrl} alt={userName} className="w-14 h-14 rounded-full border-[3px] border-[#34d399] shadow-lg" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-[2.5px] border-white rounded-full" />
              </div>
              <p className="text-[15px] font-bold text-slate-800">{userName}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">{userEmail}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {userRole}
              </span>
            </div>
          </div>

          {/* Menu */}
          <div className="py-1.5 px-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => { close(); navigate('/settings?tab=My Profile'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#0b8252] transition-colors">person</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">My Profile</p>
                <p className="text-[10.5px] text-slate-400">View and edit your details</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { close(); navigate('/settings?tab=Account Settings'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#0b8252] transition-colors">settings</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">Account Settings</p>
                <p className="text-[10.5px] text-slate-400">Preferences & security</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { close(); navigate('/reports'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-[#f0fdf4] hover:text-[#0b8252] transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#0b8252] transition-colors">help</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">Help & Support</p>
                <p className="text-[10.5px] text-slate-400">Documentation & guides</p>
              </div>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => { close(); logout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-red-400 group-hover:text-red-600 transition-colors">logout</span>
              </div>
              <div className="text-left">
                <p className="text-[12.5px] font-semibold">Logout</p>
                <p className="text-[10.5px] text-red-300 group-hover:text-red-400">End your session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
