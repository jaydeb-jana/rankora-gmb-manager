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
import { ToastProvider } from './context/ToastContext';
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

  // Active tab is directly driven by the browser URL route
  const activeTab: DashboardTab = getTabFromPath(location.pathname);
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
      location.pathname === '/'
    ) {
      navigate('/admin');
    }
  }, [user, location.pathname]);

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
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#5f6368]">
            Loading customer portal...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Google-styled Clean White Login & Value Proposition
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top Header */}
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 sm:pb-8 border-b border-[#dadce0]">
          <div className="flex items-center gap-3">
            {/* Google Store Canopy Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#dadce0] shadow-2xs">
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
              <div className="font-bold text-lg text-[#202124] tracking-tight">
                Google Business Profile Manager
              </div>
              <div className="text-[11px] font-medium text-[#5f6368]">
                Review Automation & AI Replies by RANKORA
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5f6368]">
            <Lock className="w-3.5 h-3.5 text-[#137333]" />
            <span>Customer Isolated Session &bull; Row Level Security</span>
          </div>
        </header>

        {/* Hero & Authentication Form */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8">
          {/* Left Column: Google-styled value proposition */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold border border-[#d2e3fc]">
              <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Google Business Profile Review Automation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#202124] tracking-tight leading-tight">
              Grow Your Business with{' '}
              <span className="text-[#1a73e8]">
                5-Star Google Reviews
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#5f6368] max-w-xl leading-relaxed">
              Create unique review landing pages and counter QR stands. Our integrated Gemini 3.8 Flash engine crafts authentic multilingual review drafts in seconds and automatically posts owner replies on Google Maps.
            </p>

            {/* Feature Cards in Google White Aesthetic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto lg:mx-0 pt-2 text-left">
              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Official Google OAuth
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Connect verified Google Business locations via OAuth 2.0.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <QrCode className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Custom QR Stands
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Printable table tent cards and high-res QR codes.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#f9ab00] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Gemini 3.8 Flash AI
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Multilingual organic drafts matched to your business offerings.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#dadce0] shadow-2xs flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#202124]">
                    Automated Owner Replies
                  </h3>
                  <p className="text-[11px] text-[#5f6368] mt-0.5">
                    Auto-respond to reviews or approve AI drafts before publishing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Auth Form with Email OTP */}
          <div className="lg:col-span-5 flex justify-center">
            <AuthModal />
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto w-full pt-6 text-center text-xs text-[#5f6368] border-t border-[#dadce0]">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-semibold text-[#202124]">RANKORA</span>
            <span>&bull;</span>
            <span>By <a href="https://arventaventures.online/" target="_blank" rel="noreferrer" className="text-[#1a73e8] hover:underline font-medium">Arventa Ventures</a></span>
          </div>
        </footer>
      </div>
    );
  }

  if (loadingData && !businessSettings) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#5f6368]">
            Loading your business profile and review data...
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = reviews.filter((r) => r.replyStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <div>
        {/* Sticky Impersonation Alert Banner */}
        {impersonatorAdmin && (
          <div className="bg-[#fef7e0] border-b border-[#f9ab00]/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 sticky top-0 shadow-xs">
            <div className="flex items-center gap-2 text-[#b06000]">
              <ShieldCheck className="w-4 h-4 text-[#e37400] shrink-0" />
              <span>
                <strong>Admin Impersonation Mode:</strong> Currently managing store for{' '}
                <strong>{user?.fullName}</strong> ({user?.email}) as Super Admin.
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await stopImpersonation();
                navigate('/admin');
              }}
              className="px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
            >
              Exit Impersonation &amp; Return to Admin Panel
            </button>
          </div>
        )}

        <DashboardHeader
          user={user}
          googleAccount={googleAccount}
          businessName={currentSettings.businessName}
          businessLogo={currentSettings.businessLogo}
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(true)}
          onLogout={logout}
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
          {activeTab === 'overview' && (
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
                  onClick={logout}
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
          <AdminDashboard />
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
