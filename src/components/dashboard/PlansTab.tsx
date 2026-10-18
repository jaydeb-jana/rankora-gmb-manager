import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Crown,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Edit,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { PricingPlan } from '../../types';

export function PlansTab() {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getPricingPlans().then((data) => {
      if (isMounted) {
        setPlans(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getWhatsAppUrl = (plan: PricingPlan) => {
    const defaultText = `Hello Arventa Ventures, I would like to activate the ${plan.name} (${billingCycle} billing) for my RANKORA Google Business Profile automation.`;
    const msg = encodeURIComponent(plan.whatsAppText || defaultText);
    return `https://wa.me/917872490719?text=${msg}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold border border-[#d2e3fc]">
          <Crown className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Membership &amp; Subscription Plans</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
          Flexible Plans Tailored for Your Growth
        </h1>

        <p className="text-sm sm:text-base text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
          Upgrade your Google Business Profile review automation with official Google QR counter stands, Gemini 3.8 Flash AI generation, and verified owner replies.
        </p>

        {/* Billing Switcher Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 bg-[#f1f3f4] rounded-xl border border-[#dadce0] shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-[#1a73e8] shadow-xs'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#e6f4ea] text-[#137333]">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Cards: Pro Plan, Ultra Plan, etc. */}
      <div
        className={`grid gap-6 sm:gap-8 items-stretch ${
          plans.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : plans.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {plans.map((p) => {
          const isUltraOrPopular = p.isPopular;
          const displayPrice = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
          const annualTotal = p.yearlyPrice * 12;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative transition-all ${
                isUltraOrPopular
                  ? 'border-2 border-[#1a73e8] shadow-md hover:shadow-lg'
                  : 'border border-[#dadce0] shadow-xs hover:border-[#1a73e8]/50'
              }`}
            >
              {/* Popular Badge */}
              {isUltraOrPopular && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-[#1a73e8] to-[#1557b0] text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#f9ab00]" />
                  <span>Most Popular &bull; Recommended</span>
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
                        isUltraOrPopular
                          ? 'bg-[#e8f0fe] text-[#1a73e8]'
                          : 'bg-[#f1f3f4] text-[#3c4043]'
                      }`}
                    >
                      {isUltraOrPopular ? (
                        <Crown className="w-5 h-5 text-[#1a73e8]" />
                      ) : (
                        <Zap className="w-5 h-5 text-[#1a73e8]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#202124] tracking-tight">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#5f6368]">{p.tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-2 border-t border-[#f1f3f4]">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl sm:text-4xl font-extrabold ${
                        isUltraOrPopular ? 'text-[#1a73e8]' : 'text-[#202124]'
                      }`}
                    >
                      {p.currency}
                      {displayPrice}
                    </span>
                    <span className="text-xs font-medium text-[#5f6368]">/ month</span>
                  </div>
                  <p className="text-[11px] text-[#5f6368] mt-1">
                    {billingCycle === 'yearly'
                      ? `Billed annually at ${p.currency}${annualTotal.toLocaleString()} / year`
                      : 'Billed monthly, cancel anytime'}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-3 pt-2">
                  <span
                    className={`text-xs font-bold block uppercase tracking-wider ${
                      isUltraOrPopular ? 'text-[#1a73e8]' : 'text-[#202124]'
                    }`}
                  >
                    What's included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-[#3c4043]">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isUltraOrPopular ? 'text-[#1a73e8]' : 'text-[#1e8e3e]'
                          }`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={getWhatsAppUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    showSuccess(
                      `Activating ${p.name} (${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}). Opening WhatsApp support...`
                    )
                  }
                  className={`w-full py-3 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isUltraOrPopular
                      ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xs'
                      : 'bg-white hover:bg-[#f8f9fa] border-2 border-[#1a73e8] text-[#1a73e8] shadow-2xs'
                  }`}
                >
                  <span>Choose {p.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arventa Ventures Performance & Direct Contact Callout */}
      <div className="p-5 sm:p-6 bg-[#f8fafd] border border-[#d2e3fc] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#202124]">
              Need a Custom Enterprise Setup or Have Questions?
            </h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Talk directly with our parent company <strong>Arventa Ventures</strong> via WhatsApp or email for custom billing and agency packages.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/917872490719?text=Hello%20Arventa%20Ventures,%20I%20have%20an%20inquiry%20regarding%20RANKORA%20Plans"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Chat on WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
