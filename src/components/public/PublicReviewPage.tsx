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
  Store,
} from 'lucide-react';
import { api } from '../../lib/api';

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
    phrase: 'Needs Improvement',
    color: 'text-red-500',
    activeBg: 'bg-red-50 border-red-300 ring-2 ring-red-200',
  },
  {
    rating: 2,
    emoji: '🙁',
    label: 'Poor',
    phrase: 'Below Expectations',
    color: 'text-orange-500',
    activeBg: 'bg-orange-50 border-orange-300 ring-2 ring-orange-200',
  },
  {
    rating: 3,
    emoji: '😐',
    label: 'Average',
    phrase: 'Satisfactory Experience',
    color: 'text-yellow-600',
    activeBg: 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200',
  },
  {
    rating: 4,
    emoji: '😊',
    label: 'Good',
    phrase: 'Great Experience • Highly Satisfied',
    color: 'text-blue-500',
    activeBg: 'bg-blue-50 border-blue-300 ring-2 ring-blue-200',
  },
  {
    rating: 5,
    emoji: '😍',
    label: 'Outstanding!',
    phrase: 'Loved it! • Highly Recommended!',
    color: 'text-emerald-600',
    activeBg: 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200',
  },
];

const DEFAULT_HIGHLIGHT_CHIPS = [
  '🌟 Friendly & Welcoming Staff',
  '⚡ Quick & Prompt Service',
  '💎 Exceptional Quality',
  '🧼 Clean & Hygienic Space',
  '💰 Great Value for Money',
  '🤝 Helpful & Honest Guidance',
  '🏆 Highly Recommended',
  '🎯 Attention to Detail',
  '🛋️ Wonderful Atmosphere',
  '📦 Great Packaging & Care',
  '💯 Authentic & Trustworthy',
  '✨ Smooth & Easy Experience',
];

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
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
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
          // Pre-select first service if available
          if (data.services && data.services.length > 0) {
            setSelectedServices([data.services[0]]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setError('Unable to load business details. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

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
    try {
      const res = await api.generateDraft({
        slug,
        businessName: business?.businessName,
        category: business?.category,
        starRating,
        highlightChips: selectedChips,
        selectedServices: selectedServices,
        customNotes: aiEnhanceEnabled ? customReviewNotes : undefined,
        language: selectedLanguage,
      });

      if (res.success && res.draft) {
        setGeneratedDraft(res.draft);
      }
    } catch {
      setGeneratedDraft(
        `I had a wonderful experience at ${business?.businessName || 'this business'}! ${
          selectedChips.length > 0 ? selectedChips.join(' and ') + ' really stood out.' : ''
        } Highly recommend them!`
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
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#5f6368]">
            Loading business profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#dadce0] rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#202124]">
            Business Not Found
          </h2>
          <p className="text-xs text-[#5f6368]">
            {error || 'The requested review landing page does not exist or has been modified.'}
          </p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-medium hover:bg-[#1557b0]"
            >
              Return to Customer Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentEmojiInfo = RATING_EMOJIS.find((e) => e.rating === starRating) || RATING_EMOJIS[4];
  const availableServices = (business.services && business.services.length > 0)
    ? business.services
    : (business.productsAndServices ? business.productsAndServices.split(',').map((s) => s.trim()).filter(Boolean) : []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 px-4 sm:px-6 flex flex-col justify-between">
      {onBackToDashboard && (
        <div className="max-w-md mx-auto w-full mb-3 flex items-center justify-between text-xs">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-[#5f6368] hover:text-[#202124] font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <span className="px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-medium text-[11px]">
            Mobile View Preview
          </span>
        </div>
      )}

      {/* Main Review Generator Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Business Branding (Displays Logo if present, otherwise clean Store canopy) */}
        <div className="text-center space-y-2 pb-4 border-b border-[#dadce0]">
          {business.businessLogo ? (
            <div className="w-18 h-18 rounded-2xl bg-white border border-[#dadce0] shadow-2xs flex items-center justify-center mx-auto mb-2 overflow-hidden p-1.5">
              <img
                src={business.businessLogo}
                alt={business.businessName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#dadce0] shadow-2xs flex items-center justify-center mx-auto mb-2">
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
          )}
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">
            {business.businessName}
          </h1>
          <p className="text-xs text-[#5f6368] font-medium">
            {business.category || 'Google Business Profile'}
          </p>
        </div>

        {/* STEP 1: SERVICES & OFFERINGS (Positioned at the very top as requested) */}
        {availableServices.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#202124] flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Services & Offerings</span>
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

        {/* STEP 2: EMOJI EXPERIENCE RATING (Replaced Stars with interactive Emojis) */}
        <div className="text-center space-y-2.5 pt-1">
          <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider">
            How was your experience today?
          </label>

          <div className="flex justify-center gap-2 sm:gap-3">
            {RATING_EMOJIS.map((item) => {
              const isSelected = item.rating === starRating;
              return (
                <button
                  type="button"
                  key={item.rating}
                  onClick={() => setStarRating(item.rating)}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center cursor-pointer border transition-colors ${
                    isSelected
                      ? `${item.activeBg} shadow-xs`
                      : 'bg-white border-[#dadce0] hover:bg-[#f8f9fa] opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`${item.rating} - ${item.label}`}
                >
                  <span className="text-2xl sm:text-3xl leading-none select-none">
                    {item.emoji}
                  </span>
                  <span className="text-[9px] font-semibold text-[#5f6368] mt-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-[#202124] pt-1 flex items-center justify-center gap-1.5">
            <span>{currentEmojiInfo.emoji}</span>
            <span className={currentEmojiInfo.color}>{currentEmojiInfo.label}</span>
            <span className="text-[#dadce0]">&bull;</span>
            <span className="text-[#5f6368] font-normal">{currentEmojiInfo.phrase}</span>
          </p>
        </div>

        {/* STEP 3: WHAT STOOD OUT THE MOST? */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              What stood out the most? (Tap to select)
            </label>
            <span className="text-[11px] text-[#5f6368]">
              Select highlights
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEFAULT_HIGHLIGHT_CHIPS.map((chip) => {
              const selected = selectedChips.includes(chip);
              return (
                <button
                  type="button"
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    selected
                      ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] ring-1 ring-[#1a73e8] shadow-2xs'
                      : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa] hover:border-[#1a73e8]/40'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: REVIEW LANGUAGE SELECTION */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Review language</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-[#dadce0] rounded-md text-[#202124] focus:outline-none focus:border-[#1a73e8]"
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
                  Add custom notes or specific feedback for AI to enhance
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
            <div className="space-y-1.5 p-3.5 bg-white border border-[#1a73e8]/30 rounded-xl shadow-xs transition-all animate-fadeIn">
              <label className="block text-xs font-semibold text-[#1a73e8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Custom Notes / Keywords to Polish</span>
              </label>
              <textarea
                rows={3}
                value={customReviewNotes}
                onChange={(e) => setCustomReviewNotes(e.target.value)}
                placeholder="e.g., I bought items here, the quality was amazing and staff helped me find exactly what I needed..."
                className="w-full p-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:bg-white focus:ring-1 focus:ring-[#1a73e8] transition-all"
              />
              <p className="text-[11px] text-[#5f6368]">
                AI will polish your words into an authentic, natural 5-star Google review.
              </p>
            </div>
          )}
        </div>

        {/* STEP 6: GENERATE DRAFT BUTTON */}
        {!generatedDraft ? (
          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={generating}
            className="w-full py-3 px-4 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating draft with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Review Draft</span>
              </>
            )}
          </button>
        ) : (
          /* Generated Draft Display Card */
          <div className="space-y-4">
            <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#dadce0] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1a73e8] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Your Review Draft</span>
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

              <textarea
                rows={4}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-3 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] leading-relaxed focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            {/* Direct 1-Click Copy & Google Redirect Action */}
            <button
              type="button"
              onClick={handleCopyAndRedirect}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-[#1e8e3e] text-white'
                  : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied! Opening Google Maps...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Review & Post on Google</span>
                  <ExternalLink className="w-4 h-4" />
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
                  <span>Did not open? Click here to open Google Maps Review box</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <p className="text-[11px] text-center text-[#5f6368] leading-normal">
              1. Tap above to copy your draft.<br />
              2. Google Maps review dialog opens.<br />
              3. Paste and post!
            </p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-[#5f6368] py-4">
        Google Business Profile Review Assistant &bull; RANKORA
      </div>
    </div>
  );
}
