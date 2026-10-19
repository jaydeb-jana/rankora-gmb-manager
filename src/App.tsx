import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoadingScreen, TopProgressBar } from './components/common/LoadingScreen';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import {
  DashboardNav,
  DashboardTab,
  TAB_ROUTES,
  getTabFromPath,
} from './components/dashboard/DashboardNav';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { BusinessSettingsTab } from './components/dashboard/BusinessSettingsTab';
import { ReviewLinkTab } from './components/dashboard/ReviewLinkTab';
import { ReviewRepliesTab } from './components/dashboard/ReviewRepliesTab';
import { DocsTab } from './components/dashboard/DocsTab';
import { PlansTab } from './components/dashboard/PlansTab';
import { ContactTab } from './components/dashboard/ContactTab';
import { SecurityTab } from './components/dashboard/SecurityTab';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PublicReviewPage } from './components/public/PublicReviewPage';
import { SuspendedAccountNotice } from './components/dashboard/SuspendedAccountNotice';
import { BusinessSettings, CustomerReview, GoogleBusinessAccount } from './types';
import { api } from './lib/api';
import {
  Building2,
  Sparkles,
  QrCode,
  MessageSquare,
  Lock,
  RefreshCw,
  ShieldCheck,
  LogOut,
  Crown,
  Star,
  CheckCircle2,
  TrendingUp,
  Users,
  Award,
  Shield,
  ArrowRight,
} from 'lucide-react';

/**
 * Public Review Page Route Wrapper
 * Works standalone for public customers scanning the QR code,
 * and also supports preview mode with "Back to Dashboard" for business owners.
 */
function PublicReviewRoute({ isPreviewMode = false }: { isPreviewMode?: boolean }) {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = isPreviewMode || searchParams.get('preview') === 'true';

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  return (
    <PublicReviewPage
      slug={slug}
      onBackToDashboard={isPreview ? () => navigate('/review-links') : undefined}
    />
  );
}

/**
 * Main Customer Dashboard Content with Dynamic Routing Sync
 */
