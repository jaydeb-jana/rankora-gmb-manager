import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  QrCode,
  Download,
  Smartphone,
  RefreshCw,
  Palette,
  Sparkles,
  Layers,
  X,
  SlidersHorizontal,
  Eye,
  Link2Off,
  Info,
  ArrowRight,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { createQrWithCenterLogo } from '../../lib/qrWithLogo';
import { renderStandToCanvas } from '../../lib/drawStandCanvas';
import { StandPreviewCard } from './StandPreviewCard';
import { GOOGLE_QR_CENTER_LOGO, GOOGLE_QR_REMOTE_URL } from '../../constants/qrLogo';

interface ReviewLinkTabProps {
  settings: BusinessSettings;
  onOpenPublicPage: () => void;
  onUpdateSlug: (newSlug: string) => void;
  onNavigateToSettings?: () => void;
  onUpdateSettings?: (newSettings: BusinessSettings) => void;
}

export type StandLayoutType =
  | 'official-google'
  | 'split-hero'
  | 'luxury-crest'
  | 'scandi-minimal'
  | 'emerald-wellness'
  | 'artisan-vintage'
  | 'cyber-hud'
  | 'rose-boutique'
  | 'dynamic-burst'
  | 'executive-navy'
  | 'dental-clinic'
  | 'carbon-auto'
  | 'pizzeria-rustic'
  | 'fitness-volt'
  | 'diamond-luxury'
  | 'gentlemen-barber';

export interface StandTemplate {
  id: string;
  name: string;
  category: string;
  badge: string;
  layoutType: StandLayoutType;
  description: string;
  swatchColors: [string, string];
  qrColor: string;
}

