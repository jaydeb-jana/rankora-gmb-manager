import React from 'react';
import {
  Star,
  ShieldCheck,
  Coffee,
  Heart,
  Zap,
  Smartphone,
  Check,
  Activity,
  Wrench,
  UtensilsCrossed,
  Dumbbell,
  Gem,
  Scissors,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { StandTemplate } from './ReviewLinkTab';

interface StandPreviewCardProps {
  template: StandTemplate;
  settings: BusinessSettings;
  qrDataUrl: string;
}

/**
 * Standardized Circular Logo Avatar:
 * Guarantees every template has an identical w-14 h-14 circular brand element.
 */
function StandLogo({
  logo,
  bizName,
  borderColor = 'border-2 border-[#dadce0]',
  bgFallback = 'bg-white',
  textColor = 'text-[#1a73e8]',
}: {
  logo?: string;
  bizName: string;
  borderColor?: string;
  bgFallback?: string;
  textColor?: string;
}) {
  const initial = bizName ? bizName.trim().charAt(0).toUpperCase() : 'G';
  return (
    <div
      className={`w-14 h-14 rounded-full p-0.5 shadow-sm flex items-center justify-center shrink-0 mx-auto overflow-hidden ${borderColor} ${bgFallback}`}
    >
      {logo ? (
        <img src={logo} alt={bizName} className="w-full h-full object-cover rounded-full" />
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-xl select-none ${textColor}`}>
          {initial}
        </div>
      )}
    </div>
  );
}

/**
 * Standardized 5-Star Rating Pill:
 * Guarantees every template displays 5 filled stars + 5.0 Rating badge.
 */
function StandRatingPill({
  starColor = 'text-[#f9ab00]',
  textColor = 'text-[#b06000]',
  bgColor = 'bg-[#fef7e0]',
  borderColor = 'border-[#feefc3]',
  label = '5.0 Rating',
}: {
  starColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  label?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full shadow-2xs border ${bgColor} ${borderColor}`}>
      <div className={`flex gap-0.5 ${starColor}`}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-current drop-shadow-xs" />
        ))}
      </div>
      <span className={`text-[11px] font-black tracking-tight ${textColor}`}>{label}</span>
    </div>
  );
}