function CustomerPortalContent() {
  const { user, token, isLoading, logout, impersonatorAdmin, stopImpersonation } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleCustomerLogout = async () => {
    await logout();
    showSuccess('Successfully signed out.');
    navigate('/', { replace: true });
  };

  // Active tab is directly driven by the browser URL route
  const rawTab: DashboardTab = getTabFromPath(location.pathname);
  const activeTab: DashboardTab = rawTab === 'admin_panel' ? 'overview' : rawTab;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [googleAccount, setGoogleAccount] = useState<GoogleBusinessAccount>({ connected: false });
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // If Super Admin logs in and visits root '/', land them on Admin Panel
  useEffect(() => {
    if (
      user &&
      (user.role === 'admin' || user.email === 'info@arventaventures.online') &&
      !impersonatorAdmin &&
      location.pathname === '/'
    ) {
      navigate('/admin');
    }
  }, [user, impersonatorAdmin, location.pathname, navigate]);

  // If in customer portal (e.g. regular user or active admin impersonation) but route is '/admin', redirect to '/'
  useEffect(() => {
    if (
      (impersonatorAdmin || (user && user.role !== 'admin' && user.email !== 'info@arventaventures.online')) &&
      (location.pathname === '/admin' || location.pathname === '/admin-panel')
    ) {
      navigate('/', { replace: true });
    }
  }, [user, impersonatorAdmin, location.pathname, navigate]);

  const loadCustomerData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [settingsRes, googleRes, reviewsRes] = await Promise.all([
        api.getBusinessSettings(),
        api.getGoogleAccount(),
        api.getReviews(),
      ]);

      if (settingsRes.settings) {
        setBusinessSettings(settingsRes.settings);
      }
      if (googleRes.account) {
        setGoogleAccount(googleRes.account);
      }
      if (reviewsRes.reviews) {
        setReviews(reviewsRes.reviews);
      }
    } catch (err) {
      console.error('Error loading customer dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadCustomerData();
    }
  }, [user, token]);

  // Handle OAuth redirect or query callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      if (token) loadCustomerData();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  const currentSettings: BusinessSettings = React.useMemo(() => {
    return (
      businessSettings || {
        id: user ? 'biz-' + user.id : 'biz-default',
        userId: user ? user.id : 'default-user',
        businessName: user ? `${user.fullName}'s Business` : 'My Business',
        category: 'Local Business',
        placeId: '',
        googleReviewUrl: '',
        productsAndServices: '',
        customerExperience: '',
        brandTone: 'friendly',
        targetKeywords: [],
        customSlug: user ? 'biz-' + user.id.slice(-6) : 'my-business',
        languagePreferences: [{ code: 'en', name: 'English', percentage: 100 }],
        autoReplyEnabled: false,
        autoReplyMode: 'approval',
        minStarRating: 4,
        responseDelayMinutes: 5,
        updatedAt: new Date().toISOString(),
      }
    );
  }, [businessSettings, user]);

  const handleTabChange = (tab: DashboardTab) => {
    navigate(TAB_ROUTES[tab]);
  };

  const handleOpenPublicReview = () => {
    navigate(`/review/${currentSettings.customSlug}?preview=true`);
  };

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToSettings = () => {
    navigate('/business-profile');
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading your account..."
        subMessage="Validating secure session and user profile"
      />
    );
  }

  // Unauthenticated: Modern Enterprise SaaS Google-Styled Landing & Value Proposition
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafd] via-[#ffffff] to-[#f0f4f9] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Ambient Decorative Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

        {/* Top Header - Glassmorphic */}
        <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between px-5 sm:px-7 py-3.5 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs mb-4">
          <div className="flex items-center gap-3.5">
            {/* Google Store Canopy Icon with Glow */}
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 10" stroke="#EA4335" strokeWidth="2"/>
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 10" stroke="#FBBC04" strokeWidth="2"/>
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 10" stroke="#34A853" strokeWidth="2"/>
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 10" stroke="#1A73E8" strokeWidth="2"/>
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#202124] tracking-tight">
                  Google Business Profile Manager
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
                  Verified
                </span>
              </div>
              <div className="text-[11px] font-medium text-[#5f6368]">
                Review Automation &amp; AI Replies by <strong className="text-[#1a73e8]">RANKORA</strong>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#5f6368]">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <span>256-Bit SSL &bull; Row-Level Security</span>
          </div>
        </header>

        {/* Hero & Authentication Form */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto py-6 sm:py-8">
          {/* Left Column: Value Proposition & Live Interactive AI Showcase */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1a73e8] text-xs font-bold border border-blue-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1a73e8] animate-pulse" />
              <span>Next-Gen Google Maps Growth Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#202124] tracking-tight leading-[1.15]">
              Grow Your Business with{' '}
              <span className="bg-gradient-to-r from-[#1a73e8] via-[#1557b0] to-[#0d47a1] bg-clip-text text-transparent">
                5-Star Google Reviews
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#5f6368] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Empower your storefront with QR counter stands and instant AI review drafting. Powered by Google Gemini 3.8 Flash to write organic reviews and auto-publish authentic owner replies on Google Maps.
            </p>

            {/* Live AI Review Demo Card (Visual Showcase) */}
            <div className="max-w-xl mx-auto lg:mx-0 p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a73e8] via-[#4285f4] to-[#34a853]" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#174ea6] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    PM
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#202124] flex items-center gap-1.5">
                      <span>Priya Mukherjee</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">Local Guide</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[11px] text-[#5f6368] font-semibold ml-1">5.0 Star Verified Review</span>
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Sync
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-[#3c4043] leading-relaxed italic bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                &ldquo;Outstanding experience! The staff is friendly, service is ultra-fast, and the ambiance was wonderful. Highly recommended to everyone in town! 🌟&rdquo;
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px] text-[#5f6368]">
                <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>Drafted by Gemini 3.8 Flash AI</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Auto-Published to Google Maps
                </span>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0 py-1">
              <div className="p-3 bg-white/70 rounded-xl border border-gray-200/80 text-center shadow-2xs">
                <span className="block text-lg sm:text-xl font-extrabold text-[#1a73e8]">4.9 / 5.0</span>
                <span className="text-[11px] font-medium text-[#5f6368]">Rating Average</span>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-gray-200/80 text-center shadow-2xs">
                <span className="block text-lg sm:text-xl font-extrabold text-[#137333]">1,200+</span>
                <span className="text-[11px] font-medium text-[#5f6368]">Active Stores</span>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-gray-200/80 text-center shadow-2xs">
                <span className="block text-lg sm:text-xl font-extrabold text-[#f9ab00]">99.4%</span>
                <span className="text-[11px] font-medium text-[#5f6368]">AI Approval</span>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="p-3.5 bg-white/80 hover:bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Official Google OAuth 2.0
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5 leading-snug">
                    Connect and track verified Google Business locations securely.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/80 hover:bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Custom QR Stands
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5 leading-snug">
                    Printable table tent cards and 300 DPI high-res QR counter displays.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/80 hover:bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3 sm:col-span-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Automated Owner Replies
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5 leading-snug">
                    Zero-delay auto-replies or 1-click approval queue on Maps.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Auth Form Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <AuthModal />
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 max-w-7xl mx-auto w-full pt-6 pb-2 text-center text-xs text-[#5f6368] border-t border-gray-200/80">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="font-extrabold text-[#202124] tracking-tight">RANKORA</span>
            <span>&bull;</span>
            <span>Powered by <a href="https://arventaventures.online/" target="_blank" rel="noreferrer" className="text-[#1a73e8] hover:underline font-bold">Arventa Ventures</a></span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline text-gray-400">Pure Client-Side Static SPA &bull; Supabase Protected</span>
          </div>
        </footer>
      </div>
    );
  }

  // Check if account has been suspended by Google Compliance / Admin
  if (user && user.status === 'suspended') {
    return (
      <SuspendedAccountNotice
        user={user}
        businessName={currentSettings.businessName}
        onLogout={handleCustomerLogout}
      />
    );
  }

  if (loadingData && !businessSettings) {
    return (
      <LoadingScreen
        message="Loading business dashboard..."
        subMessage="Synchronizing Google Business Profile details, reviews, and QR stands"
      />
    );
  }

  const pendingCount = reviews.filter((r) => r.replyStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      {loadingData && <TopProgressBar />}
      <div>
        <DashboardHeader
          user={user}
          googleAccount={googleAccount}
          businessName={currentSettings.businessName}
          businessLogo={currentSettings.businessLogo}
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(true)}
          onLogout={handleCustomerLogout}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToHome={handleNavigateToHome}
        />

        <DashboardNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          businessName={currentSettings.businessName}
          businessLogo={currentSettings.businessLogo}
          user={user}
          googleAccount={googleAccount}
          pendingReviewsCount={pendingCount}
          onLogout={logout}
          onOpenPublicPage={handleOpenPublicReview}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          {(activeTab === 'overview' ||
            !['business_settings', 'review_links', 'review_replies', 'docs', 'plans', 'contact', 'security'].includes(
              activeTab
            )) && (
            <OverviewTab
              settings={currentSettings}
              googleAccount={googleAccount}
              reviews={reviews}
              onChangeTab={handleTabChange}
              onOpenPublicPage={handleOpenPublicReview}
            />
          )}

          {activeTab === 'business_settings' && (
            <BusinessSettingsTab
              settings={currentSettings}
              onUpdateSettings={(newSettings) => setBusinessSettings(newSettings)}
            />
          )}

          {activeTab === 'review_links' && (
            <ReviewLinkTab
              settings={currentSettings}
              onOpenPublicPage={handleOpenPublicReview}
              onUpdateSlug={(newSlug) => {
                setBusinessSettings((prev) => (prev ? { ...prev, customSlug: newSlug } : null));
              }}
              onNavigateToSettings={() => navigate(TAB_ROUTES.business_settings)}
              onUpdateSettings={(newSettings) => setBusinessSettings(newSettings)}
            />
          )}

          {activeTab === 'review_replies' && (
            <ReviewRepliesTab
              settings={currentSettings}
              onUpdateSettings={(newSettings) => setBusinessSettings(newSettings)}
            />
          )}

          {activeTab === 'docs' && (
            <DocsTab />
          )}

          {activeTab === 'plans' && (
            <PlansTab />
          )}

          {activeTab === 'contact' && (
            <ContactTab />
          )}

          {activeTab === 'security' && (
            <SecurityTab />
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-[#dadce0] py-3 text-center text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-[#202124]">RANKORA</span>
          <span className="text-[#dadce0]">&bull;</span>
          <span>A Product by <a href="https://arventaventures.online/" target="_blank" rel="noreferrer" className="text-[#1a73e8] hover:underline font-medium">Arventa Ventures</a></span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Dedicated Pure Admin Portal Content
 * Zero customer features: only user management, plans editing, and system controls.
 */
function AdminPortalContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleAdminLogout = async () => {
    await logout();
    showSuccess('Admin logged out successfully.');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <div>
        {/* Dedicated Pure Admin Header */}
        <header className="bg-white border-b border-[#dadce0] sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-18">
              {/* Brand Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a73e8] to-[#1557b0] text-white flex items-center justify-center font-bold shadow-2xs">
                  <ShieldCheck className="w-6 h-6 text-[#fbbc04]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base sm:text-lg text-[#202124] tracking-tight">
                      RANKORA
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[#5f6368]">
                    Arventa Ventures Control Center
                  </div>
                </div>
              </div>

              {/* Admin Profile & Logout */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-[#202124]">
                    {user?.fullName || 'Jaydeb Jana'}
                  </div>
                  <div className="text-[11px] text-[#5f6368] font-mono">
                    {user?.email || 'info@arventaventures.online'}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  JJ
                </div>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-3.5 py-2 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Sign out of Admin session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Pure Admin Control Dashboard */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminDashboard onUserImpersonated={() => navigate('/')} />
        </main>
      </div>

      <footer className="bg-white border-t border-[#dadce0] py-4 text-center text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="font-bold text-[#202124]">RANKORA Control Center</span>
          <span className="text-[#dadce0]">&bull;</span>
          <span>Arventa Ventures Super Admin Console</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * Portal Authenticated Switcher
 * Decides whether to render pure Admin Portal or Customer Dashboard
 */
function AuthenticatedPortal() {
  const { user, impersonatorAdmin } = useAuth();
  const isSuperAdmin = user?.role === 'admin' || user?.email === 'info@arventaventures.online';

  // If user is Super Admin and NOT currently impersonating a customer:
  // Render ONLY the pure Admin Portal! Zero customer features!
  if (isSuperAdmin && !impersonatorAdmin) {
    return <AdminPortalContent />;
  }

  // Otherwise (normal customer OR admin actively impersonating a customer):
  return <CustomerPortalContent />;
}

/**
 * Top-Level App Routes Configuration
 */
function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Review Page routes (accessible by customers scanning QR or clicking link) */}
      <Route path="/review/:slug" element={<PublicReviewRoute />} />
      <Route path="/preview/:slug" element={<PublicReviewRoute isPreviewMode={true} />} />

      {/* 2. Authenticated Dashboard Routes */}
      <Route path="/" element={<AuthenticatedPortal />} />
      <Route path="/overview" element={<Navigate to="/" replace />} />
      <Route path="/business-profile" element={<AuthenticatedPortal />} />
      <Route path="/settings" element={<Navigate to="/business-profile" replace />} />
      <Route path="/review-links" element={<AuthenticatedPortal />} />
      <Route path="/qr-stands" element={<Navigate to="/review-links" replace />} />
      <Route path="/ai-review" element={<AuthenticatedPortal />} />
      <Route path="/review-replies" element={<Navigate to="/ai-review" replace />} />
      <Route path="/docs" element={<AuthenticatedPortal />} />
      <Route path="/plans" element={<AuthenticatedPortal />} />
      <Route path="/contact" element={<AuthenticatedPortal />} />
      <Route path="/security" element={<AuthenticatedPortal />} />
      <Route path="/admin" element={<AuthenticatedPortal />} />
      <Route path="/admin-panel" element={<Navigate to="/admin" replace />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