export const STAND_TEMPLATES: StandTemplate[] = [
  {
    id: 'google-official',
    name: 'Google Official Canopy',
    category: 'Official & Classic',
    badge: 'Official Google',
    layoutType: 'official-google',
    description: 'Official Google 4-color stripes, "Review us on Google" badge, 5.0 gold stars, verified Maps checkmark & focus QR scanner.',
    swatchColors: ['#4285f4', '#34a853'],
    qrColor: '#1a73e8',
  },
  {
    id: 'modern-split',
    name: 'Split Horizon Obsidian',
    category: 'Tech & Gaming',
    badge: 'Trending',
    layoutType: 'split-hero',
    description: '38% deep obsidian dark banner with glowing cyan HUD badge, transitioning to an elevated QR pedestal.',
    swatchColors: ['#0b1120', '#22d3ee'],
    qrColor: '#0284c7',
  },
  {
    id: 'luxury-crest',
    name: 'Royal Gold Crest',
    category: 'Luxury & Boutique',
    badge: '24K Gold',
    layoutType: 'luxury-crest',
    description: 'Double 24k gold metallic border with brass corner ornaments, royal crest laurel framing & serif typography.',
    swatchColors: ['#0a1128', '#f59e0b'],
    qrColor: '#b45309',
  },
  {
    id: 'scandi-minimal',
    name: 'Scandinavian Noir',
    category: 'Official & Classic',
    badge: 'Minimal',
    layoutType: 'scandi-minimal',
    description: 'Swiss typography, solid black geometric frame, monospace tags & camera focus corner brackets.',
    swatchColors: ['#000000', '#71717a'],
    qrColor: '#000000',
  },
  {
    id: 'emerald-wellness',
    name: 'Emerald Eco Wellness',
    category: 'Medical & Wellness',
    badge: 'Care',
    layoutType: 'emerald-wellness',
    description: 'Sage botanical curves, green client care pill & smooth pebble-rounded QR container for clinics & spas.',
    swatchColors: ['#064e3b', '#10b981'],
    qrColor: '#059669',
  },
  {
    id: 'artisan-vintage',
    name: 'Artisan Woodcraft & Cafe',
    category: 'Food & Dining',
    badge: 'Warm Wood',
    layoutType: 'artisan-vintage',
    description: 'Stitched dashed vintage border, circular retro craft stamp & coffee-toned woodcraft plaque.',
    swatchColors: ['#ca8a04', '#422006'],
    qrColor: '#78350f',
  },
  {
    id: 'cyber-hud',
    name: 'Cyberpunk HUD Terminal',
    category: 'Tech & Gaming',
    badge: 'High-Tech',
    layoutType: 'cyber-hud',
    description: 'Futuristic terminal with neon cyan glowing HUD brackets, status pulse indicator & holographic corners.',
    swatchColors: ['#070b14', '#06b6d4'],
    qrColor: '#0891b2',
  },
  {
    id: 'rose-boutique',
    name: 'Rose Velvet & Glamour',
    category: 'Luxury & Boutique',
    badge: 'Salon & Spa',
    layoutType: 'rose-boutique',
    description: 'Roman arch canopy top with champagne typography, soft rose blush gradient & glassmorphic star ribbon.',
    swatchColors: ['#db2777', '#f472b6'],
    qrColor: '#db2777',
  },
  {
    id: 'dynamic-burst',
    name: 'Dynamic Sunset Burst',
    category: 'Food & Dining',
    badge: 'High Impact',
    layoutType: 'dynamic-burst',
    description: 'Dynamic 15-degree angled sunset gradient header block with comic pop badge & vibrant drop-shadow stars.',
    swatchColors: ['#ea580c', '#ef4444'],
    qrColor: '#ea580c',
  },
  {
    id: 'executive-navy',
    name: 'Executive Cobalt Plaque',
    category: 'Official & Classic',
    badge: 'Corporate',
    layoutType: 'executive-navy',
    description: 'Vertical cobalt accent band with silver pinstripe & formal Client Satisfaction Index seal.',
    swatchColors: ['#1e3a8a', '#94a3b8'],
    qrColor: '#1e3a8a',
  },
  {
    id: 'dental-clinic',
    name: 'Pure Clinical Dental & Med',
    category: 'Medical & Wellness',
    badge: 'Healthcare',
    layoutType: 'dental-clinic',
    description: 'Sterile healthcare cyan & teal styling, medical cross emblem, patient care guarantee & crisp hygienic QR pedestal.',
    swatchColors: ['#0284c7', '#0d9488'],
    qrColor: '#0284c7',
  },
  {
    id: 'carbon-auto',
    name: 'Motorsport Carbon Weave',
    category: 'Sports & Automotive',
    badge: 'Garage & Auto',
    layoutType: 'carbon-auto',
    description: 'Dark carbon weave styling, racing red speed stripes, bold mechanic typography & high-impact red caliper focus corners.',
    swatchColors: ['#18181b', '#dc2626'],
    qrColor: '#dc2626',
  },
  {
    id: 'pizzeria-rustic',
    name: 'Authentic Italian Trattoria',
    category: 'Food & Dining',
    badge: 'Pizzeria',
    layoutType: 'pizzeria-rustic',
    description: 'Warm Tuscan cream canvas with tricolor Italian ribbon, artisanal olive laurels & wood-fired bistro lettering.',
    swatchColors: ['#991b1b', '#15803d'],
    qrColor: '#b91c1c',
  },
  {
    id: 'fitness-volt',
    name: 'Iron Volt Athletic & Gym',
    category: 'Sports & Automotive',
    badge: 'Fitness & Gym',
    layoutType: 'fitness-volt',
    description: 'Stealth charcoal finish with ultra-bright Neon Volt Lime accents, high-energy chevrons & performance QR container.',
    swatchColors: ['#09090b', '#84cc16'],
    qrColor: '#18181b',
  },
  {
    id: 'diamond-luxury',
    name: 'Pearl & Diamond Haute Joaillerie',
    category: 'Luxury & Boutique',
    badge: 'High Jewelry',
    layoutType: 'diamond-luxury',
    description: 'Pearl ivory texture with delicate 24k gold filigree border, sparkling diamond emblem & fine serif typography.',
    swatchColors: ['#1e293b', '#eab308'],
    qrColor: '#b45309',
  },
  {
    id: 'gentlemen-barber',
    name: "Gentlemen's Barber & Lounge",
    category: 'Specialty & Craft',
    badge: 'Barbershop',
    layoutType: 'gentlemen-barber',
    description: 'Mahogany wood grain & warm brass plaque, classic vintage barber pole ribbon & master razor heraldry.',
    swatchColors: ['#292524', '#b45309'],
    qrColor: '#78350f',
  },
];

export const QR_COLOR_PRESETS = [
  { name: 'Google Blue', color: '#1a73e8' },
  { name: 'Pure White (Dark Base)', color: '#ffffff' },
  { name: 'Pitch Black', color: '#000000' },
  { name: 'Deep Navy', color: '#1e3a8a' },
  { name: 'Emerald Green', color: '#059669' },
  { name: 'Ruby Crimson', color: '#dc2626' },
  { name: 'Royal Indigo', color: '#4f46e5' },
  { name: 'Sunset Amber', color: '#ea580c' },
  { name: 'Cyber Cyan', color: '#0891b2' },
  { name: 'Slate Gray', color: '#334155' },
];

