import React, { useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import AdminHeader from '../Shared/AdminHeader';
import { authService, AuthUser } from '../../../services/authService';
import { toast } from 'sonner';

export default function AccountManagement() {
  // State
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CASHIER' | 'INVENTORY_MANAGER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  
  // New User Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'CASHIER' as 'CASHIER' | 'INVENTORY_MANAGER',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit User Form
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CASHIER' as 'CASHIER' | 'INVENTORY_MANAGER',
    isActive: true
  });

  // Password Reset Modal
  const [passwordResetUser, setPasswordResetUser] = useState<AuthUser | null>(null);

  // Load Users (We load backend users and map additional mock fields like phone/username for UI demonstration if needed, but the backend handles name, email, role)
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await authService.toggleUserStatus(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      console.error('Failed to toggle user status', err);
      toast.error('Failed to toggle user status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password || !formData.role) {
      toast.error('Name, Username, Password, and Role are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await authService.createUser({
        name: formData.name,
        email: `${formData.username}@stocksense.com`, // Auto-generated for backend requirements
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
      });
      // Optionally handle initial status if API allows setting isActive on creation
      setUsers((prev) => [created, ...prev]);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', username: '', password: '', confirmPassword: '', role: 'CASHIER', status: 'ACTIVE' });
      toast.success('Account created successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create user account.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: AuthUser) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      phone: user.phone || '',
      email: user.email,
      role: user.role as 'CASHIER' | 'INVENTORY_MANAGER',
      isActive: user.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const updated = await authService.updateUser(editingUser.id, editFormData);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setShowEditModal(false);
      toast.success('Account updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!passwordResetUser) return;
    try {
      const res = await authService.resetPassword(passwordResetUser.id);
      if (res.emailSent) {
        toast.success(`Password reset successful! An email has been sent to ${passwordResetUser.email}.`, { duration: 5000 });
      } else {
        toast.success(`Password reset successful! (SMTP not configured, so email skipped). New password is: ${res.newPassword}`, { duration: 10000 });
      }
      setPasswordResetUser(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password.');
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const isActive = user.isActive !== false; // Assuming undefined means active
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'ACTIVE' && isActive) || 
                          (statusFilter === 'INACTIVE' && !isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Summary Metrics
  const totalEmployees = users.length;
  const activeCashiers = users.filter(u => u.role === 'CASHIER' && u.isActive !== false).length;
  const activeManagers = users.filter(u => u.role === 'INVENTORY_MANAGER' && u.isActive !== false).length;
  const inactiveAccounts = users.filter(u => u.isActive === false).length;

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage employee accounts and control access to supermarket operations.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#0b8252] hover:bg-[#096b43] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Add Employee
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">group</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Employees</p>
                  <p className="text-2xl font-black text-slate-900">{totalEmployees}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Cashiers</p>
                  <p className="text-2xl font-black text-slate-900">{activeCashiers}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Managers</p>
                  <p className="text-2xl font-black text-slate-900">{activeManagers}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">person_off</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inactive Accounts</p>
                  <p className="text-2xl font-black text-slate-900">{inactiveAccounts}</p>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] transition-shadow"
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0b8252]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CASHIER">Cashiers</option>
                  <option value="INVENTORY_MANAGER">Inventory Managers</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0b8252]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-[#0b8252]">progress_activity</span>
                  <p className="font-medium">Loading employee accounts...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <span className="material-symbols-outlined text-[32px] text-slate-300">badge</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Employee Accounts Found</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Create employee accounts to start managing your supermarket operations. Adjust filters if you are looking for a specific user.</p>
                  {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                    <button 
                      onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}
                      className="mt-4 text-[#0b8252] font-bold text-sm hover:underline"
                    >
                      Clear Filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Added</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase shrink-0">
                                {user.name.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm group-hover:text-[#0b8252] transition-colors">{user.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user.id.substring(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-medium text-slate-700">{user.email}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{user.phone || 'No phone number'}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                              user.role === 'INVENTORY_MANAGER' 
                                ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                : 'bg-teal-50 text-teal-700 border-teal-100'
                            }`}>
                              {user.role === 'INVENTORY_MANAGER' ? 'Manager' : 'Cashier'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              user.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-[#0b8252]' : 'bg-rose-500'}`} />
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                title="Edit Account"
                                onClick={() => openEditModal(user)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button 
                                title={user.isActive !== false ? "Deactivate Account" : "Activate Account"}
                                onClick={() => handleToggleStatus(user.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  user.isActive !== false 
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {user.isActive !== false ? 'block' : 'check_circle'}
                                </span>
                              </button>
                              <button 
                                title="Reset Password"
                                onClick={() => setPasswordResetUser(user)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">key</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0b8252]/10 text-[#0b8252] flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add New Employee</h2>
                  <p className="text-xs text-slate-500">Create an account and assign roles</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-employee-form" onSubmit={handleCreateUser} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b8252]"></span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
                        placeholder="+94 77 XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b8252]"></span>
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
                        placeholder="johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Temporary Password <span className="text-rose-500">*</span></label>
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password <span className="text-rose-500">*</span></label>
                      <input 
                        type="password" 
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252]"
                        placeholder="Confirm temporary password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0b8252] focus:ring-1 focus:ring-[#0b8252] cursor-pointer"
                      >
                        <option value="ACTIVE">Active (Can Login)</option>
                        <option value="INACTIVE">Inactive (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Role & Permissions */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0b8252]"></span>
                      Assigned Role
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setShowPermissions(!showPermissions)}
                      className="text-xs font-bold text-[#0b8252] hover:underline"
                    >
                      {showPermissions ? 'Hide Permissions' : 'View Permissions Guide'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                      formData.role === 'CASHIER' 
                        ? 'border-[#0b8252] bg-[#0b8252]/5' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="CASHIER" 
                        checked={formData.role === 'CASHIER'}
                        onChange={() => setFormData({...formData, role: 'CASHIER'})}
                        className="sr-only" 
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">point_of_sale</span>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.role === 'CASHIER' ? 'border-[#0b8252] bg-[#0b8252]' : 'border-slate-300'
                        }`}>
                          {formData.role === 'CASHIER' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">Cashier</h4>
                      <p className="text-xs text-slate-500 mt-1">Point of Sale operations and checkout handling.</p>
                    </label>

                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                      formData.role === 'INVENTORY_MANAGER' 
                        ? 'border-[#0b8252] bg-[#0b8252]/5' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="INVENTORY_MANAGER" 
                        checked={formData.role === 'INVENTORY_MANAGER'}
                        onChange={() => setFormData({...formData, role: 'INVENTORY_MANAGER'})}
                        className="sr-only" 
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.role === 'INVENTORY_MANAGER' ? 'border-[#0b8252] bg-[#0b8252]' : 'border-slate-300'
                        }`}>
                          {formData.role === 'INVENTORY_MANAGER' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">Inventory Manager</h4>
                      <p className="text-xs text-slate-500 mt-1">Full access to stock, procurement, and reports.</p>
                    </label>
                  </div>

                  {/* Visual Permissions Section */}
                  {showPermissions && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            Cashier Access
                          </h5>
                          <ul className="space-y-1.5 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> POS Billing</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Orders History</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Billing Discounts</li>
                            <li className="flex items-center gap-2 text-slate-400"><span className="material-symbols-outlined text-[16px]">cancel</span> Inventory Management</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Manager Access
                          </h5>
                          <ul className="space-y-1.5 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Products & Categories</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Suppliers & Procurement</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Inventory Adjustments</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#0b8252]">check_circle</span> Stock Monitoring & Reports</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-employee-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0b8252] text-white hover:bg-[#096b43] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit Employee</h2>
                  <p className="text-xs text-slate-500">Update account details and role</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-employee-form" onSubmit={handleUpdateUser} className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Personal & Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (Username) <span className="text-rose-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Status</label>
                      <select 
                        value={editFormData.isActive ? 'ACTIVE' : 'INACTIVE'}
                        onChange={(e) => setEditFormData({...editFormData, isActive: e.target.value === 'ACTIVE'})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                      >
                        <option value="ACTIVE">Active (Can Login)</option>
                        <option value="INACTIVE">Inactive (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    Assigned Role
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                      editFormData.role === 'CASHIER' 
                        ? 'border-blue-600 bg-blue-50/50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="editRole" 
                        value="CASHIER" 
                        checked={editFormData.role === 'CASHIER'}
                        onChange={() => setEditFormData({...editFormData, role: 'CASHIER'})}
                        className="sr-only" 
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">point_of_sale</span>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          editFormData.role === 'CASHIER' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {editFormData.role === 'CASHIER' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">Cashier</h4>
                    </label>

                    <label className={`relative flex flex-col p-4 cursor-pointer rounded-2xl border-2 transition-all ${
                      editFormData.role === 'INVENTORY_MANAGER' 
                        ? 'border-blue-600 bg-blue-50/50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="editRole" 
                        value="INVENTORY_MANAGER" 
                        checked={editFormData.role === 'INVENTORY_MANAGER'}
                        onChange={() => setEditFormData({...editFormData, role: 'INVENTORY_MANAGER'})}
                        className="sr-only" 
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          editFormData.role === 'INVENTORY_MANAGER' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                        }`}>
                          {editFormData.role === 'INVENTORY_MANAGER' && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">Inventory Manager</h4>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-employee-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {submitting ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border border-slate-200 transform transition-all scale-100">
            <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
              <span className="material-symbols-outlined text-[32px]">lock_reset</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Reset Password?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to reset the password for <strong className="text-slate-700">{passwordResetUser.name}</strong>? 
              A new randomly generated password will be sent to their email ({passwordResetUser.email}) and updated in the database.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setPasswordResetUser(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
