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
  X,
  Tag,
  Check,
  PartyPopper,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { PricingPlan } from '../../types';
import { SkeletonCard } from '../common/LoadingScreen';

export function PlansTab() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Activation & Promo Code States
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activating, setActivating] = useState(false);

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

  const handleOpenCheckout = (plan: PricingPlan) => {
    setSelectedPlanForCheckout(plan);
    setPromoCodeInput('');
    setPromoError('');
    setActivationSuccess(false);
  };

  const handleApplyPromoCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlanForCheckout) return;

    const trimmed = promoCodeInput.trim().toLowerCase();
    if (!trimmed) {
      setPromoError('Please enter a promo code.');
      return;
    }

    if (trimmed !== 'arventaventures-free') {
      setPromoError('Invalid promo code. Please enter a valid activation code or contact support.');
      return;
    }

    setActivating(true);
    setPromoError('');
    try {
      const res = await api.activateUserPlan(selectedPlanForCheckout.id, 'arventaventures-free');
      if (res.error) {
        setPromoError(res.error);
      } else {
        await refreshUser();
        setActivationSuccess(true);
        showSuccess(`Congratulations! ${selectedPlanForCheckout.name} activated successfully.`);
      }
    } catch {
      setPromoError('Failed to activate plan. Please try again.');
    } finally {
      setActivating(false);
    }
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
          Upgrade your Google Business Profile review automation with official Google QR counter stands, intelligent Gemini Flash AI generation, and verified owner replies.
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
      {loading ? (
        <SkeletonCard count={2} />
      ) : (
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
                {user?.planId === p.id ? (
                  <div className="w-full py-3 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                    <span>Current Active Plan</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(p)}
                    className={`w-full py-3 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isUltraOrPopular
                        ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-xs'
                        : 'bg-white hover:bg-[#f8f9fa] border-2 border-[#1a73e8] text-[#1a73e8] shadow-2xs'
                    }`}
                  >
                    <span>Choose {p.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Plan Activation & Promo Code Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#dadce0] shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                  {selectedPlanForCheckout.isPopular ? (
                    <Crown className="w-4 h-4 text-[#1a73e8]" />
                  ) : (
                    <Zap className="w-4 h-4 text-[#1a73e8]" />
                  )}
                </div>
                <h3 className="font-bold text-base text-[#202124]">
                  {activationSuccess ? 'Plan Activated' : `Activate ${selectedPlanForCheckout.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForCheckout(null)}
                className="w-8 h-8 rounded-lg text-[#5f6368] hover:bg-[#dadce0]/50 hover:text-[#202124] flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {activationSuccess ? (
                /* CELEBRATORY SUCCESS VIEW */
                <div className="text-center space-y-5 py-2">
                  <div className="w-16 h-16 rounded-full bg-[#e6f4ea] border border-[#ceead6] text-[#137333] flex items-center justify-center mx-auto shadow-xs">
                    <PartyPopper className="w-8 h-8 text-[#137333]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#202124] tracking-tight">
                      🎉 Congratulations! Plan Activated!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5f6368] max-w-sm mx-auto">
                      Your account has been upgraded to <strong>{selectedPlanForCheckout.name}</strong> successfully with code <code>arventaventures-free</code>.
                    </p>
                  </div>

                  <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-[#e8eaed]">
                      <span className="text-[#5f6368]">Activated Plan:</span>
                      <span className="font-bold text-[#202124]">{selectedPlanForCheckout.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#e8eaed]">
                      <span className="text-[#5f6368]">Subscription Status:</span>
                      <span className="font-bold text-[#137333] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Active Lifetime Access
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#e8eaed]">
                      <span className="text-[#5f6368]">Promo Code:</span>
                      <span className="font-mono text-[#1a73e8] font-semibold">arventaventures-free</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-sm text-[#202124] pt-1">
                      <span>Total Amount Paid:</span>
                      <span className="text-[#137333]">₹0 (100% Free Lifetime Access)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanForCheckout(null)}
                    className="w-full py-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Done &amp; Continue
                  </button>
                </div>
              ) : (
                /* CHECKOUT & PROMO CODE VIEW */
                <div className="space-y-5">
                  {/* Plan Price Summary */}
                  <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#d2e3fc] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#202124]">
                        {selectedPlanForCheckout.name}
                      </h4>
                      <p className="text-xs text-[#5f6368]">
                        {billingCycle === 'yearly' ? 'Yearly Billing (20% Off)' : 'Monthly Billing'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-[#202124]">
                        ₹{billingCycle === 'yearly' ? selectedPlanForCheckout.yearlyPrice : selectedPlanForCheckout.monthlyPrice}
                        <span className="text-xs font-normal text-[#5f6368]"> / month</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <span className="text-[10px] text-[#5f6368]">
                          Billed annually at ₹{(selectedPlanForCheckout.yearlyPrice * 12).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo Code Activation Box */}
                  <form onSubmit={handleApplyPromoCode} className="space-y-2.5">
                    <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider text-[#5f6368] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span>Have a Promo / Activation Code?</span>
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value);
                          if (promoError) setPromoError('');
                        }}
                        placeholder="e.g. arventaventures-free"
                        className="flex-1 px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-xl text-xs sm:text-sm text-[#202124] placeholder-[#80868b] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all font-mono"
                        disabled={activating}
                      />
                      <button
                        type="submit"
                        disabled={activating || !promoCodeInput.trim()}
                        className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] disabled:text-[#80868b] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
                      >
                        {activating ? 'Applying...' : 'Apply Code'}
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-xs text-[#d93025] font-medium pt-0.5">
                        {promoError}
                      </p>
                    )}
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#e8eaed]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-[#5f6368]">or activate without promo code</span>
                    </div>
                  </div>

                  {/* Alternative: Pay / Activate via WhatsApp */}
                  <div className="space-y-2">
                    <p className="text-xs text-[#5f6368]">
                      Don't have an activation code? Connect directly with our team to activate this plan via official payment:
                    </p>
                    <a
                      href={getWhatsAppUrl(selectedPlanForCheckout)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-[#25d366] hover:bg-[#1ebd59] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Activate via WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