// Check if a color has high luminance (white or ultra-light)
function checkIsLightColor(hex: string): boolean {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.72;
}

export function ReviewLinkTab({
  settings,
  onOpenPublicPage,
  onUpdateSlug,
  onNavigateToSettings,
  onUpdateSettings,
}: ReviewLinkTabProps) {
  const { showSuccess, showError } = useToast();
  const [copied, setCopied] = useState(false);

  const isMockUrl = (url?: string) =>
    Boolean(
      url &&
        (url.includes('ChIJQ6v9a_d-lDkR4Vq7hC8k97s') ||
          url.includes('ChIJQ6v9a_d-IDkR4Vq7hC8k97s') ||
          url.includes('example.com') ||
          url.includes('placeholder'))
    );

  const hasValidReviewUrl = Boolean(
    settings?.googleReviewUrl &&
      settings.googleReviewUrl.trim().length > 0 &&
      !isMockUrl(settings.googleReviewUrl)
  );

  const [inputUrl, setInputUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  const handleSaveReviewUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      showError('Please enter your Google Review Submission URL.');
      return;
    }

    let normalized = trimmed;
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    try {
      new URL(normalized);
    } catch {
      showError('Please enter a valid web URL (e.g., https://g.page/r/.../review)');
      return;
    }

    setSavingUrl(true);
    try {
      const res = await api.updateBusinessSettings({
        googleReviewUrl: normalized,
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Google Review Submission URL linked successfully! QR Studio unlocked.');
        if (res.settings && onUpdateSettings) {
          onUpdateSettings(res.settings);
        }
      }
    } catch {
      showError('Failed to save Google Review Submission URL. Please try again.');
    } finally {
      setSavingUrl(false);
    }
  };

  // 1. Digital QR Code states (Independent, user customizable color)
  const [digitalQrDataUrl, setDigitalQrDataUrl] = useState<string>('');
  const [loadingDigitalQr, setLoadingDigitalQr] = useState<boolean>(true);
  const [digitalQrColor, setDigitalQrColor] = useState<string>('#1a73e8');

  // 2. Stand & Table Tent QR Code states (Completely isolated, always high-contrast dark)
  const [standQrDataUrl, setStandQrDataUrl] = useState<string>('');
  const [loadingStandQr, setLoadingStandQr] = useState<boolean>(true);
  const [downloadingTent, setDownloadingTent] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('google-official');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const CATEGORIES = [
    'All',
    'Official & Classic',
    'Luxury & Boutique',
    'Food & Dining',
    'Medical & Wellness',
    'Sports & Automotive',
    'Tech & Gaming',
    'Specialty & Craft',
  ];

  const selectedTemplate =
    STAND_TEMPLATES.find((t) => t.id === selectedTemplateId) || STAND_TEMPLATES[0];

  const filteredTemplates =
    activeCategory === 'All'
      ? STAND_TEMPLATES
      : STAND_TEMPLATES.filter((t) => t.category === activeCategory);

  const fullReviewUrl = `${window.location.origin}/review/${settings.customSlug}`;
  const isLightQr = checkIsLightColor(digitalQrColor);

  // Fetch Digital QR Code (re-runs when digitalQrColor changes)
  useEffect(() => {
    if (!hasValidReviewUrl) {
      setLoadingDigitalQr(false);
      return;
    }
    let isMounted = true;
    setLoadingDigitalQr(true);
    api.getQrCode(fullReviewUrl, digitalQrColor)
      .then(async (data) => {
        if (isMounted && data.qrDataUrl) {
          const composited = await createQrWithCenterLogo(
            data.qrDataUrl,
            GOOGLE_QR_CENTER_LOGO
          );
          if (isMounted) {
            setDigitalQrDataUrl(composited);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load digital QR code:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingDigitalQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fullReviewUrl, digitalQrColor, hasValidReviewUrl]);

  // Stand QR code color dynamically synchronizes with the selected template's matching theme color
  const standQrColor = selectedTemplate.qrColor || '#1a73e8';

  // Fetch Stand QR Code (dynamically matches the selected template's theme color)
  useEffect(() => {
    if (!hasValidReviewUrl) {
      setLoadingStandQr(false);
      return;
    }
    let isMounted = true;
    setLoadingStandQr(true);
    api.getQrCode(fullReviewUrl, standQrColor)
      .then(async (data) => {
        if (isMounted && data.qrDataUrl) {
          const composited = await createQrWithCenterLogo(
            data.qrDataUrl,
            GOOGLE_QR_CENTER_LOGO
          );
          if (isMounted) {
            setStandQrDataUrl(composited);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load stand QR code:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingStandQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fullReviewUrl, standQrColor, hasValidReviewUrl]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTemplateModalOpen) {
        setIsTemplateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTemplateModalOpen]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullReviewUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullReviewUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showSuccess('Review landing page URL copied to clipboard.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showError('Unable to copy to clipboard.');
    }
  };

  // Direct QR Code Download (PNG with center logo in selected color)
  const handleDownloadQr = () => {
    if (!digitalQrDataUrl) return;
    const a = document.createElement('a');
    a.href = digitalQrDataUrl;
    a.download = `${settings.customSlug || 'business'}-google-review-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess('High-resolution QR code image downloaded.');
  };

  // High-Resolution 4x6" Table Stand Design Generator (1200 x 1800 px) using standQrDataUrl
  const handleDownloadTent = async () => {
    if (!standQrDataUrl) {
      showError('Counter stand QR code is still generating. Please wait a moment.');
      return;
    }

    setDownloadingTent(true);
    try {
      const canvas = document.createElement('canvas');
      await renderStandToCanvas(canvas, selectedTemplate, settings, standQrDataUrl);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const safeSlug = (settings.businessName || 'table-stand')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      a.download = `${safeSlug}-${selectedTemplate.id}-stand.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showSuccess(`"${selectedTemplate.name}" table stand downloaded!`);
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to generate table stand image.');
    } finally {
      setDownloadingTent(false);
    }
  };

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = STAND_TEMPLATES.find((t) => t.id === tmplId);
    showSuccess(`Selected "${tmpl?.name || 'Template'}" layout.`);
  };

  if (!hasValidReviewUrl) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-[#f1f3f4] pb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#fef7e0] border border-[#feefc3] text-[#b06000] flex items-center justify-center shrink-0 shadow-2xs">
              <Link2Off className="w-7 h-7 text-[#ea8600]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
                  Google Review Submission URL Required
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#fef7e0] text-[#b06000] border border-[#fce8b2]">
                  Action Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5f6368]">
                Please provide your official Google Review Submission URL first. This page, your review link, and QR stands cannot be generated without it.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-xs sm:text-sm text-[#3c4043] space-y-2">
            <p className="font-semibold text-[#202124] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1a73e8] shrink-0" />
              <span>Why is this required before opening this page?</span>
            </p>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              When customers scan your QR counter stand or visit your review landing page, our Gemini AI drafts a genuine 5-star review and then redirects them directly to your Google Business Profile review window on Google Maps. Without this link, customers have nowhere to submit their reviews.
            </p>
          </div>

          <form onSubmit={handleSaveReviewUrl} className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider text-[11px] text-[#5f6368]">
              Enter Your Google Review Submission URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5f6368]">
                  <LinkIcon className="w-4 h-4 text-[#1a73e8]" />
                </div>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#dadce0] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#80868b] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all shadow-2xs font-mono"
                  disabled={savingUrl}
                />
              </div>
              <button
                type="submit"
                disabled={savingUrl || !inputUrl.trim()}
                className="px-6 py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] disabled:text-[#80868b] disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                {savingUrl ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving URL...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save &amp; Unlock Page</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {onNavigateToSettings && (
            <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-[#5f6368]">
                Prefer to configure it from your business profile?
              </span>
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="font-semibold text-[#1a73e8] hover:text-[#1557b0] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Go to Business Profile Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="border-t border-[#f1f3f4] pt-6 space-y-3">
            <h3 className="font-bold text-[#202124] text-xs uppercase tracking-wider text-[#5f6368]">
              How to find your official Google Review Link in 4 steps:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#dadce0] bg-[#f8f9fa] space-y-1">
                <span className="font-bold text-[#1a73e8]">Step 1: Search Your Business</span>
                <p className="text-[#5f6368]">
                  Open Google Search or Google Maps and search for your business name.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#dadce0] bg-[#f8f9fa] space-y-1">
                <span className="font-bold text-[#1a73e8]">Step 2: Ask for Reviews</span>
                <p className="text-[#5f6368]">
                  In your Google Business Profile panel, click the <strong>"Ask for reviews"</strong> button.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#dadce0] bg-[#f8f9fa] space-y-1">
                <span className="font-bold text-[#1a73e8]">Step 3: Copy Short Link</span>
                <p className="text-[#5f6368]">
                  Copy the review URL provided by Google (e.g., <code>https://g.page/r/.../review</code>).
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#dadce0] bg-[#f8f9fa] space-y-1">
                <span className="font-bold text-[#1a73e8]">Step 4: Paste &amp; Unlock</span>
                <p className="text-[#5f6368]">
                  Paste the link into the box above and click <strong>"Save &amp; Unlock Page"</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Info */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#202124]">
              Review Landing Page Link &amp; In-Store QR Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5 leading-relaxed">
              Share your direct customer review landing page or generate print-ready 4x6" counter stands with custom designs.
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Customer Review URL Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs space-y-3">
        <span className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider block">
          Your Dedicated Customer Review Landing Page
        </span>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <LinkIcon className="w-4 h-4 text-[#1a73e8] shrink-0" />
            <span className="text-xs sm:text-sm font-mono font-medium text-[#202124] truncate">
              {fullReviewUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                copied
                  ? 'bg-[#1e8e3e] text-white'
                  : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onOpenPublicPage}
              className="px-3.5 py-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#3c4043] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Preview Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN STUDIO: DIGITAL QR CODE & COUNTER STAND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. HIGH-RESOLUTION QR CODE (DIGITAL) */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2 border-b border-[#dadce0] pb-3.5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                  High-Resolution QR Code (Digital)
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Direct PNG export with Level-H error correction for instant mobile camera detection.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-full border border-[#d2e3fc] shrink-0 whitespace-nowrap">
                Center Logo Embedded
              </span>
            </div>

            <div
              className={`flex justify-center items-center p-6 rounded-2xl border max-w-xs mx-auto transition-colors shadow-2xs ${
                isLightQr
                  ? 'bg-[#0b1120] border-[#334155]'
                  : 'bg-[#f8f9fa] border-[#dadce0]'
              }`}
            >
              {loadingDigitalQr ? (
                <div className="w-52 h-52 flex items-center justify-center text-[#5f6368]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={digitalQrDataUrl}
                    alt={`Google Review QR code for ${settings.businessName}`}
                    className={`w-52 h-52 rounded-xl shadow-xs p-2 transition-all ${
                      isLightQr ? 'bg-[#0b1120]' : 'bg-white'
                    }`}
                  />
                </div>
              )}
            </div>

            {isLightQr && (
              <div className="mt-2.5 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  Dark contrast preview active for white / light QR scan visibility
                </span>
              </div>
            )}

            {/* QR Code Color Customizer */}
            <div className="mt-4 p-3.5 sm:p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#202124] block leading-tight whitespace-nowrap">
                      QR Code Color
                    </span>
                    <span className="text-[10px] text-[#5f6368] block leading-tight truncate">
                      Digital QR download only
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                    style={{ backgroundColor: digitalQrColor }}
                  />
                  <span className="font-mono text-[11px] font-semibold text-[#3c4043] uppercase bg-white px-2 py-0.5 rounded-md border border-[#dadce0] shadow-2xs">
                    {digitalQrColor}
                  </span>
                </div>
              </div>

              {/* Color Swatches Grid + Custom Picker */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {QR_COLOR_PRESETS.map((preset) => {
                  const isActive = digitalQrColor.toLowerCase() === preset.color.toLowerCase();
                  const isPresetLight = checkIsLightColor(preset.color);
                  return (
                    <button
                      key={preset.color}
                      type="button"
                      title={preset.name}
                      onClick={() => setDigitalQrColor(preset.color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                        isPresetLight ? 'border-2 border-[#5f6368]/40' : 'border border-black/15'
                      } ${
                        isActive
                          ? 'ring-2 ring-offset-2 ring-[#1a73e8] scale-110 z-10'
                          : 'hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.color }}
                    >
                      {isActive && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isPresetLight ? 'text-[#202124]' : 'text-white drop-shadow-sm'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}

                {/* Custom Color Input Picker */}
                <label
                  title="Pick Custom Color"
                  className="w-7 h-7 rounded-full border border-dashed border-[#5f6368] bg-white flex items-center justify-center cursor-pointer hover:border-[#1a73e8] transition-all relative shadow-2xs group hover:scale-105"
                >
                  <input
                    type="color"
                    value={digitalQrColor}
                    onChange={(e) => setDigitalQrColor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div
                    className="w-4 h-4 rounded-full shadow-2xs"
                    style={{
                      background:
                        'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#5f6368]">
              Format: PNG (1024&times;1024px) &bull; High Res
            </span>
            <button
              type="button"
              onClick={handleDownloadQr}
              disabled={!digitalQrDataUrl}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Image</span>
            </button>
          </div>
        </div>

        {/* 2. GOOGLE REVIEW COUNTER STAND (4X6" TABLE TENT) */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Title and Change Template Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2 border-b border-[#dadce0] pb-3.5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                  Google Review Counter Stand (4x6" Table Tent)
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Print-ready counter stand display for checkout desks and customer tables.
                </p>
              </div>

              {/* Prominent Change Template Action Button */}
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] active:bg-[#c2d7fa] text-[#1a73e8] border border-[#d2e3fc] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Change Template</span>
              </button>
            </div>

            {/* Dynamic Template Preview Container with Distinct Layout using standQrDataUrl */}
            <div className="py-2">
              <StandPreviewCard
                template={selectedTemplate}
                settings={settings}
                qrDataUrl={standQrDataUrl}
              />
            </div>


            {/* Quick Active Template Summary Bar with Change Trigger */}
            <div className="mt-3 p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: selectedTemplate.swatchColors[0] }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: selectedTemplate.swatchColors[1] }}
                  />
                </div>
                <div className="min-w-0 truncate">
                  <span className="text-xs font-bold text-[#202124] block truncate">
                    {selectedTemplate.name}
                  </span>
                  <span className="text-[10px] text-[#5f6368] block truncate">
                    {selectedTemplate.category} &bull; 16 premium commercial designs available
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="text-xs font-semibold text-[#1a73e8] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Browse All (16)</span>
              </button>
            </div>
          </div>

          {/* Download Action Footer */}
          <div className="mt-6 pt-4 border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#5f6368]">
              Standard 4x6" table tent format &bull; {selectedTemplate.name}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">

              <button
                type="button"
                onClick={handleDownloadTent}
                disabled={downloadingTent || !standQrDataUrl}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                {downloadingTent ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Print PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- CHANGE TEMPLATE MODAL (16 PREMIUM DESIGNS) ----------------- */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl border border-[#dadce0] shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#dadce0] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#202124]">
                    Select Counter Stand Template (16 Premium Commercial Designs)
                  </h3>
                  <p className="text-xs text-[#5f6368] mt-0.5">
                    Click any design to immediately apply its unique geometry, branding, typography, and colors.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 sm:px-6 py-3 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
              {CATEGORIES.map((cat) => {
                const isCatActive = activeCategory === cat;
                const count =
                  cat === 'All'
                    ? STAND_TEMPLATES.length
                    : STAND_TEMPLATES.filter((t) => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isCatActive
                        ? 'bg-[#1a73e8] text-white shadow-2xs'
                        : 'bg-white text-[#5f6368] border border-[#dadce0] hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                        isCatActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#f1f3f4] text-[#5f6368]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body: 16 Templates Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
                        isSelected
                          ? 'border-[#1a73e8] bg-[#e8f0fe]/60 ring-2 ring-[#1a73e8] shadow-sm'
                          : 'border-[#dadce0] bg-white hover:border-[#1a73e8]/50 hover:bg-[#f8f9fa] hover:shadow-xs'
                      }`}
                    >
                      {/* Top Swatches & Active Checkmark */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                            style={{ backgroundColor: tmpl.swatchColors[0] }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                            style={{ backgroundColor: tmpl.swatchColors[1] }}
                          />
                          <span className="text-[10px] font-semibold text-[#5f6368] uppercase tracking-wider ml-1 truncate max-w-[110px]">
                            {tmpl.category}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-[#202124] leading-tight">
                          {tmpl.name}
                        </div>
                        <p className="text-xs text-[#5f6368] leading-relaxed line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>

                      {/* Bottom Layout Pill */}
                      <div className="mt-3 pt-2 border-t border-[#dadce0]/70 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#1a73e8]">
                          {tmpl.badge}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? 'text-[#1a73e8] font-bold' : 'text-[#5f6368]'
                          }`}
                        >
                          {isSelected ? 'Active Design' : 'Click to Apply'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#5f6368]">
                Currently Active: <strong className="text-[#202124]">{selectedTemplate.name}</strong>
              </span>

              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Done / Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
