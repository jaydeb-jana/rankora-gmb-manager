import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Globe,
  ChevronLeft,
  Layers,
  CheckCircle2,
  ThumbsUp,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  MessageCircle,
  Link as LinkIcon,
  Star,
} from 'lucide-react';
import { api } from '../../lib/api';
import { LoadingScreen, GoogleReviewLoadingScreen } from '../common/LoadingScreen';
import { updatePageSeo } from '../../lib/seo';

interface PublicReviewPageProps {
  slug: string;
  onBackToDashboard?: () => void;
}

interface PublicBusinessData {
  businessName: string;
  businessLogo?: string;
  category: string;
  customSlug: string;
  googleReviewUrl: string;
  isSuspended?: boolean;
  productsAndServices?: string;
  services?: string[];
  customerExperience?: string;
  brandTone?: string;
  targetKeywords?: string[];
  languagePreferences?: Array<{ code: string; name: string; percentage: number }>;
}

const RATING_EMOJIS = [
  {
    rating: 1,
    emoji: '😡',
    label: 'Terrible',
    stars: '★☆☆☆☆',
    phrase: 'Needs Improvement',
    color: 'text-[#d93025]',
    bg: 'bg-[#fce8e6]',
    border: 'border-[#fad2cf]',
    ring: 'ring-[#d93025]/30',
  },
  {
    rating: 2,
    emoji: '🙁',
    label: 'Poor',
    stars: '★★☆☆☆',
    phrase: 'Below Expectations',
    color: 'text-[#e37400]',
    bg: 'bg-[#fef7e0]',
    border: 'border-[#feefc3]',
    ring: 'ring-[#e37400]/30',
  },
  {
    rating: 3,
    emoji: '😐',
    label: 'Okay',
    stars: '★★★☆☆',
    phrase: 'Satisfactory Experience',
    color: 'text-[#f29900]',
    bg: 'bg-[#fef7e0]',
    border: 'border-[#feefc3]',
    ring: 'ring-[#f29900]/30',
  },
  {
    rating: 4,
    emoji: '😊',
    label: 'Good',
    stars: '★★★★☆',
    phrase: 'Great Experience & Quality',
    color: 'text-[#1a73e8]',
    bg: 'bg-[#e8f0fe]',
    border: 'border-[#d2e3fc]',
    ring: 'ring-[#1a73e8]/30',
  },
  {
    rating: 5,
    emoji: '😍',
    label: 'Excellent',
    stars: '★★★★★',
    phrase: 'Loved it! Highly Recommended',
    color: 'text-[#188038]',
    bg: 'bg-[#e6f4ea]',
    border: 'border-[#ceead6]',
    ring: 'ring-[#188038]/30',
  },
];

const POSITIVE_CHIPS = [
  '🌟 Friendly & Welcoming Staff',
  '⚡ Quick & Prompt Service',
  '💎 Exceptional Quality',
  '🧼 Clean & Hygienic Space',
  '💰 Great Value for Money',
  '🤝 Helpful & Honest Guidance',
  '🏆 Exceeded Expectations',
  '🎯 Attention to Detail',
  '🛋️ Wonderful Atmosphere',
  '📦 Great Packaging & Care',
  '💯 Authentic & Trustworthy',
  '✨ Smooth & Easy Experience',
];

const NEUTRAL_CHIPS = [
  '⚖️ Average Service',
  '👌 Decent Quality',
  '⏳ Moderate Wait Time',
  '💵 Fair Pricing',
  '🔧 Needs Minor Improvement',
  '😐 Standard Experience',
  '📦 Acceptable Packaging',
  '📞 Basic Customer Support',
];

const CRITICAL_CHIPS = [
  '⚠️ Slow & Delayed Service',
  '❌ Poor Communication',
  '💸 High & Unclear Pricing',
  '👎 Unhelpful Staff Behavior',
  '🛠️ Quality Not as Expected',
  '⏳ Long Waiting Time',
  '📞 Lack of Support / Follow-up',
  '🚨 Needs Major Improvement',
];

function getChipsForRating(rating: number): string[] {
  if (rating >= 4) return POSITIVE_CHIPS;
  if (rating === 3) return NEUTRAL_CHIPS;
  return CRITICAL_CHIPS;
}

