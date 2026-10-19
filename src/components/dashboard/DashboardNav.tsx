import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Sliders,
  QrCode,
  MessageSquareCode,
  FileText,
  X,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Crown,
  Building2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { CustomerUser, GoogleBusinessAccount } from '../../types';

export type DashboardTab =
  | 'overview'
  | 'business_settings'
  | 'review_links'
  | 'review_replies'
  | 'docs'
  | 'plans'
  | 'contact'
  | 'security'
  | 'admin_panel';

export const TAB_ROUTES: Record<DashboardTab, string> = {
  overview: '/',
  business_settings: '/business-profile',
  review_links: '/review-links',
  review_replies: '/ai-review',
  docs: '/docs',
  plans: '/plans',
  contact: '/contact',
  security: '/security',
  admin_panel: '/admin',
};

export function getTabFromPath(pathname: string): DashboardTab {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath === '/admin' || cleanPath === '/admin-panel') return 'admin_panel';
  if (cleanPath === '/business-profile' || cleanPath === '/settings') return 'business_settings';
  if (cleanPath === '/review-links' || cleanPath === '/qr-stands') return 'review_links';
  if (cleanPath === '/ai-review' || cleanPath === '/review-replies') return 'review_replies';
  if (cleanPath === '/docs') return 'docs';
  if (cleanPath === '/plans') return 'plans';
  if (cleanPath === '/contact') return 'contact';
  if (cleanPath === '/security') return 'security';
  return 'overview';
}

interface DashboardNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DashboardTab;
  onChangeTab: (tab: DashboardTab) => void;
  businessName: string;
  businessLogo?: string;
  user: CustomerUser;
  googleAccount?: GoogleBusinessAccount;
  pendingReviewsCount?: number;
  onLogout?: () => void;
  onOpenPublicPage?: () => void;
}

export function DashboardNav({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  businessName,
  businessLogo,
  user,
  googleAccount,
  pendingReviewsCount = 0,
  onLogout,
  onOpenPublicPage,
}: DashboardNavProps) {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    {
      id: 'overview' as DashboardTab,
      label: 'Home & Overview',
      icon: LayoutDashboard,
      path: TAB_ROUTES['overview'],
      badge: null,
    },
    {
      id: 'business_settings' as DashboardTab,
      label: 'Business Profile',
      icon: Sliders,
      path: TAB_ROUTES['business_settings'],
      badge: null,
    },
    {
      id: 'review_links' as DashboardTab,
      label: 'Review Link & QR Stand',
      icon: QrCode,
      path: TAB_ROUTES['review_links'],
      badge: null,
    },
    {
      id: 'review_replies' as DashboardTab,
      label: 'AI Review',
      icon: MessageSquareCode,
      path: TAB_ROUTES['review_replies'],
      badge: null,
    },
    {
      id: 'docs' as DashboardTab,
      label: 'API',
      icon: FileText,
      path: TAB_ROUTES['docs'],
      badge: null,
    },
    {
      id: 'plans' as DashboardTab,
      label: 'Plans',
      icon: Crown,
      path: TAB_ROUTES['plans'],
      badge: 'Pro / Ultra',
      badgeColor: 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]',
    },
    {
      id: 'contact' as DashboardTab,
      label: 'Contact',
      icon: Building2,
      path: TAB_ROUTES['contact'],
      badge: null,
    },
    {
      id: 'security' as DashboardTab,
      label: 'Data Security',
      icon: ShieldCheck,
      path: TAB_ROUTES['security'],
      badge: null,
    },
  ];

  const handleSelectTab = (tab: DashboardTab) => {
    onChangeTab(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#dadce0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            {/* Google Canopy Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#dadce0] shadow-2xs shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 10" stroke="#EA4335" strokeWidth="2"/>
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 10" stroke="#FBBC04" strokeWidth="2"/>
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 10" stroke="#34A853" strokeWidth="2"/>
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 10" stroke="#1A73E8" strokeWidth="2"/>
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm sm:text-base text-[#202124] tracking-tight">
                RANKORA
              </div>
              <div className="text-[11px] font-medium text-[#5f6368] truncate">
                Google Business Profile Manager
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left group ${
                  isActive
                    ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold shadow-2xs'
                    : 'text-[#3c4043] hover:bg-[#f1f3f4] hover:text-[#202124]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#1a73e8] text-white shadow-2xs'
                        : 'bg-[#f1f3f4] text-[#5f6368] group-hover:bg-white group-hover:text-[#1a73e8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-snug truncate">
                      {item.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.badgeColor || 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-[#1a73e8] translate-x-0.5' : 'text-[#dadce0] group-hover:text-[#5f6368]'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Customer Review Landing Page Shortcut */}
        {onOpenPublicPage && (
          <div className="px-3 pb-2 pt-1 border-t border-[#f1f3f4]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPublicPage();
              }}
              className="w-full py-2.5 px-3 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Customer Review Page</span>
            </button>
          </div>
        )}

        {/* Drawer Footer with User & Sign Out */}
        <div className="p-3.5 border-t border-[#dadce0] bg-[#f8f9fa] shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {businessLogo ? (
                <div className="w-8 h-8 rounded-full bg-white border border-[#dadce0] overflow-hidden shadow-2xs shrink-0 select-none flex items-center justify-center p-0.5">
                  <img
                    src={businessLogo}
                    alt={businessName || user.fullName}
                    className="w-full h-full object-contain select-none"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 select-none">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#202124] truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-[#5f6368] truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                title="Sign out"
                className="p-2 text-[#5f6368] hover:text-[#d93025] hover:bg-white rounded-lg border border-transparent hover:border-[#dadce0] transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