export function StandPreviewCard({ template, settings, qrDataUrl }: StandPreviewCardProps) {
  const bizName = settings.businessName || 'Your Business Name';
  const logo = settings.businessLogo;

  // 1. OFFICIAL GOOGLE CANOPY & CARD
  if (template.layoutType === 'official-google') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-white rounded-3xl shadow-xl border-2 border-[#dadce0] overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          {/* Google 4-color top stripe */}
          <div className="h-2.5 w-full flex shrink-0">
            <span className="w-1/4 bg-[#4285f4]" />
            <span className="w-1/4 bg-[#ea4335]" />
            <span className="w-1/4 bg-[#fbbc05]" />
            <span className="w-1/4 bg-[#34a853]" />
          </div>

          <div className="p-4 sm:p-5 space-y-2.5">
            {/* Header Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] shadow-2xs">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-xs font-bold text-[#202124] tracking-tight">
                Review us on <span className="font-extrabold"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span>
              </span>
            </div>

            {/* Circular Logo & Name */}
            <div className="flex flex-col items-center">
              <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#dadce0]" bgFallback="bg-white" textColor="text-[#1a73e8]" />
              <div className="flex items-center justify-center gap-1.5 px-2 mt-1.5">
                <h4 className="font-extrabold text-base text-[#202124] leading-tight line-clamp-1">{bizName}</h4>
                <div className="w-4 h-4 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
              <p className="text-[10px] text-[#5f6368] font-medium">Verified on Google Maps</p>
            </div>

            {/* 5-Star Rating Pill */}
            <div>
              <StandRatingPill starColor="text-[#f9ab00]" textColor="text-[#b06000]" bgColor="bg-[#fef7e0]" borderColor="border-[#feefc3]" label="5.0 Rating" />
            </div>

            {/* Review Question */}
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#202124]">Loved your experience with us?</p>
              <p className="text-[10px] text-[#5f6368]">Leave us a quick 5-star review!</p>
            </div>

            {/* QR Scanner with brackets */}
            <div className="relative inline-block p-2 bg-white rounded-2xl border-2 border-[#dadce0] shadow-sm">
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#1a73e8] rounded-tl" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#1a73e8] rounded-tr" />
              <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#1a73e8] rounded-bl" />
              <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#1a73e8] rounded-br" />
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />}
            </div>
          </div>
        </div>

        {/* Footer info & bottom stripe */}
        <div className="pb-3 px-4 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f3f4] text-[#3c4043] text-[11px] font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Point phone camera to review</span>
          </div>
          <p className="text-[10px] text-[#5f6368]">Quick AI review drafts in 10 seconds • Direct Google Maps</p>
          <div className="h-2 w-full flex rounded-b-xl overflow-hidden mt-2">
            <span className="w-1/4 bg-[#4285f4]" />
            <span className="w-1/4 bg-[#ea4335]" />
            <span className="w-1/4 bg-[#fbbc05]" />
            <span className="w-1/4 bg-[#34a853]" />
          </div>
        </div>
      </div>
    );
  }

  // 2. MODERN SPLIT-HERO PODIUM
  if (template.layoutType === 'split-hero') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] rounded-3xl shadow-xl overflow-hidden border-2 border-[#334155] bg-white text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          {/* Dark Top Banner (40%) */}
          <div className="bg-[#0b1120] text-white p-4 pb-7 relative">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-2">
              <Zap className="w-3 h-3" />
              <span>AI REVIEW PORTAL</span>
            </div>

            {/* Circular Logo */}
            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-cyan-400" bgFallback="bg-slate-900" textColor="text-cyan-400" />

            <div className="flex items-center justify-center gap-1.5 px-2 mt-1.5">
              <h4 className="font-extrabold text-base text-white leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Verified Google Profile</p>

            {/* 5-Star Rating Pill on Dark */}
            <div className="mt-2">
              <StandRatingPill starColor="text-cyan-400" textColor="text-cyan-300" bgColor="bg-slate-900/90" borderColor="border-cyan-500/40" label="5.0 Rating" />
            </div>
          </div>

          {/* Elevated QR Pedestal */}
          <div className="relative -mt-6 px-4">
            <div className="bg-white rounded-2xl p-2.5 shadow-xl border-2 border-cyan-500/50 inline-block">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />}
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-xs font-bold text-[#0f172a]">Loved your experience with us?</p>
              <p className="text-[10px] text-[#64748b]">Share your review with 1-click AI drafts</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pb-4 px-4 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-cyan-600" />
            <span>Point camera to review</span>
          </div>
          <p className="text-[10px] text-[#64748b]">Instant AI Draft • Verified Google Reviews</p>
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full mt-2" />
        </div>
      </div>
    );
  }

  // 3. LUXURY GOLD CREST & ORNATE FRAME
  if (template.layoutType === 'luxury-crest') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#0a1128] text-white rounded-3xl shadow-xl border-4 border-[#d97706] p-4 sm:p-5 text-center relative overflow-hidden flex flex-col justify-between transition-all duration-300">
        <div className="absolute top-2 left-2 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute top-2 right-2 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute bottom-2 left-2 text-[#f59e0b] text-[10px]">⚜</div>
        <div className="absolute bottom-2 right-2 text-[#f59e0b] text-[10px]">⚜</div>

        <div className="space-y-2.5">
          <div className="text-[9px] font-bold tracking-[0.2em] text-[#fbbf24] uppercase border-b border-[#d97706]/40 pb-1 flex items-center justify-center gap-1">
            <span>⚜ EXCELLENCE &amp; REPUTATION ⚜</span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#d97706]" bgFallback="bg-white" textColor="text-[#b45309]" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-serif font-bold text-base text-white tracking-wide line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] text-slate-950 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] text-[#fbbf24]/80 font-medium">Prestigious Google Rated Destination</p>

          <StandRatingPill starColor="text-[#f59e0b]" textColor="text-[#fde68a]" bgColor="bg-[#1e293b]" borderColor="border-[#d97706]/50" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#fde68a]">Your Experience is Our Honor</p>
            <p className="text-[10px] text-[#94a3b8]">Leave your honorable 5-star review</p>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-2xl inline-block border-2 border-[#d97706] shadow-md">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b] text-[#fde68a] border border-[#d97706]/50 text-[11px] font-serif font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Point camera to leave 5-star review</span>
          </div>
          <p className="text-[10px] text-[#94a3b8]">Fine Service Distinction • Direct Google Maps</p>
        </div>
      </div>
    );
  }

  // 4. SCANDINAVIAN ARCHITECTURAL NOIR
  if (template.layoutType === 'scandi-minimal') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-white rounded-3xl shadow-xl border-4 border-black p-4 sm:p-5 text-center relative flex flex-col justify-between transition-all duration-300">
        <div className="space-y-2.5">
          <div className="text-[9px] font-mono font-bold tracking-widest text-zinc-600 uppercase border-b border-black/20 pb-1">
            [ 5.0 GOOGLE RATED STORE ]
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-black" bgFallback="bg-zinc-100" textColor="text-black" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-black text-base text-black uppercase tracking-tight line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-zinc-500">Verified Local Business</p>

          <StandRatingPill starColor="text-black" textColor="text-black" bgColor="bg-zinc-100" borderColor="border-black" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="text-xs font-mono font-bold text-black uppercase">How was your experience today?</p>
            <p className="text-[10px] font-mono text-zinc-500">Leave us a quick 5-star review</p>
          </div>

          {qrDataUrl && (
            <div className="relative p-2 bg-white border-2 border-black rounded-xl inline-block">
              <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-black" />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-black" />
              <span className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-black" />
              <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-black" />
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono font-bold">
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span>Scan with phone camera</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-500">Fast AI Assistant • Direct Google Maps</p>
        </div>
      </div>
    );
  }

  // 5. EMERALD ECO & WELLNESS CAPSULE
  if (template.layoutType === 'emerald-wellness') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#f0fdf4] text-[#064e3b] rounded-3xl shadow-xl border-2 border-[#86efac] p-4 sm:p-5 text-center relative overflow-hidden flex flex-col justify-between transition-all duration-300">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-wider uppercase">VERIFIED CLIENT CARE</span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#86efac]" bgFallback="bg-white" textColor="text-[#15803d]" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-extrabold text-base text-[#064e3b] leading-tight line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-[#15803d] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] text-[#15803d] font-medium">Verified Medical &amp; Wellness</p>

          <StandRatingPill starColor="text-[#10b981]" textColor="text-[#047857]" bgColor="bg-white" borderColor="border-[#bbf7d0]" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#064e3b]">Your Health &amp; Glow Matter</p>
            <p className="text-[10px] text-[#047857]">Share your care experience on Google</p>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-2xl border-2 border-[#86efac] inline-block shadow-sm">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#15803d]" />
            <span>Point camera to review</span>
          </div>
          <p className="text-[10px] text-[#047857]">Quick AI review drafts in 10s • Direct Google Maps</p>
        </div>
      </div>
    );
  }

  // 6. VINTAGE BISTRO & WOODCRAFT STITCH
  if (template.layoutType === 'artisan-vintage') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#fefce8] text-[#422006] rounded-3xl shadow-xl border-2 border-[#ca8a04] p-4 sm:p-5 text-center relative flex flex-col justify-between transition-all duration-300">
        <div className="border-2 border-dashed border-[#ca8a04]/50 rounded-2xl p-3 h-full flex flex-col justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fef08a] border border-[#eab308] text-[#854d0e] text-[10px] font-bold uppercase tracking-wider">
              <Coffee className="w-3 h-3" />
              <span>ARTISAN ROAST &amp; KITCHEN</span>
            </div>

            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#ca8a04]" bgFallback="bg-white" textColor="text-[#854d0e]" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-serif font-extrabold text-base text-[#422006] leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-[#ca8a04] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-[#854d0e] font-serif">Locally Loved &amp; Roasted</p>

            <StandRatingPill starColor="text-[#ca8a04]" textColor="text-[#713f12]" bgColor="bg-[#fef08a]/60" borderColor="border-[#ca8a04]/50" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#422006]">Loved Your Visit or Meal?</p>
              <p className="text-[10px] text-[#713f12]">Leave us a warm 5-star review!</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-xl border-2 border-[#ca8a04] inline-block shadow-xs">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
              </div>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef08a] text-[#854d0e] border border-[#ca8a04] text-[11px] font-serif font-bold">
              <Smartphone className="w-3.5 h-3.5 text-[#854d0e]" />
              <span>Scan with phone to review</span>
            </div>
            <p className="text-[10px] text-[#713f12]">Crafted with passion • Direct Google Maps</p>
          </div>
        </div>
      </div>
    );
  }

  // 7. CYBERPUNK HUD & NEON TERMINAL
  if (template.layoutType === 'cyber-hud') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#070b14] text-white rounded-3xl shadow-xl border-2 border-cyan-400 p-4 sm:p-5 text-center relative overflow-hidden flex flex-col justify-between transition-all duration-300">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 border-b border-cyan-400/30 pb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HUD // ONLINE
            </span>
            <span>GEMINI 3.8 AI</span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]" bgFallback="bg-[#0b1120]" textColor="text-cyan-400" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-mono font-extrabold text-base text-cyan-300 tracking-wider line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-cyan-500/80">Verified Google Business Terminal</p>

          <StandRatingPill starColor="text-cyan-400" textColor="text-cyan-300" bgColor="bg-cyan-950/70" borderColor="border-cyan-400/50" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="text-xs font-mono font-bold text-cyan-300 tracking-wide uppercase">INITIALIZE REVIEW SEQUENCE</p>
            <p className="text-[10px] font-mono text-slate-400">Target Google Review Submission</p>
          </div>

          {qrDataUrl && (
            <div className="relative p-2 bg-white rounded-xl inline-block border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400 text-[11px] font-mono font-bold">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Camera to Scan</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400">Direct Google Maps Transmission</p>
        </div>
      </div>
    );
  }

  // 8. ROSE VELVET & GLAMOUR ARCH
  if (template.layoutType === 'rose-boutique') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#fdf2f8] text-[#831843] rounded-3xl shadow-xl border-2 border-[#f472b6] p-4 sm:p-5 text-center relative overflow-hidden flex flex-col justify-between transition-all duration-300">
        <div className="space-y-2.5">
          <div className="w-full border-b border-[#fbcfe8] pb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#db2777] tracking-wider uppercase">
              <Heart className="w-3 h-3 fill-current" />
              <span>Love Your Experience?</span>
            </span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#f472b6]" bgFallback="bg-white" textColor="text-[#db2777]" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-serif font-bold text-base text-[#831843] line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-[#db2777] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] text-[#db2777] font-medium">Verified Beauty &amp; Style Lounge</p>

          <StandRatingPill starColor="text-[#f59e0b]" textColor="text-[#9d174d]" bgColor="bg-white" borderColor="border-[#fbcfe8]" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#9d174d]">Loved your glow &amp; service?</p>
            <p className="text-[10px] text-[#db2777]">Share your fabulous 5-star review!</p>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-2xl border-2 border-[#f472b6] inline-block shadow-sm">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#db2777] border border-[#f472b6] text-[11px] font-bold shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-[#db2777]" />
            <span>Scan to share your review</span>
          </div>
          <p className="text-[10px] text-[#db2777]">Instant AI review drafts in 10s • Google Maps</p>
        </div>
      </div>
    );
  }

  // 9. DYNAMIC SUNSET BURST (ANGLED HEADER)
  if (template.layoutType === 'dynamic-burst') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-white rounded-3xl shadow-xl border-2 border-[#fdba74] overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          {/* Dynamic diagonal angled banner */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white p-3.5 pb-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/25 text-white text-[10px] font-extrabold uppercase tracking-wider mb-2">
              🔥 5-STAR TOP EXPERIENCE 🔥
            </span>
            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-white shadow-md" bgFallback="bg-white" textColor="text-orange-600" />
            <div className="flex items-center justify-center gap-1.5 px-2 mt-1.5">
              <h4 className="font-extrabold text-base leading-tight text-white line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-white text-orange-600 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-amber-100 font-medium">Verified Google Business</p>
          </div>

          <div className="p-4 pt-2.5 space-y-2">
            <StandRatingPill starColor="text-[#f59e0b]" textColor="text-[#c2410c]" bgColor="bg-orange-50" borderColor="border-orange-200" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-extrabold text-[#c2410c]">Had a great time today?</p>
              <p className="text-[10px] text-[#7c2d12]">Leave us a quick 5-star review!</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-2xl border-2 border-[#ea580c] inline-block shadow-md">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-extrabold">
            <Smartphone className="w-3.5 h-3.5 text-orange-600" />
            <span>Tap or scan camera to review</span>
          </div>
          <p className="text-[10px] text-[#7c2d12]">Fast AI review drafts in 10s • Direct Google Maps</p>
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-full mt-2" />
        </div>
      </div>
    );
  }

  // 10. CORPORATE COBALT EXECUTIVE (VERTICAL STRIPE PLAQUE)
  if (template.layoutType === 'executive-navy') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-white rounded-3xl shadow-xl border-2 border-[#1e3a8a]/30 overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="h-2.5 w-full bg-[#1e3a8a]" />
          <div className="p-4 sm:p-5 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e0e7ff] text-[#1e3a8a] text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>OFFICIAL GOOGLE VERIFIED</span>
            </div>

            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#1e3a8a]" bgFallback="bg-white" textColor="text-[#1e3a8a]" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-bold text-base text-[#0f172a] leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">Google Maps Verified Enterprise</p>

            <StandRatingPill starColor="text-[#f59e0b]" textColor="text-[#1e3a8a]" bgColor="bg-[#e0e7ff]" borderColor="border-[#c7d2fe]" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0f172a]">Client Satisfaction Index</p>
              <p className="text-[10px] text-[#64748b]">Rate your executive experience</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-xl border-2 border-[#1e3a8a] inline-block shadow-sm">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0e7ff] text-[#1e3a8a] border border-[#1e3a8a]/30 text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#1e3a8a]" />
            <span>Point camera to submit review</span>
          </div>
          <p className="text-[10px] text-[#64748b]">Secure &amp; verified submission • Direct Google Maps</p>
          <div className="h-2 w-full bg-[#1e3a8a] mt-2" />
        </div>
      </div>
    );
  }

  // 11. DENTAL & MEDICAL PURE CLINIC
  if (template.layoutType === 'dental-clinic') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-gradient-to-b from-[#f0fdfa] via-white to-white rounded-3xl shadow-xl border-2 border-[#0284c7]/30 overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="bg-[#0284c7] text-white py-2 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Healthcare &amp; Patient Excellence</span>
          </div>

          <div className="p-4 sm:p-5 space-y-2.5">
            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#0284c7]" bgFallback="bg-white" textColor="text-[#0284c7]" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-extrabold text-base text-[#0f172a] leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-[#0284c7] font-semibold">Verified Medical Practice</p>

            <StandRatingPill starColor="text-[#f59e0b]" textColor="text-[#0284c7]" bgColor="bg-[#e0f2fe]" borderColor="border-[#bae6fd]" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#0f172a]">Your Health &amp; Smile Matter</p>
              <p className="text-[10px] text-[#0369a1]">How was your consultation today?</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-2xl border-2 border-[#0284c7] inline-block shadow-md">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7]/40 text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Point camera to leave 5-star review</span>
          </div>
          <p className="text-[10px] text-[#64748b]">Quick AI review drafts in 10s • Direct Google Maps</p>
          <div className="h-1.5 w-full bg-[#0284c7] mt-2" />
        </div>
      </div>
    );
  }

  // 12. MOTORSPORT CARBON WEAVE (AUTOMOTIVE & GARAGE)
  if (template.layoutType === 'carbon-auto') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#0f172a] text-white rounded-3xl shadow-2xl border-2 border-[#dc2626] overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="h-2.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
          <div className="p-4 sm:p-5 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-700 text-red-400 text-[10px] font-extrabold uppercase tracking-widest">
              <Wrench className="w-3.5 h-3.5" />
              <span>Motorsport Precision Service</span>
            </div>

            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#dc2626]" bgFallback="bg-slate-900" textColor="text-red-500" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-black text-base text-white tracking-wide uppercase leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Verified Automotive Center</p>

            <StandRatingPill starColor="text-amber-400" textColor="text-amber-300" bgColor="bg-slate-900" borderColor="border-red-700/60" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Rate Our Speed &amp; Service</p>
              <p className="text-[10px] text-slate-400">Leave your official rating on Google Maps</p>
            </div>

            {qrDataUrl && (
              <div className="relative inline-block p-2 bg-white rounded-xl border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-red-600" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-red-600" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-red-600" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-red-600" />
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-700 text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-red-400" />
            <span>Point camera to leave 5-star rating</span>
          </div>
          <p className="text-[10px] text-slate-400">⚡ 10-Second Quick Google Review</p>
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 mt-2" />
        </div>
      </div>
    );
  }

  // 13. AUTHENTIC ITALIAN TRATTORIA & PIZZERIA
  if (template.layoutType === 'pizzeria-rustic') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#fffbeb] rounded-3xl shadow-xl border-2 border-[#b45309]/30 overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          {/* Italian Flag Top Ribbon */}
          <div className="h-2.5 w-full flex">
            <span className="w-1/3 bg-[#15803d]" />
            <span className="w-1/3 bg-[#ffffff]" />
            <span className="w-1/3 bg-[#b91c1c]" />
          </div>

          <div className="p-4 sm:p-5 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-[10px] font-bold tracking-wider uppercase">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#b91c1c]" />
              <span>Autentico Gusto Italiano</span>
            </div>

            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#d97706]" bgFallback="bg-white" textColor="text-[#b91c1c]" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-serif font-bold text-base text-[#78350f] leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-[#15803d] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-[#92400e] font-medium">Verified Google Restaurant</p>

            <StandRatingPill starColor="text-[#d97706]" textColor="text-[#92400e]" bgColor="bg-[#fef3c7]" borderColor="border-[#fde68a]" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#b91c1c]">Buon Appetito! Loved The Taste?</p>
              <p className="text-[10px] text-[#92400e]">Share your 5-star review on Google</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-2xl border-2 border-[#b91c1c] inline-block shadow-md">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Point camera to review</span>
          </div>
          <p className="text-[10px] font-serif text-[#78350f] italic">Grazie Mille per la Visita! • Google Maps</p>
          <div className="h-2 w-full flex mt-2">
            <span className="w-1/3 bg-[#15803d]" />
            <span className="w-1/3 bg-[#ffffff]" />
            <span className="w-1/3 bg-[#b91c1c]" />
          </div>
        </div>
      </div>
    );
  }

  // 14. IRON VOLT ATHLETIC & GYM
  if (template.layoutType === 'fitness-volt') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#09090b] text-white rounded-3xl shadow-2xl border-2 border-[#84cc16] overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="bg-[#84cc16] text-[#09090b] py-1.5 px-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>IRON PERFORMANCE FITNESS</span>
          </div>

          <div className="p-4 sm:p-5 space-y-2.5">
            <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#84cc16]" bgFallback="bg-zinc-900" textColor="text-[#84cc16]" />

            <div className="flex items-center justify-center gap-1.5 px-2">
              <h4 className="font-black text-base text-white tracking-wider uppercase leading-tight line-clamp-1">{bizName}</h4>
              <div className="w-4 h-4 rounded-full bg-[#84cc16] text-black flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Verified Fitness Center</p>

            <StandRatingPill starColor="text-[#84cc16]" textColor="text-[#84cc16]" bgColor="bg-zinc-900" borderColor="border-[#84cc16]/50" label="5.0 Rating" />

            <div className="space-y-0.5">
              <p className="text-xs font-black text-[#84cc16] uppercase tracking-wide">Crushed Your Workout?</p>
              <p className="text-[10px] text-zinc-400">Leave us a power-packed 5-star review!</p>
            </div>

            {qrDataUrl && (
              <div className="p-2 bg-white rounded-xl border-4 border-[#84cc16] inline-block shadow-[0_0_20px_rgba(132,204,22,0.35)]">
                <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        <div className="pb-3 px-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-[#84cc16] border border-[#84cc16] text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5 text-[#84cc16]" />
            <span>Point phone camera to review</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">💪 Instant Mobile Camera Scan</p>
          <div className="h-1.5 w-full bg-[#84cc16] mt-2" />
        </div>
      </div>
    );
  }

  // 15. PEARL & DIAMOND HAUTE JOAILLERIE
  if (template.layoutType === 'diamond-luxury') {
    return (
      <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-gradient-to-b from-[#fafaf9] via-white to-[#f5f5f4] rounded-3xl shadow-2xl border-2 border-[#d97706]/40 overflow-hidden text-center relative p-4 sm:p-5 flex flex-col justify-between transition-all duration-300">
        <div className="absolute inset-1.5 border border-[#d97706]/30 rounded-2xl pointer-events-none" />

        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7]/60 border border-[#fde68a] text-[#b45309] text-[9px] font-bold uppercase tracking-widest">
            <Gem className="w-3 h-3 text-[#d97706]" />
            <span>Haute Joaillerie &amp; Elegance</span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-[#d97706]/60" bgFallback="bg-white" textColor="text-[#b45309]" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-serif font-bold text-base text-[#1c1917] tracking-wider leading-tight line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-[#d97706] text-white flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] text-[#78716c] font-medium">Verified Google Destination</p>

          <StandRatingPill starColor="text-[#d97706]" textColor="text-[#b45309]" bgColor="bg-white" borderColor="border-[#d97706]/40" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="font-serif text-xs font-semibold text-[#292524]">Thank You For Choosing Excellence</p>
            <p className="text-[10px] text-[#78716c]">Share your luxury experience on Google</p>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-2xl border-2 border-[#d97706] inline-block shadow-lg">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-xl" />
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#b45309] border border-[#d97706]/40 text-[11px] font-serif font-bold shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Scan with smartphone camera</span>
          </div>
          <p className="font-serif text-[10px] text-[#a8a29e] tracking-widest uppercase">Pure Client Distinction • Google Maps</p>
        </div>
      </div>
    );
  }

  // 16. GENTLEMEN'S BARBER & LOUNGE
  return (
    <div className="w-full max-w-[320px] mx-auto min-h-[600px] h-[600px] bg-[#1c1917] text-white rounded-3xl shadow-2xl border-2 border-[#b45309] overflow-hidden text-center relative flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Vintage Barber Pole Accent */}
        <div className="h-2.5 w-full bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#ffffff_10px,#ffffff_20px,#1d4ed8_20px,#1d4ed8_30px,#ffffff_30px,#ffffff_40px)]" />

        <div className="p-4 sm:p-5 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
            <Scissors className="w-3.5 h-3.5" />
            <span>Gentlemen's Shave &amp; Cuts</span>
          </div>

          <StandLogo logo={logo} bizName={bizName} borderColor="border-2 border-amber-500" bgFallback="bg-stone-900" textColor="text-amber-400" />

          <div className="flex items-center justify-center gap-1.5 px-2">
            <h4 className="font-serif font-black text-base text-amber-100 tracking-wider uppercase leading-tight line-clamp-1">{bizName}</h4>
            <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <p className="text-[10px] text-amber-400/80 font-medium">Verified Heritage Barbershop</p>

          <StandRatingPill starColor="text-amber-400" textColor="text-amber-300" bgColor="bg-stone-900" borderColor="border-amber-700/60" label="5.0 Rating" />

          <div className="space-y-0.5">
            <p className="font-serif text-xs font-bold text-amber-300">A Cut Above The Rest</p>
            <p className="text-[10px] text-stone-400">Leave your master review on Google Maps</p>
          </div>

          {qrDataUrl && (
            <div className="p-2 bg-white rounded-xl border-2 border-amber-500 inline-block shadow-md">
              <img src={qrDataUrl} alt="QR Code" className="w-34 h-34 rounded-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="pb-3 px-4 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-600 text-[11px] font-bold">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Point phone camera to review</span>
        </div>
        <p className="text-[10px] font-mono text-stone-400">Craftsmanship • Heritage • Direct Google Maps</p>
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 mt-2" />
      </div>
    </div>
  );
}