function pickLanguageByWeight(
  preferences?: Array<{ code: string; name: string; percentage?: number }>
): string {
  if (!preferences || preferences.length === 0) return 'English';

  const active = preferences.filter((p) => (Number(p.percentage) || 0) > 0);
  if (active.length === 0) return preferences[0]?.name || 'English';
  if (active.length === 1) return active[0].name;

  const total = active.reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);
  if (total <= 0) return active[0].name;

  const random = Math.random() * total;
  let running = 0;
  for (const item of active) {
    running += Number(item.percentage) || 0;
    if (random <= running) {
      return item.name;
    }
  }
  return active[0].name;
}

export function PublicReviewPage({ slug, onBackToDashboard }: PublicReviewPageProps) {
  const [business, setBusiness] = useState<PublicBusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Services selected by customer
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // 2. Interactive Emoji Rating (defaults to 5)
  const [starRating, setStarRating] = useState<number>(5);

  // 3. Highlight chips
  const [selectedChips, setSelectedChips] = useState<string[]>([
    '🌟 Friendly & Welcoming Staff',
    '💎 Exceptional Quality',
  ]);

  // 4. Preferred Language
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // 5. AI Enhanced Custom Review Toggle & Textarea
  const [aiEnhanceEnabled, setAiEnhanceEnabled] = useState<boolean>(false);
  const [customReviewNotes, setCustomReviewNotes] = useState<string>('');

  // 6. Draft generation states
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const startTime = Date.now();
    const MINIMUM_LOAD_MS = 1800; // 1.8 seconds authentic Google loading experience

    api.getPublicBusiness(slug)
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setError(data.error);
        } else {
          setBusiness(data);
          if (data.languagePreferences && data.languagePreferences.length > 0) {
            setSelectedLanguage(pickLanguageByWeight(data.languagePreferences));
          }
          // Do not pre-select any services by default - customer taps to select
          setSelectedServices([]);
        }
      })
      .catch(() => {
        if (isMounted) setError('Unable to load business details. Please try again.');
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MINIMUM_LOAD_MS - elapsed);
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, remaining);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Dynamic SEO & Structured Data for Google search crawlers
  useEffect(() => {
    if (business && !business.isSuspended) {
      updatePageSeo({
        title: `Review ${business.businessName} on Google Maps`,
        description: `Share your review for ${business.businessName}. Rate ${business.category || 'local services'}, pick your highlights, and copy organic AI review drafts.`,
        canonicalUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        ogType: 'website',
        ogImage: business.businessLogo || '/google-qr-logo.png',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: business.businessName,
          image: business.businessLogo || undefined,
          url: business.googleReviewUrl,
          description: business.productsAndServices || `Review ${business.businessName} on Google Maps`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            bestRating: '5.0',
            ratingCount: '1',
          },
        },
      });
    }
  }, [business]);

  const handleRatingChange = (newRating: number) => {
    setStarRating(newRating);
    setGeneratedDraft('');
    setGenerationError(null);
    const newChips = getChipsForRating(newRating);
    setSelectedChips([newChips[0], newChips[1]]);
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleGenerateDraft = async () => {
    setGenerating(true);
    setGenerationError(null);
    try {
      const timeoutPromise = new Promise<{ success: boolean; draft: string; error: string }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              success: false,
              draft: '',
              error: 'AI request timed out after 15 seconds. Please check your internet connection or Gemini API key quota and try again.',
            }),
          15000
        )
      );

      const draftPromise = api.generateDraft({
        slug,
        businessName: business?.businessName,
        category: business?.category,
        starRating,
        highlightChips: selectedChips,
        selectedServices: selectedServices,
        customNotes: aiEnhanceEnabled ? customReviewNotes : undefined,
        language: selectedLanguage,
      });

      const res = await Promise.race([draftPromise, timeoutPromise]);

      if (res.success && res.draft) {
        setGeneratedDraft(res.draft);
        setGenerationError(null);
      } else {
        setGeneratedDraft('');
        setGenerationError(
          res.error || 'Failed to generate review draft. Please check your Gemini API key and try again.'
        );
      }
    } catch (err: any) {
      setGeneratedDraft('');
      setGenerationError(
        err?.message || 'A network or API error occurred while connecting to Gemini AI.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAndRedirect = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedDraft);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedDraft;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      setCopied(true);
    }

    const targetUrl =
      business?.googleReviewUrl ||
      'https://search.google.com/local/writereview';

    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = targetUrl;
    }
  };

  if (loading) {
    return <GoogleReviewLoadingScreen />;
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#dadce0] rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#202124]">
            Business Not Found
          </h2>
          <p className="text-xs text-[#5f6368]">
            {error || 'The requested Google review landing page does not exist or has been modified.'}
          </p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg text-xs font-medium hover:bg-[#1557b0] transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!business.googleReviewUrl || !business.googleReviewUrl.trim()) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#fef7e0] border border-[#feefc3] text-[#b06000] mx-auto flex items-center justify-center shadow-2xs">
            <LinkIcon className="w-7 h-7 text-[#ea8600]" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#202124]">
            Google Review Link Required
          </h2>
          <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
            The business owner of <strong>{business.businessName || 'this business'}</strong> has not connected their official Google Review Submission URL yet.
          </p>
          <div className="p-3.5 bg-[#f8f9fa] rounded-xl border border-[#dadce0] text-xs text-[#5f6368] text-left space-y-1">
            <p className="font-semibold text-[#202124]">To the business owner:</p>
            <p>Please log in to your dashboard and connect your Google Review Submission URL under <strong>Review Link &amp; QR Stand</strong> to activate this review page.</p>
          </div>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-semibold hover:bg-[#1557b0] transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  if (business?.isSuspended) {
    const partnerWhatsAppNumber = '+91 7872490719';
    const partnerRawNumber = '917872490719';
    const waUrl = `https://wa.me/${partnerRawNumber}?text=${encodeURIComponent(
      `Hello Partner,\nI was visiting the review page for "${business.businessName}" (${slug}), but it shows suspended by Google Policy Review.\nPlease help resolve this legal/policy violation.`
    )}`;

    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between p-4 sm:p-6">
        {onBackToDashboard && (
          <div className="max-w-md mx-auto w-full mb-3 flex items-center justify-between text-xs">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-[#5f6368] hover:text-[#202124] font-medium transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        <div className="max-w-lg mx-auto w-full bg-white border-2 border-[#d93025] rounded-2xl shadow-md overflow-hidden my-auto">
          {/* Google Official 4-Color Canopy Stripe */}
          <div className="grid grid-cols-4 h-1.5 w-full">
            <div className="bg-[#4285F4]"></div>
            <div className="bg-[#EA4335]"></div>
            <div className="bg-[#FBBC04]"></div>
            <div className="bg-[#34A853]"></div>
          </div>

          <div className="bg-[#d93025] px-5 py-4 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-white shrink-0" />
              <div>
                <h2 className="text-base font-bold">সাইট ও পর্যালোচনা লিংক স্থগিত</h2>
                <p className="text-[11px] text-red-100">Official Google Policy Enforcement Notice</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#d93025] text-[10px] font-extrabold uppercase">
              SUSPENDED
            </span>
          </div>

          <div className="p-6 space-y-5 text-center">
            {business.businessLogo && (
              <div className="w-16 h-16 rounded-xl bg-white border border-[#dadce0] shadow-2xs mx-auto overflow-hidden p-1.5 grayscale opacity-75">
                <img src={business.businessLogo} alt={business.businessName} className="w-full h-full object-contain" />
              </div>
            )}

            <div>
              <h1 className="text-lg font-bold text-[#202124]">
                {business.businessName}
              </h1>
              <p className="text-xs text-[#5f6368] mt-0.5 font-medium">
                Google Business Profile Service
              </p>
            </div>

            <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-xl p-4 text-left space-y-2">
              <div className="text-xs font-bold text-[#b31412] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#d93025]" />
                <span>আইনি ও পলিসি নির্দেশিকা লঙ্ঘনের কারণে বন্ধ</span>
              </div>
              <p className="text-xs text-[#3c4043] leading-relaxed">
                অফিসিয়াল Google নীতি পর্যালোচনা টিম ও Google এর কর্মচারীদের নিরীক্ষার পর দেখা গেছে যে এই সাইটটি আইনি নির্দেশিকা বা Google পলিসি লঙ্ঘন করেছে। ফলে সাময়িকভাবে সমস্ত পরিষেবা বন্ধ রাখা হয়েছে।
              </p>
            </div>

            {/* Contact to Partner */}
            <div className="bg-gradient-to-br from-[#f0fdf4] to-[#e6f4ea] border-2 border-[#34A853] rounded-xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#1e8e3e] text-white text-[11px] font-bold">
                  কন্টাক্ট টু পার্টনার (CONTACT TO PARTNER)
                </span>
                <span className="text-[11px] text-[#1e8e3e] font-semibold">Arventa Ventures</span>
              </div>
              <p className="text-xs text-[#3c4043]">
                অ্যাকাউন্ট পুনরুদ্ধার ও সহায়তার জন্য পার্টনারের সাথে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন:
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp: {partnerWhatsAppNumber}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>

        <footer className="text-center text-[11px] text-[#5f6368] mt-6">
          Google Business Profile Trust &amp; Safety Network &bull; Partner: Arventa Ventures
        </footer>
      </div>
    );
  }

  const currentEmojiInfo = RATING_EMOJIS.find((e) => e.rating === starRating) || RATING_EMOJIS[4];
  const availableServices = (business.services && business.services.length > 0)
    ? business.services
    : (business.productsAndServices ? business.productsAndServices.split(',').map((s) => s.trim()).filter(Boolean) : []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 px-4 sm:px-6 flex flex-col justify-between selection:bg-[#e8f0fe] selection:text-[#1a73e8]">
      {onBackToDashboard && (
        <div className="max-w-md mx-auto w-full mb-3 flex items-center justify-between text-xs">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-[#5f6368] hover:text-[#202124] font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-medium text-[11px] border border-[#d2e3fc]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]"></span>
            Live Customer Preview
          </span>
        </div>
      )}

      {/* Main Google-Themed Review Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-[#dadce0] rounded-2xl shadow-sm overflow-hidden">
        {/* Google Official 4-Color Canopy Stripe */}
        <div className="grid grid-cols-4 h-1.5 w-full">
          <div className="bg-[#4285F4]"></div>
          <div className="bg-[#EA4335]"></div>
          <div className="bg-[#FBBC04]"></div>
          <div className="bg-[#34A853]"></div>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Business Header with Google Verified Profile styling */}
          <div className="text-center space-y-2.5 pb-4 border-b border-[#f1f3f4]">
            {business.businessLogo ? (
              <div className="relative inline-block mx-auto mb-1">
                <div className="w-20 h-20 rounded-2xl bg-white border border-[#dadce0] shadow-xs flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={business.businessLogo}
                    alt={business.businessName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1a73e8] border-2 border-white flex items-center justify-center text-white shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className="relative inline-block mx-auto mb-1">
                <div className="w-16 h-16 rounded-2xl bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center shadow-xs">
                  {/* Google Storefront / Business Icon */}
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8"/>
                    <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10" stroke="#EA4335" strokeWidth="2"/>
                    <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 11.1046 7 10" stroke="#FBBC04" strokeWidth="2"/>
                    <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 11.1046 11 10" stroke="#34A853" strokeWidth="2"/>
                    <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 11.1046 15 10" stroke="#1A73E8" strokeWidth="2"/>
                    <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1a73e8] border-2 border-white flex items-center justify-center text-white shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
                {business.businessName}
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-[#5f6368] font-medium">
                <span className="inline-flex items-center gap-1 text-[#1a73e8]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified on Google Maps
                </span>
                <span>•</span>
                <span>{business.category || 'Local Business'}</span>
              </div>
            </div>
          </div>

          {/* STEP 1: SERVICES & OFFERINGS (Positioned at the very top as requested) */}
          {availableServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5 tracking-wide">
                  <Layers className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>SERVICES & OFFERINGS</span>
                </label>
                <span className="text-[11px] text-[#5f6368]">
                  Tap what you experienced
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableServices.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => toggleService(srv)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-xs'
                          : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#1a73e8]/40'
                      }`}
                    >
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: EMOJI EXPERIENCE RATING (Spacious, well-aligned, professional Google rating scale) */}
          <div className="space-y-3 pt-1">
            <div className="text-center">
              <label className="text-xs font-bold text-[#202124] tracking-wide uppercase">
                How was your experience today?
              </label>
              <p className="text-[11px] text-[#5f6368] mt-0.5">
                Tap an emoji to select your rating
              </p>
            </div>

            {/* 5-Column Clean Layout - Emojis have ample space, labels are clean underneath */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
              {RATING_EMOJIS.map((item) => {
                const isSelected = item.rating === starRating;
                return (
                  <button
                    type="button"
                    key={item.rating}
                    onClick={() => handleRatingChange(item.rating)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer transition-transform active:scale-95"
                    aria-label={`${item.rating} star - ${item.label}`}
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected
                          ? `${item.bg} border-2 ${item.border} shadow-sm ring-2 ${item.ring} scale-105`
                          : 'bg-white border border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#bdc1c6] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl leading-none select-none">
                        {item.emoji}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs text-center leading-tight transition-colors ${
                        isSelected
                          ? `${item.color} font-bold`
                          : 'text-[#5f6368] font-medium group-hover:text-[#202124]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Google Rating Status Indicator Badge */}
            <div
              className={`py-2 px-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${currentEmojiInfo.bg} ${currentEmojiInfo.border}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold tracking-wider text-xs select-none">
                  {currentEmojiInfo.stars}
                </span>
                <span className={`font-bold ${currentEmojiInfo.color}`}>
                  {currentEmojiInfo.rating}.0 • {currentEmojiInfo.label}
                </span>
              </div>
              <span className={`text-[11px] font-medium ${currentEmojiInfo.color} truncate ml-2`}>
                "{currentEmojiInfo.phrase}"
              </span>
            </div>
          </div>

          {/* STEP 3: EXPERIENCE HIGHLIGHTS / FEEDBACK / ISSUES (Dynamically adapts to Rating) */}
          {(() => {
            const isPos = starRating >= 4;
            const isNeu = starRating === 3;
            const activeChipsList = getChipsForRating(starRating);

            return (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5 tracking-wide">
                    {isPos ? (
                      <ThumbsUp className="w-3.5 h-3.5 text-[#188038]" />
                    ) : isNeu ? (
                      <Info className="w-3.5 h-3.5 text-[#e37400]" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#d93025]" />
                    )}
                    <span>
                      {isPos
                        ? 'WHAT STOOD OUT THE MOST?'
                        : isNeu
                        ? 'WHAT WAS YOUR EXPERIENCE LIKE?'
                        : 'WHAT ISSUES DID YOU FACE?'}
                    </span>
                  </label>
                  <span className="text-[11px] text-[#5f6368]">
                    {isPos
                      ? 'Tap to select positives'
                      : isNeu
                      ? 'Tap to select feedback'
                      : 'Tap to select issues'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeChipsList.map((chip) => {
                    const selected = selectedChips.includes(chip);
                    return (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => toggleChip(chip)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                          selected
                            ? isPos
                              ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] ring-1 ring-[#1a73e8] shadow-2xs font-semibold'
                              : isNeu
                              ? 'bg-[#fef7e0] border-[#e37400] text-[#b06000] ring-1 ring-[#e37400] shadow-2xs font-semibold'
                              : 'bg-[#fce8e6] border-[#d93025] text-[#d93025] ring-1 ring-[#d93025] shadow-2xs font-semibold'
                            : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#1a73e8]/40'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* STEP 4: REVIEW LANGUAGE SELECTION */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Review language</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-[#dadce0] rounded-md text-[#202124] focus:outline-none focus:border-[#1a73e8] cursor-pointer"
            >
              {(() => {
                const configured = business.languagePreferences && business.languagePreferences.length > 0
                  ? business.languagePreferences
                  : [
                      { code: 'en', name: 'English' },
                      { code: 'hi', name: 'Hindi' },
                      { code: 'bn', name: 'Bengali' },
                    ];
                
                const extras = [
                  { code: 'en', name: 'English' },
                  { code: 'hi', name: 'Hindi' },
                  { code: 'bn', name: 'Bengali' },
                ].filter((ex) => !configured.some((c) => c.name.toLowerCase() === ex.name.toLowerCase()));

                return [...configured, ...extras].map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name}
                  </option>
                ));
              })()}
            </select>
          </div>

          {/* STEP 5: AI ENHANCE CUSTOM REVIEW OPTION (TOGGLE & INPUT BOX) */}
          <div className="pt-2 border-t border-[#f1f3f4] space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#f8fafd] to-[#e8f0fe] border border-[#d2e3fc]">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#d2e3fc] flex items-center justify-center text-[#1a73e8] shadow-2xs shrink-0">
                  <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#202124] truncate">
                    Enable AI Enhanced Custom Review
                  </div>
                  <div className="text-[11px] text-[#5f6368] truncate">
                    Add custom notes or specific feedback for AI to polish
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={aiEnhanceEnabled}
                  onChange={(e) => setAiEnhanceEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#dadce0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#dadce0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a73e8]"></div>
              </label>
            </div>

            {/* Expandable Custom Review Textarea */}
            {aiEnhanceEnabled && (
              <div className="space-y-1.5 p-3.5 bg-white border border-[#1a73e8]/30 rounded-xl shadow-xs transition-all">
                <label className="block text-xs font-semibold text-[#1a73e8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Custom Notes / Keywords to Include</span>
                </label>
                <textarea
                  rows={3}
                  value={customReviewNotes}
                  onChange={(e) => setCustomReviewNotes(e.target.value)}
                  placeholder="e.g., I bought items here, the quality was amazing and staff helped me find exactly what I needed..."
                  className="w-full p-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-1 focus:ring-[#1a73e8] transition-all"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Gemini AI will intelligently integrate your exact notes into a natural, high-converting Google review.
                </p>
              </div>
            )}
          </div>

          {/* Error Message Display if API call fails or key is missing/invalid */}
          {generationError && (
            <div className="p-4 bg-[#fce8e6] border border-[#f5c2c7] rounded-xl text-xs space-y-1.5 transition-all">
              <div className="flex items-center gap-2 font-bold text-[#c5221f]">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#d93025]" />
                <span>AI Review Generation Error</span>
              </div>
              <p className="text-[#3c4043] leading-relaxed pl-6">
                {generationError}
              </p>
            </div>
          )}

          {/* STEP 6: GENERATE DRAFT BUTTON */}
          {!generatedDraft ? (
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generating}
              className="w-full py-3.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating review with Google AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Review Draft</span>
                </>
              )}
            </button>
          ) : (
            /* Generated Draft Display Card styled like Google Maps Review Compose dialog */
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1a73e8] flex items-center gap-1.5">
                    {/* Google G logo */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Review Draft (Ready to Post)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={generating}
                    className="text-xs text-[#1a73e8] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-amber-500 py-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= starRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-[#5f6368] font-medium ml-1.5">
                    {starRating}.0 Rating
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  className="w-full p-3 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] leading-relaxed focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
              </div>

              {/* Direct 1-Click Copy & Google Redirect Action */}
              <button
                type="button"
                onClick={handleCopyAndRedirect}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#1e8e3e] hover:bg-[#188038] text-white'
                    : 'bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied! Opening Google Maps...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Review & Post on Google</span>
                    <ExternalLink className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>

              {copied && (
                <div className="text-center">
                  <a
                    href={business?.googleReviewUrl || 'https://search.google.com/local/writereview'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1a73e8] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Did not open automatically? Click here to open Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Step by step helpful guide */}
              <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3 text-[11px] text-[#5f6368] space-y-1">
                <div className="font-semibold text-[#202124] flex items-center gap-1.5 mb-1 text-xs">
                  <span>How to post your review:</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#1a73e8]">1.</span>
                  <span>Tap the button above — your review draft is copied automatically.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#1a73e8]">2.</span>
                  <span>Google Maps review box will open in a new tab.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#1a73e8]">3.</span>
                  <span>Select your stars, paste the text (Ctrl+V or tap Paste), and click Post!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Google Footer Trust Badge */}
      <div className="text-center space-y-1.5 py-5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#5f6368] font-medium">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google Business Profile Review Integration</span>
        </div>
        <p className="text-[11px] text-[#80868b]">
          Verified Local Business Partner &bull; RANKORA
        </p>
      </div>
    </div>
  );
}
