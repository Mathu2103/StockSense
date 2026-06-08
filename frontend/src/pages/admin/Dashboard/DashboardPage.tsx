import { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import AdminHeader from '../Shared/AdminHeader';
import { toast } from 'sonner';
import { authService, AuthUser } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import SettingsProfile from '../settings/SettingComponent/SettingsProfile';
import SettingsAccount from '../settings/SettingComponent/SettingsAccount';
import SettingsStockRules from '../settings/SettingComponent/SettingsStockRules';
import SettingsAlerts from '../settings/SettingComponent/SettingsAlerts';
import { StockRulesConfig } from '../settings/SettingComponent/types';

const DEFAULT_RULES: StockRulesConfig = {
  defaultReorderLevel: '50',
  minimumStockThreshold: '20',
  maximumStockLimit: 'No limit',
  stockUpdateMode: 'Real-time',
  allowNegativeStock: false,
  autoDeductStock: true,
  enableLowStockAlerts: true,
  enableOutOfStockAlerts: true,
  enableDeadStockAlerts: false,
  notifyInApp: true,
  notifyEmail: true,
  notifySMS: false,
};

export default function DashboardPage() {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'account' | 'rules' | 'alerts'>('profile');

  // Staff User State
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'CASHIER' | 'INVENTORY_MANAGER'>('CASHIER');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Configuration settings state
  const [rules, setRules] = useState<StockRulesConfig>(DEFAULT_RULES);

  // Load backend staff users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Load stock rules from local storage
  useEffect(() => {
    const stored = localStorage.getItem('stocksense_settings_config');
    if (stored) {
      try {
        setRules(JSON.parse(stored));
      } catch (e) {
        setRules(DEFAULT_RULES);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('stocksense_settings_config', JSON.stringify(rules));
    toast.success("Configuration settings saved successfully!");
  };

  const resetSettings = () => {
    setRules(DEFAULT_RULES);
    localStorage.setItem('stocksense_settings_config', JSON.stringify(DEFAULT_RULES));
    toast.success("Configuration settings reset to default.");
  };

  // Toggle user activation status
  const handleToggleStatus = async (id: string) => {
    try {
      await authService.toggleUserStatus(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  // Handle staff creation submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      toast.error('All fields are required.');
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSubmittingUser(true);
    try {
      const created = await authService.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setUsers((prev) => [created, ...prev]);
      toast.success('Staff member registered successfully!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setTimeout(() => {
        setShowAddUserModal(false);
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create user.';
      toast.error(msg);
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_right,_rgba(11,130,82,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f5f7fb_100%)] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Dashboard Welcome Banner */}
            <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,130,82,0.08),transparent_30%,rgba(15,118,110,0.03))]" />
              <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Admin Control Center</h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-600">
                    Welcome back, <strong className="text-emerald-700">{currentAdmin?.name || 'Administrator'}</strong>. Oversee store performance, manage team credentials, and configure global inventory system rules.
                  </p>
                </div>
                
                {/* View Selector Tabs */}
                <div className="flex bg-[#f1f5f9] p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto shrink-0 shadow-sm">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'overview'
                        ? 'bg-[#0b8252] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">monitoring</span>
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'users'
                        ? 'bg-[#0b8252] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Staff Directory
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      activeTab === 'settings'
                        ? 'bg-[#0b8252] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    System Settings
                  </button>
                </div>
              </div>
            </section>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Snapshot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-2xl">payments</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Sales Today</p>
                      <p className="text-2xl font-black text-slate-900">Rs. 248,392.50</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">+12.5% vs yesterday</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-2xl">point_of_sale</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">POS Registers</p>
                      <p className="text-2xl font-black text-slate-900">4 Active</p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">All terminals online</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-2xl">warning</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Stock Alerts</p>
                      <p className="text-2xl font-black text-amber-600">6 Items</p>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Below threshold rules</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-2xl">dns</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Supermarket Health</p>
                      <p className="text-2xl font-black text-slate-900">99.8%</p>
                      <span className="text-[10px] font-bold text-[#0b8252] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Perfect sync</span>
                    </div>
                  </div>
                </div>

                {/* Analytical Charts and Tickers */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sales Hourly Bar Chart */}
                  <div className="bg-white rounded-[1.75rem] border border-slate-200 p-6 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">Today's Sales Curve</h3>
                        <p className="text-xs text-slate-500">Hourly gross revenue tracking (LKR)</p>
                      </div>
                      <span className="text-xs font-bold text-[#0b8252] bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Live Counter</span>
                    </div>
                    <div className="h-[220px] flex items-end justify-between px-2 gap-4 border-b border-slate-100 pb-2 relative">
                      <div className="absolute top-[25%] w-full border-t border-dashed border-slate-100"></div>
                      <div className="absolute top-[50%] w-full border-t border-dashed border-slate-100"></div>
                      <div className="absolute top-[75%] w-full border-t border-dashed border-slate-100"></div>
                      
                      {[
                        { h: 30, t: "8 AM" },
                        { h: 55, t: "10 AM" },
                        { h: 45, t: "12 PM" },
                        { h: 80, t: "2 PM" },
                        { h: 95, t: "4 PM" },
                        { h: 70, t: "6 PM" },
                        { h: 40, t: "8 PM" },
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group cursor-pointer relative z-10">
                          <div className="w-full max-w-[44px] bg-gradient-to-t from-[#0b8252]/20 to-[#0b8252] rounded-t-lg transition-all group-hover:scale-y-[1.03]" style={{ height: `${bar.h}%` }}></div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1">{bar.t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Split Pie Chart */}
                  <div className="bg-white rounded-[1.75rem] border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Checkout Payments</h3>
                      <p className="text-xs text-slate-500">Split by customer tender</p>
                    </div>
                    <div className="flex flex-col items-center justify-center my-4">
                      {/* Conic Gradient Donut representation */}
                      <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner" style={{ background: 'conic-gradient(#0b8252 0% 55%, #f59e0b 55% 85%, #3b82f6 85% 100%)' }}>
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center flex-col shadow">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                          <span className="text-lg font-black text-slate-800">Rs. 248K</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-around text-xs font-bold text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0b8252]"></span> Card (55%)</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Cash (30%)</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Wallet (15%)</div>
                    </div>
                  </div>
                </div>

                {/* Cashier Counters & Recent Overrides */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Register counters */}
                  <div className="bg-white rounded-[1.75rem] border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Register Terminal Activity</h3>
                    <div className="space-y-4">
                      {[
                        { num: "01", user: "Dinuka Perera", sales: "Rs. 92,300.00", items: 450, status: "Active", col: "text-emerald-600 bg-emerald-50" },
                        { num: "02", user: "Shalini Silva", sales: "Rs. 78,500.00", items: 390, status: "Active", col: "text-emerald-600 bg-emerald-50" },
                        { num: "03", user: "Mahela Jay", sales: "Rs. 51,200.00", items: 250, status: "Active", col: "text-emerald-600 bg-emerald-50" },
                        { num: "04", user: "Nipun K", sales: "Rs. 26,392.50", items: 120, status: "Active", col: "text-emerald-600 bg-emerald-50" },
                      ].map((reg) => (
                        <div key={reg.num} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[#0b8252]">
                              #{reg.num}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{reg.user}</p>
                              <p className="text-xs text-slate-500">{reg.items} items processed</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{reg.sales}</p>
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${reg.col}`}>{reg.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Audit timeline */}
                  <div className="bg-white rounded-[1.75rem] border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Security & Override Audit</h3>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {[
                        { label: "Price Override Approved", desc: "Approved 10% discount on Jasmine Rice 5kg", user: "Admin (You)", time: "12 mins ago", icon: "verified_user", iconCol: "text-emerald-600 bg-emerald-50" },
                        { label: "Cash Drawer Drop", desc: "Register #01 drop of Rs. 50,000.00 confirmed", user: "Dinuka Perera", time: "1 hour ago", icon: "account_balance_wallet", iconCol: "text-blue-600 bg-blue-50" },
                        { label: "Negative Stock Sale", desc: "Sale allowed on out-of-stock Spring Water 24pk", user: "System Action", time: "2 hours ago", icon: "sync_problem", iconCol: "text-amber-600 bg-amber-50" },
                        { label: "Settings Updated", desc: "Alert notifications switched to Email + SMS", user: "Admin (You)", time: "Yesterday", icon: "settings", iconCol: "text-slate-600 bg-slate-100" },
                      ].map((evt, idx) => (
                        <div key={idx} className="relative flex gap-4 pl-6">
                          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                            evt.iconCol.includes("emerald") ? "bg-[#0b8252]" :
                            evt.iconCol.includes("blue") ? "bg-blue-500" :
                            evt.iconCol.includes("amber") ? "bg-amber-500" : "bg-slate-500"
                          }`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="font-bold text-sm text-slate-800">{evt.label}</h4>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">{evt.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{evt.desc}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">User: {evt.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STAFF DIRECTORY */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Registered Staff Directory</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage accounts and platform access permissions for supermarket staff.</p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#0b8252] hover:bg-[#096b43] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Register Staff Member
                  </button>
                </div>

                {/* Users List Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                          <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Toggle Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              Loading staff members...
                            </td>
                          </tr>
                        ) : users.length > 0 ? (
                          users.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase">
                                  {item.name.substring(0, 2)}
                                </div>
                                <span className="font-bold text-slate-800">{item.name}</span>
                              </td>
                              <td className="p-4 text-slate-600 font-medium">{item.email}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                  item.role === 'INVENTORY_MANAGER'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : 'bg-teal-50 text-teal-700 border border-teal-100'
                                }`}>
                                  {item.role === 'INVENTORY_MANAGER' ? 'Manager' : 'Cashier'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                  item.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-[#10b981]' : 'bg-red-500'}`} />
                                  {item.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleToggleStatus(item.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    item.isActive
                                      ? 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50/50 hover:border-rose-100'
                                      : 'bg-[#0b8252] border-[#0b8252] text-white hover:bg-[#096b43]'
                                  }`}
                                >
                                  {item.isActive ? 'Suspend' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              No staff members registered yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONFIGURATION SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Secondary segmented control for settings tabs */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden min-h-[600px]">
                  
                  {/* Left Settings Navigation Pane */}
                  <div className="w-64 border-r border-slate-200 p-4 flex flex-col gap-1 overflow-y-auto bg-white shrink-0">
                    <button
                      onClick={() => setSettingsSubTab('profile')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                        settingsSubTab === 'profile'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      My Profile
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('account')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                        settingsSubTab === 'account'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">security</span>
                      Account Security
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('rules')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                        settingsSubTab === 'rules'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">rule</span>
                      Stock Rules
                    </button>
                    <button
                      onClick={() => setSettingsSubTab('alerts')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                        settingsSubTab === 'alerts'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">notifications</span>
                      System Alerts
                    </button>
                  </div>

                  {/* Right Sub-Tab Renderer */}
                  <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    <div className="p-8 flex-1 overflow-y-auto bg-slate-50/30">
                      
                      {settingsSubTab === 'profile' && <SettingsProfile />}
                      {settingsSubTab === 'account' && <SettingsAccount />}
                      {settingsSubTab === 'rules' && (
                        <SettingsStockRules rules={rules} onChange={(updated) => setRules(updated)} />
                      )}
                      {settingsSubTab === 'alerts' && (
                        <SettingsAlerts rules={rules} onChange={(updated) => setRules(updated)} />
                      )}

                    </div>

                    {/* Settings Form Footers */}
                    {(settingsSubTab === 'rules' || settingsSubTab === 'alerts') && (
                      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                        <p className="text-xs text-slate-500 italic">Unsaved settings adjustments will be lost.</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={resetSettings}
                            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-50"
                          >
                            Reset Defaults
                          </button>
                          <button
                            onClick={saveSettings}
                            className="px-5 py-2 bg-[#0b8252] text-white font-bold text-xs rounded-lg shadow-sm hover:bg-[#096b43]"
                          >
                            Save Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODAL: ADD STAFF MEMBER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">person_add</span>
                Register Staff Account
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8f9fa] border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:border-[#0b8252]"
                  placeholder="e.g. Shalini Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8f9fa] border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:border-[#0b8252]"
                  placeholder="e.g. shalini@stocksense.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8f9fa] border border-slate-200 text-slate-800 text-sm rounded-lg focus:outline-none focus:border-[#0b8252]"
                  placeholder="•••••••• (Min 6 chars)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Role</label>
                <div className="relative">
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full appearance-none bg-[#f8f9fa] border border-slate-200 text-slate-800 text-sm rounded-lg px-3.5 py-2 focus:outline-none focus:border-[#0b8252] cursor-pointer"
                  >
                    <option value="CASHIER">Cashier (POS Checkout only)</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager (Catalog & Procurement)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 bg-[#0b8252] hover:bg-[#096b43] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {submittingUser ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
