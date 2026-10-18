import React, { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { LanguagePreference } from '../../types';

export interface LanguageOption {
  code: string;
  name: string;
}

// Clean language options (English + Indian Regional Languages)
export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'hinglish', name: 'Hinglish' },
  { code: 'banglish', name: 'Banglish' },
];

const SEGMENT_COLORS = [
  '#1a73e8', // Google Blue
  '#059669', // Emerald Green
];

// Helper: Ensure 2 languages always sum to exactly 100%
function rebalanceTwoLanguages(
  current: LanguagePreference[],
  changedCode: string,
  newRawValue: number
): LanguagePreference[] {
  if (current.length <= 1) {
    return current.map((l) => ({ ...l, percentage: 100 }));
  }

  const targetVal = Math.max(0, Math.min(100, Math.round(Number(newRawValue) || 0)));
  const remaining = 100 - targetVal;

  return current.map((l) => {
    if (l.code === changedCode) {
      return { ...l, percentage: targetVal };
    }
    return { ...l, percentage: remaining };
  });
}

interface LanguageDistributionManagerProps {
  languages: LanguagePreference[];
  onChange: (updatedLanguages: LanguagePreference[]) => void;
}

export function LanguageDistributionManager({
  languages,
  onChange,
}: LanguageDistributionManagerProps) {
  // Clean up and normalize languages
  const cleanLanguages = React.useMemo(() => {
    let list = (languages || []).map((l) => ({
      ...l,
      name: l.name.replace(/\s*\([^)]*\)/g, '').trim(),
      percentage: Number(l.percentage) || 0,
    }));

    // If completely empty, default to English
    if (list.length === 0) {
      list = [{ code: 'en', name: 'English', percentage: 100 }];
    }

    // Enforce maximum 2 languages
    if (list.length > 2) {
      list = list.slice(0, 2);
    }

    // Ensure sum is 100%
    if (list.length === 1) {
      list[0].percentage = 100;
    } else if (list.length === 2) {
      const sum = list[0].percentage + list[1].percentage;
      if (sum !== 100) {
        list[1].percentage = 100 - list[0].percentage;
      }
    }
    return list;
  }, [languages]);

  // Default dropdown selection: first available language not already in list
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    const unadded = AVAILABLE_LANGUAGES.find((l) => !cleanLanguages.some((cl) => cl.code === l.code));
    return unadded ? unadded.code : 'hi';
  });

  const canAddMore = cleanLanguages.length < 2;

  // Handle Percentage Slider / Number Input Change
  const handlePercentageChange = (code: string, newPct: number) => {
    const updated = rebalanceTwoLanguages(cleanLanguages, code, newPct);
    onChange(updated);
  };

  // Add 2nd Language (Maximum 2 total)
  const handleAddLanguage = () => {
    if (!canAddMore) return;

    const opt = AVAILABLE_LANGUAGES.find((l) => l.code === selectedCode);
    if (!opt) return;
    if (cleanLanguages.some((l) => l.code === opt.code)) return;

    // Split 50% - 50%
    const currentFirst = cleanLanguages[0];
    const updated: LanguagePreference[] = [
      { ...currentFirst, percentage: 50 },
      { code: opt.code, name: opt.name, percentage: 50 },
    ];

    onChange(updated);

    // Advance dropdown to next unadded language
    const nextUnadded = AVAILABLE_LANGUAGES.find(
      (cand) => cand.code !== opt.code && !updated.some((l) => l.code === cand.code)
    );
    if (nextUnadded) {
      setSelectedCode(nextUnadded.code);
    }
  };

  // Remove language (remaining language takes 100%)
  const handleRemoveLanguage = (codeToRemove: string) => {
    if (cleanLanguages.length <= 1) return;

    const remaining = cleanLanguages.filter((l) => l.code !== codeToRemove);
    if (remaining.length > 0) {
      onChange([{ ...remaining[0], percentage: 100 }]);
    }
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-4">
      {/* Clean Header */}
      <div className="border-b border-[#dadce0] pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#202124]">
            Review Languages &amp; Percentage
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Select 1 or 2 languages for AI review drafts. Percentages automatically balance to 100%.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
          {cleanLanguages.length}/2 Languages
        </span>
      </div>

      {/* Languages List with Clean Sliders and Inputs */}
      <div className="space-y-3">
        {cleanLanguages.map((lang, index) => {
          const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
          const pct = Number(lang.percentage) || 0;
          const isSoleLanguage = cleanLanguages.length <= 1;

          return (
            <div
              key={lang.code}
              className="p-3.5 bg-white border border-[#dadce0] rounded-xl hover:border-[#b0b3b8] transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left: Language Name */}
              <div className="flex items-center gap-2.5 min-w-[150px] shrink-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm text-[#202124] block truncate">
                    {lang.name}
                  </span>
                  <span className="text-[10px] text-[#5f6368] font-mono uppercase">
                    Code: {lang.code}
                  </span>
                </div>
              </div>

              {/* Center: Range Slider */}
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  disabled={isSoleLanguage}
                  value={pct}
                  onChange={(e) => handlePercentageChange(lang.code, Number(e.target.value))}
                  className="w-full accent-[#1a73e8] h-2 bg-[#e8f0fe] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Right: Number Input & Delete */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {/* Number Input Box with % Sign */}
                <div className="relative w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={isSoleLanguage}
                    value={pct}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      handlePercentageChange(lang.code, isNaN(val) ? 0 : val);
                    }}
                    className="w-full py-1.5 pl-2.5 pr-6 text-right font-bold text-xs sm:text-sm text-[#202124] border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] disabled:bg-[#f8f9fa] disabled:opacity-75"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5f6368] pointer-events-none">
                    %
                  </span>
                </div>

                {/* Remove Button (Disabled only if sole remaining language) */}
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(lang.code)}
                  disabled={isSoleLanguage}
                  className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] disabled:opacity-20 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer shrink-0"
                  title={isSoleLanguage ? 'At least 1 language is required' : `Remove ${lang.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Language Section (Only visible when fewer than 2 languages) */}
      {canAddMore ? (
        <div className="pt-2 border-t border-[#dadce0] space-y-2.5">
          <span className="text-xs font-bold text-[#202124] block">
            Add Language (Optional, Max 2):
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs"
            >
              {AVAILABLE_LANGUAGES.map((opt) => {
                const alreadyAdded = cleanLanguages.some((l) => l.code === opt.code);
                return (
                  <option key={opt.code} value={opt.code} disabled={alreadyAdded}>
                    {opt.name} {alreadyAdded ? ' [Added]' : ''}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleAddLanguage}
              disabled={cleanLanguages.some((l) => l.code === selectedCode)}
              className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Language</span>
            </button>
          </div>
        </div>
      ) : (
        /* Notice card */
        <div className="p-3.5 bg-[#f8fafd] border border-[#d2e3fc] rounded-xl flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-[#1a73e8]">
              Maximum 2 languages selected (Percentages auto-balance to 100%)
            </div>
            <div className="text-[#5f6368] mt-0.5 leading-relaxed">
              To choose a different language, click the trash icon next to either language above to remove it first.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
