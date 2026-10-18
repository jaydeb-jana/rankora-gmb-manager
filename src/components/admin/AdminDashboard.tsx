import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Settings,
  Search,
  UserCheck,
  UserX,
  LogIn,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Crown,
  CheckCircle2,
  X,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { CustomerUser, PricingPlan } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AdminDashboardProps {
  onUserImpersonated?: () => void;
}

export function AdminDashboard({ onUserImpersonated }: AdminDashboardProps = {}) {
  const { user, impersonateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'plans' | 'system'>('users');
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  // Filters & Search for Users
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<CustomerUser | null>(null);

  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState<boolean>(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Form states for Add/Edit User
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    businessName: '',
    password: '',
    planId: 'pro-plan',
    status: 'active' as 'active' | 'suspended',
  });

  // Form states for Add/Edit Plan
  const [planFormData, setPlanFormData] = useState<PricingPlan>({
    id: '',
    name: '',
    tagline: '',
    monthlyPrice: 999,
    yearlyPrice: 799,
    currency: '₹',
    isPopular: false,
    isActive: true,
    order: 1,
    whatsAppText: '',
    features: [],
  });
  const [newFeatureInput, setNewFeatureInput] = useState<string>('');

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAllUsers();
      setUsers(res.users);
    } catch {
      showError('Failed to load user records.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.getPricingPlans();
      setPlans(res);
    } catch {
      showError('Failed to load pricing plans.');
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPlans();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.businessName && u.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.mobileNumber && u.mobileNumber.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? (u.status || 'active') === 'active'
        : u.status === 'suspended';

    return matchesSearch && matchesStatus;
  });

  // User Actions
  const handleToggleSuspend = async (targetUser: CustomerUser) => {
    if (targetUser.id === 'admin_arventa_super') {
      showError('Super Administrator account cannot be suspended.');
      return;
    }
    const res = await api.toggleSuspendUser(targetUser.id);
    if (res.success && res.status) {
      showSuccess(`User ${targetUser.fullName} is now ${res.status}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: res.status } : u))
      );
    } else {
      showError(res.error || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const res = await api.deleteUser(deletingUser.id);
    if (res.success) {
      showSuccess(`User ${deletingUser.fullName} deleted permanently.`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } else {
      showError(res.error || 'Failed to delete user.');
    }
  };

  const handleImpersonate = async (targetUser: CustomerUser) => {
    try {
      await impersonateUser(targetUser);
      showSuccess(`Logged in as ${targetUser.fullName} (${targetUser.businessName || 'Business'}).`);
      if (onUserImpersonated) onUserImpersonated();
    } catch {
      showError('Failed to enter user account.');
    }
  };


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName || !userFormData.email) {
      showError('Please provide full name and email.');
      return;
    }

    const res = await api.createUser({
      fullName: userFormData.fullName.trim(),
      email: userFormData.email.trim().toLowerCase(),
      mobileNumber: userFormData.mobileNumber.trim(),
      businessName: userFormData.businessName.trim() || `${userFormData.fullName}'s Business`,
      password: userFormData.password || 'password123',
      planId: userFormData.planId,
    });

    if (res.success) {
      showSuccess(`User ${userFormData.fullName} created successfully.`);
      setIsAddUserModalOpen(false);
      setUserFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        businessName: '',
        password: '',
        planId: 'pro-plan',
        status: 'active',
      });
      loadUsers();
    } else {
      showError(res.error || 'Failed to create user.');
    }
  };

  // Plan Actions
  const handleOpenEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanFormData({ ...plan });
  };

  const handleOpenAddPlan = () => {
    const newId = 'plan-' + Math.random().toString(36).substring(2, 8);
    setPlanFormData({
      id: newId,
      name: '',
      tagline: '',
      monthlyPrice: 1499,
      yearlyPrice: 1199,
      currency: '₹',
      isPopular: false,
      isActive: true,
      order: plans.length + 1,
      whatsAppText: 'Hello Arventa Ventures, I would like to activate this plan.',
      features: ['Verified Google Location Tracking', 'Custom QR Stands'],
    });
    setIsAddPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.name.trim()) {
      showError('Please enter a plan name.');
      return;
    }

    const res = await api.savePricingPlan(planFormData);
    if (res.success) {
      showSuccess(`Plan "${planFormData.name}" saved successfully.`);
      setPlans(res.plans);
      setEditingPlan(null);
      setIsAddPlanModalOpen(false);
    } else {
      showError('Failed to save plan.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const res = await api.deletePricingPlan(planId);
    if (res.success) {
      showSuccess('Plan deleted successfully.');
      setPlans(res.plans);
      setDeletingPlanId(null);
    } else {
      showError('Failed to delete plan.');
    }
  };

  const handleResetPlans = async () => {
    if (!window.confirm('Reset all pricing plans to default Pro and Ultra templates?')) return;
    const res = await api.resetPricingPlans();
    if (res.success) {
      showSuccess('Pricing plans reset to default.');
      setPlans(res.plans);
    }
  };

  const handleAddFeatureToPlan = () => {
    if (!newFeatureInput.trim()) return;
    setPlanFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureInput.trim()],
    }));
    setNewFeatureInput('');
  };

  const handleRemoveFeatureFromPlan = (index: number) => {
    setPlanFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // KPIs
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => (u.status || 'active') === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-[#1a73e8] via-[#174ea6] to-[#0d3c61] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <ShieldCheck className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
              <Crown className="w-3.5 h-3.5 text-[#fbbc04]" />
              <span>SUPER ADMINISTRATOR CONTROL CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Arventa Ventures Admin Suite
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Full system control over users, subscription plans, suspensions, account impersonation, and Google Business Profile automation settings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await Promise.all([loadUsers(), loadPlans()]);
                showSuccess('All user records and plans synchronized.');
              }}
              title="Refresh Data"
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/20 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Metrics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f6368] block">Total Registered Users</span>
            <span className="text-2xl font-extrabold text-[#202124]">{totalUsersCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f6368] block">Active User Accounts</span>
            <span className="text-2xl font-extrabold text-[#137333]">{activeUsersCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fce8e6] text-[#c5221f] flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f6368] block">Suspended Accounts</span>
            <span className="text-2xl font-extrabold text-[#c5221f]">{suspendedUsersCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#5f6368] block">Active Pricing Plans</span>
            <span className="text-2xl font-extrabold text-[#b06000]">{plans.length}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Admin Navigation Tabs */}
      <div className="bg-white border border-[#dadce0] rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#dadce0] bg-[#f8f9fa] overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'border-[#1a73e8] text-[#1a73e8] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({totalUsersCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('plans')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'plans'
                ? 'border-[#1a73e8] text-[#1a73e8] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pricing &amp; Subscription Plans ({plans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('system')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'system'
                ? 'border-[#1a73e8] text-[#1a73e8] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Credentials &amp; Controls</span>
          </button>
        </div>

        {/* ---------------- TAB 1: USERS MANAGEMENT ---------------- */}
        {activeAdminTab === 'users' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Search, Filter & Add Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-[#5f6368] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, business..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-xs text-[#202124] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center p-1 bg-[#f1f3f4] rounded-xl border border-[#dadce0]">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white text-[#202124] shadow-xs'
                        : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    All ({totalUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === 'active'
                        ? 'bg-white text-[#137333] shadow-xs'
                        : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    Active ({activeUsersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('suspended')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === 'suspended'
                        ? 'bg-white text-[#c5221f] shadow-xs'
                        : 'text-[#5f6368] hover:text-[#202124]'
                    }`}
                  >
                    Suspended ({suspendedUsersCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserFormData({
                      fullName: '',
                      email: '',
                      mobileNumber: '',
                      businessName: '',
                      password: '',
                      planId: 'pro-plan',
                      status: 'active',
                    });
                    setIsAddUserModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-[#dadce0] rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8f9fa] border-b border-[#dadce0] text-[#5f6368] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User Details</th>
                      <th className="py-3 px-4">Business &amp; Profile</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dadce0]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#5f6368]">
                          <div className="max-w-sm mx-auto space-y-2">
                            <Users className="w-8 h-8 mx-auto text-[#dadce0]" />
                            <p className="text-sm font-bold text-[#202124]">
                              {searchQuery || statusFilter !== 'all'
                                ? 'No user records match your search filter.'
                                : 'No customer accounts registered yet.'}
                            </p>
                            <p className="text-xs text-[#5f6368] leading-relaxed">
                              {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search terms or filter.'
                                : 'All fake demo data has been purged. When real customers register via the sign-up form or when you click "+ Add New User", their live profiles will appear here.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSuperAdmin = u.id === 'admin_arventa_super' || u.role === 'admin';
                        const isSuspended = u.status === 'suspended';

                        return (
                          <tr
                            key={u.id}
                            className={`hover:bg-[#f8f9fa] transition-colors ${
                              isSuspended ? 'bg-[#fce8e6]/20' : ''
                            }`}
                          >
                            {/* User details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                    isSuperAdmin
                                      ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
                                      : isSuspended
                                      ? 'bg-[#fce8e6] text-[#c5221f]'
                                      : 'bg-[#f1f3f4] text-[#3c4043]'
                                  }`}
                                >
                                  {u.fullName.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-[#202124] flex items-center gap-1.5 truncate">
                                    <span>{u.fullName}</span>
                                    {isSuperAdmin && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#5f6368] truncate flex items-center gap-1">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span>{u.email}</span>
                                  </div>
                                  {u.mobileNumber && (
                                    <div className="text-[11px] text-[#5f6368] truncate flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 shrink-0" />
                                      <span>{u.mobileNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Business */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#202124] flex items-center gap-1.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
                                <span>{u.businessName || 'Business Name Pending'}</span>
                              </div>
                              <span className="text-[10px] text-[#5f6368] block mt-0.5">
                                Joined {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            {/* Plan */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  u.planId === 'ultra-plan'
                                    ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
                                    : 'bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]'
                                }`}
                              >
                                {u.planId === 'ultra-plan' ? (
                                  <Crown className="w-3 h-3 text-[#f9ab00]" />
                                ) : (
                                  <Zap className="w-3 h-3 text-[#1a73e8]" />
                                )}
                                <span>{u.planId === 'ultra-plan' ? 'Ultra Plan' : 'Pro Plan'}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isSuspended
                                    ? 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]'
                                    : 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                                }`}
                              >
                                {isSuspended ? (
                                  <UserX className="w-3 h-3" />
                                ) : (
                                  <UserCheck className="w-3 h-3" />
                                )}
                                <span className="capitalize">{u.status || 'active'}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Impersonate / Login as User */}
                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleImpersonate(u)}
                                    title="Login as this User"
                                    className="px-2.5 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Login As</span>
                                  </button>
                                )}


                                {/* Toggle Suspend */}
                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSuspend(u)}
                                    title={isSuspended ? 'Activate User' : 'Suspend User'}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isSuspended
                                        ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] hover:bg-[#ceead6]'
                                        : 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf] hover:bg-[#fad2cf]'
                                    }`}
                                  >
                                    {isSuspended ? (
                                      <UserCheck className="w-3.5 h-3.5" />
                                    ) : (
                                      <UserX className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}

                                {/* Delete User */}
                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingUser(u)}
                                    title="Delete User Permanently"
                                    className="p-1.5 bg-white hover:bg-[#fce8e6] border border-[#dadce0] hover:border-[#fad2cf] text-[#5f6368] hover:text-[#c5221f] rounded-lg transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: PRICING PLANS MANAGEMENT ---------------- */}
        {activeAdminTab === 'plans' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#202124]">
                  Edit Subscription Plans &amp; Pricing
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Update plan prices, feature checkmarks, and WhatsApp order messages. Changes apply instantly to customer view.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPlans}
                  className="px-3.5 py-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#3c4043] rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddPlan}
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Plan</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all shadow-xs ${
                    p.isPopular
                      ? 'border-[#1a73e8] ring-2 ring-[#1a73e8]/20'
                      : 'border-[#dadce0]'
                  }`}
                >
                  {p.isPopular && (
                    <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#1a73e8] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#fbbc04]" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-lg text-[#202124]">{p.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368]">
                        Order #{p.order}
                      </span>
                    </div>

                    <p className="text-xs text-[#5f6368] min-h-[32px]">{p.tagline}</p>

                    {/* Pricing */}
                    <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#dadce0]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-[#202124]">
                          {p.currency}
                          {p.yearlyPrice}
                        </span>
                        <span className="text-xs text-[#5f6368]">/mo (Yearly)</span>
                      </div>
                      <div className="text-[11px] text-[#5f6368] mt-0.5">
                        Monthly billing: {p.currency}
                        {p.monthlyPrice} / month
                      </div>
                    </div>

                    {/* Feature list preview */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-[#202124] block uppercase tracking-wider">
                        Features ({p.features.length})
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#3c4043]">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-[#dadce0] mt-6 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(p)}
                      className="flex-1 py-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Plan</span>
                    </button>

                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-2 bg-white hover:bg-[#fce8e6] border border-[#dadce0] text-[#5f6368] hover:text-[#c5221f] rounded-xl transition-all cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: SYSTEM CONTROLS ---------------- */}
        {activeAdminTab === 'system' && (
          <div className="p-5 sm:p-6 space-y-6 max-w-3xl">
            <div>
              <h3 className="font-bold text-base text-[#202124]">
                Master Administrator Credentials &amp; Controls
              </h3>
              <p className="text-xs text-[#5f6368] mt-0.5">
                Protected system credentials and platform configuration for Arventa Ventures.
              </p>
            </div>

            <div className="p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-4">
              <span className="text-xs font-bold text-[#202124] block uppercase tracking-wider">
                Configured Super Admin Access
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#5f6368] block">Login Email ID:</span>
                  <span className="font-mono font-bold text-[#202124] text-sm">
                    info@arventaventures.online
                  </span>
                </div>
                <div>
                  <span className="text-[#5f6368] block">Administrator Password:</span>
                  <span className="font-mono font-bold text-[#202124] text-sm">
                    Jaydeb@123
                  </span>
                </div>
                <div>
                  <span className="text-[#5f6368] block">Administrator Name:</span>
                  <span className="font-bold text-[#202124]">Jaydeb Jana (Super Admin)</span>
                </div>
                <div>
                  <span className="text-[#5f6368] block">WhatsApp / Helpline:</span>
                  <span className="font-bold text-[#137333]">+91 7872490719</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#dadce0] rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1a73e8]" />
                <h4 className="font-bold text-sm text-[#202124]">
                  Autonomous Client-Side &amp; Supabase RLS
                </h4>
              </div>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                RANKORA operates 100% client-side with direct Supabase connections. No server-side Node.js or Express daemon required. Super Admin session provides root-level access to browse, modify, and delete customer stores while retaining pure static hosting compatibility.
              </p>
            </div>
          </div>
        )}
      </div>



      {/* ---------------- MODAL: ADD USER ---------------- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dadce0] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#202124]">Add New Customer Account</h3>
                  <p className="text-[11px] text-[#5f6368]">
                    Directly provision a verified customer store on the platform.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-[#5f6368] hover:text-[#202124]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#202124] block mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Joydeb Ghosh"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#202124] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. store@example.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#202124] block mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={userFormData.mobileNumber}
                  onChange={(e) => setUserFormData({ ...userFormData, mobileNumber: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#202124] block mb-1">Business Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Sweets & Bakery"
                  value={userFormData.businessName}
                  onChange={(e) => setUserFormData({ ...userFormData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#202124] block mb-1">Initial Password</label>
                  <input
                    type="password"
                    placeholder="Defaults to password123"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">Plan</label>
                  <select
                    value={userFormData.planId}
                    onChange={(e) => setUserFormData({ ...userFormData, planId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#dadce0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-[#dadce0] text-[#3c4043] rounded-xl hover:bg-[#f1f3f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-bold shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: DELETE CONFIRM USER ---------------- */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dadce0] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#fce8e6] text-[#c5221f] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#202124]">Delete User Permanently?</h3>
              <p className="text-xs text-[#5f6368] mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingUser.fullName}</strong> ({deletingUser.email}) and all associated business settings, QR stands, and review replies? This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-[#dadce0] text-[#3c4043] rounded-xl text-xs font-semibold hover:bg-[#f1f3f4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-[#c5221f] hover:bg-[#a51d24] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT PLAN ---------------- */}
      {(editingPlan || isAddPlanModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dadce0] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#dadce0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#202124]">
                    {editingPlan ? `Edit ${editingPlan.name}` : 'Create New Pricing Plan'}
                  </h3>
                  <p className="text-[11px] text-[#5f6368]">
                    Configure pricing, features, and WhatsApp activation text.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsAddPlanModalOpen(false);
                }}
                className="text-[#5f6368] hover:text-[#202124]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="font-bold text-[#202124] block mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#202124] block mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={planFormData.tagline}
                  onChange={(e) => setPlanFormData({ ...planFormData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#202124] block mb-1">Monthly (₹)</label>
                  <input
                    type="number"
                    required
                    value={planFormData.monthlyPrice}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, monthlyPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#202124] block mb-1">Yearly / Mo (₹)</label>
                  <input
                    type="number"
                    required
                    value={planFormData.yearlyPrice}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, yearlyPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#202124] block mb-1">Currency</label>
                  <input
                    type="text"
                    value={planFormData.currency}
                    onChange={(e) => setPlanFormData({ ...planFormData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planFormData.isPopular}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#1a73e8]"
                  />
                  <span className="font-semibold text-[#202124]">Highlight as "Most Popular"</span>
                </label>
              </div>

              {/* Dynamic Features List */}
              <div className="space-y-2 pt-2 border-t border-[#dadce0]">
                <label className="font-bold text-[#202124] block">Features Included</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    placeholder="Add feature item..."
                    className="flex-1 px-3 py-1.5 border border-[#dadce0] rounded-xl text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeatureToPlan}
                    className="px-3 py-1.5 bg-[#f1f3f4] hover:bg-[#dadce0] text-[#202124] rounded-xl text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
                  {planFormData.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded-lg border border-[#dadce0] gap-2"
                    >
                      <span className="text-xs text-[#3c4043] truncate">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureFromPlan(idx)}
                        className="text-[#5f6368] hover:text-[#c5221f] shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#dadce0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsAddPlanModalOpen(false);
                  }}
                  className="px-4 py-2 border border-[#dadce0] text-[#3c4043] rounded-xl hover:bg-[#f1f3f4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-bold shadow-xs"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
