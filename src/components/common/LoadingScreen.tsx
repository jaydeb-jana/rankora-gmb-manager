import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Loading dashboard...',
  subMessage = 'Synchronizing real-time Google Business data',
  fullScreen = true,
}: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto">
      {/* Branded Google Canopy Logo with Ambient Glow */}
      <div className="relative mb-6">
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse" />
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white border border-[#dadce0] shadow-md flex items-center justify-center">
          <svg className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce duration-1000" viewBox="0 0 24 24" fill="none">
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

      {/* Brand Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] text-[11px] font-bold tracking-wide mb-3">
        <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
        <span>RANKORA &bull; Google Business Manager</span>
      </div>

      {/* Title & Message */}
      <h3 className="text-base sm:text-lg font-bold text-[#202124] tracking-tight mb-1">
        {message}
      </h3>
      <p className="text-xs sm:text-sm text-[#5f6368] mb-5 leading-relaxed">
        {subMessage}
      </p>

      {/* Material Design Indeterminate Progress Bar */}
      <div className="w-48 sm:w-56 h-1.5 bg-[#e8f0fe] rounded-full overflow-hidden relative shadow-inner">
        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#1a73e8] via-[#4285f4] to-[#1a73e8] rounded-full w-1/2 animate-[progress_1.4s_ease-in-out_infinite]" />
      </div>

      {/* Google Dots Animation */}
      <div className="flex items-center gap-1.5 mt-5">
        <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#FBBC05] animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return <div className="py-12">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafd] via-[#ffffff] to-[#f0f4f9] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md border border-[#dadce0]/80 rounded-2xl shadow-xl p-8 max-w-md w-full">
        {content}
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
