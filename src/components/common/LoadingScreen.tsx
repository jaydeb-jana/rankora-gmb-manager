import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Loading your account...',
  subMessage = 'Validating secure session and user profile',
  fullScreen = true,
}: LoadingScreenProps) {
  const content = (
    <div className="w-full max-w-sm px-6 py-6 flex flex-col items-center text-center">
      {/* Official Google Canopy Storefront Icon */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-[#f8fafd] border border-[#e8eaed] shadow-[0_2px_12px_rgba(66,133,244,0.08)] flex items-center justify-center mx-auto">
          <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10"
              stroke="#1A73E8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8" />
            <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 10" stroke="#EA4335" strokeWidth="2" />
            <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 10" stroke="#FBBC04" strokeWidth="2" />
            <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 10" stroke="#34A853" strokeWidth="2" />
            <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 10" stroke="#1A73E8" strokeWidth="2" />
            <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Official Google Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] text-xs font-semibold tracking-wide mb-3.5 shadow-2xs">
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Google Business Manager</span>
      </div>

      {/* Title & Subtitle */}
      <h3 className="text-lg sm:text-xl font-bold text-[#202124] tracking-tight mb-1.5">
        {message}
      </h3>
      <p className="text-xs text-[#5f6368] mb-6 leading-relaxed max-w-[260px]">
        {subMessage}
      </p>

      {/* Google Signature Dots Animation */}
      <div className="flex items-center justify-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return <div className="py-12 flex justify-center">{content}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-white sm:bg-[#f8fafd] flex flex-col justify-between items-center relative overflow-hidden">
      {/* Top Google 4-Color Material Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-[#e8eaed]">
        <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] w-full animate-[progress_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
      </div>

      <div className="pt-8 sm:pt-16" />

      {/* Center card on desktop, seamless edge-to-edge on mobile */}
      <div className="w-full sm:max-w-md sm:bg-white sm:border sm:border-[#dadce0] sm:rounded-3xl sm:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex justify-center">
        {content}
      </div>

      {/* Bottom Footer */}
      <div className="pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#e8eaed] text-[11px] text-[#5f6368] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Official Google Workspace Connection</span>
        </div>
      </div>
    </div>
  );
}

/**
 * TopProgressBar: Slim Material Top Bar for background synchronization
 */
export function TopProgressBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#1a73e8] via-[#ea4335] via-[#fbbc04] to-[#34a853] w-full animate-[progress_1.2s_ease-in-out_infinite]" />
    </div>
  );
}

/**
 * SkeletonCard: Professional placeholder for cards
 */
export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-xs animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded-md w-3/4" />
              <div className="h-3 bg-gray-100 rounded-md w-1/2" />
            </div>
          </div>
          <div className="space-y-2.5 mb-5">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonRows: Professional placeholder for table rows
 */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-gray-200 rounded w-1/3" />
              <div className="h-2.5 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
          <div className="hidden sm:block w-24 h-6 bg-gray-100 rounded-full" />
          <div className="w-16 h-8 bg-gray-200 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * GoogleReviewLoadingScreen: Official Google Reviews Splash Loader with dynamic phase progression
 */
export function GoogleReviewLoadingScreen() {
  const [phase, setPhase] = React.useState<number>(1);

  React.useEffect(() => {
    const timer1 = setTimeout(() => setPhase(2), 600);
    const timer2 = setTimeout(() => setPhase(3), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white sm:bg-[#f8fafd] flex flex-col justify-between items-center relative overflow-hidden">
      {/* Top Google 4-Color Material Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-[#e8eaed]">
        <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] w-full animate-[progress_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
      </div>

      <div className="pt-8 sm:pt-16" />

      {/* Main Center Content */}
      <div className="w-full sm:max-w-md sm:bg-white sm:border sm:border-[#dadce0] sm:rounded-3xl sm:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex justify-center">
        <div className="w-full max-w-sm px-6 py-6 flex flex-col items-center text-center">
          {/* Official Google Canopy Storefront Icon */}
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-[#f8fafd] border border-[#e8eaed] shadow-[0_2px_12px_rgba(66,133,244,0.08)] flex items-center justify-center mx-auto">
              <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10"
                  stroke="#1A73E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8" />
                <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 10" stroke="#EA4335" strokeWidth="2" />
                <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 10" stroke="#FBBC04" strokeWidth="2" />
                <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 10" stroke="#34A853" strokeWidth="2" />
                <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 10" stroke="#1A73E8" strokeWidth="2" />
                <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Google Reviews Official Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] text-xs font-semibold tracking-wide mb-3.5 shadow-2xs">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Business Reviews</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#202124] tracking-tight mb-1.5">
            {phase === 1 && 'Connecting to Google Maps...'}
            {phase === 2 && 'Loading verified store profile...'}
            {phase >= 3 && 'Opening review assistant...'}
          </h3>
          <p className="text-xs text-[#5f6368] mb-6 leading-relaxed max-w-[260px] min-h-[34px] flex items-center justify-center">
            {phase === 1 && 'Locating official business listing on Google Maps'}
            {phase === 2 && 'Syncing verified store services & offerings'}
            {phase >= 3 && 'Preparing 1-click review submission generator'}
          </p>

          {/* Google Signature Dots Animation */}
          <div className="flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] animate-bounce" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]" />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#e8eaed] text-[11px] text-[#5f6368] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Official Google Maps Verified Gateway</span>
        </div>
      </div>
    </div>
  );
}
