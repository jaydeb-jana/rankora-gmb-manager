import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Zap,
  Sparkles,
  Bot,
  XCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export function DocsTab() {
  const { showSuccess, showError } = useToast();

  const [apiKey, setApiKey] = useState('');
  const [initialSavedKey, setInitialSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'success' | 'failed';
    message?: string;
    error?: string;
  }>({ status: 'idle' });

  // Load current API key status
  const loadKeyStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getGeminiApiKey();
      setIsConfigured(Boolean(res.configured));
      if (res.maskedKey) {
        setMaskedKey(res.maskedKey);
      }
      if (res.key) {
        setApiKey(res.key);
        setInitialSavedKey(res.key);
      }
    } catch (err) {
      console.error('Failed to load Gemini API key status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeyStatus();
  }, []);

  const isKeyModified = apiKey.trim() !== initialSavedKey.trim();

  // Handle Verify & Save
  const handleVerifyAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyToTest = apiKey.trim();

    if (!keyToTest) {
      showError('Please enter a Gemini API key to verify.');
      return;
    }

    setVerifying(true);
    setVerificationResult({ status: 'idle' });

    try {
      // 1. Send live "Hi" test request to Gemini API
      const testRes = await api.testGeminiApiKey(keyToTest);

      if (testRes.success && testRes.message) {
        // 2. Successful response from Gemini AI -> Save to Supabase
        const saveRes = await api.saveGeminiApiKey(keyToTest);

        if (saveRes.error) {
          setVerificationResult({
            status: 'failed',
            error: `API key verified, but saving to Supabase failed: ${saveRes.error}`,
          });
          showError('Failed to save verified key to Supabase.');
        } else {
          setVerificationResult({
            status: 'success',
            message: testRes.message,
          });
          setInitialSavedKey(keyToTest);
          setIsConfigured(true);
          showSuccess('✓ Gemini API verified & saved successfully!');
          await loadKeyStatus();
        }
      } else {
        // 3. Failed test response -> DO NOT SAVE
        setVerificationResult({
          status: 'failed',
          error: testRes.error || 'Invalid API Key or connection error.',
        });
        showError('Verification failed. Invalid API Key was NOT saved.');
      }
    } catch (err: any) {
      setVerificationResult({
        status: 'failed',
        error: err?.message || 'Network or authentication error occurred.',
      });
      showError('Gemini verification failed. API Key was not saved.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* API Key Input & Verification Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-7 shadow-xs space-y-5">
        {/* Responsive Header */}
        <div className="border-b border-[#dadce0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#202124] tracking-tight whitespace-nowrap">
              Gemini API Key
            </h3>

            {loading ? (
              <span className="text-[11px] text-[#5f6368] flex items-center gap-1 ml-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
              </span>
            ) : isConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6] ml-1">
                <CheckCircle2 className="w-3 h-3 text-[#1e8e3e]" />
                <span>Active &amp; Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b06000] bg-[#fef7e0] px-2.5 py-0.5 rounded-full border border-[#feefc3] ml-1">
                <AlertCircle className="w-3 h-3 text-[#b06000]" />
                <span>Not Verified</span>
              </span>
            )}
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#1a73e8] hover:text-[#1557b0] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Get Key from Google AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleVerifyAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Enter your Gemini API Key
            </label>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (verificationResult.status !== 'idle') {
                    setVerificationResult({ status: 'idle' });
                  }
                }}
                placeholder={maskedKey || 'Paste your Gemini API key here (e.g., AIzaSy... or AQ.Ab8...)'}
                className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm font-mono text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-colors shadow-2xs"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey('');
                      setVerificationResult({ status: 'idle' });
                    }}
                    className="p-1.5 text-xs text-[#5f6368] hover:text-[#202124] rounded hover:bg-[#f1f3f4]"
                    title="Clear input"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded hover:bg-[#f1f3f4] cursor-pointer"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#5f6368] mt-1.5 flex items-center gap-1.5 leading-normal">
              <ShieldCheck className="w-3.5 h-3.5 text-[#137333] shrink-0" />
              <span>
                To ensure security, API keys are tested and verified before saving. Only valid, active keys will be accepted.
              </span>
            </p>
          </div>

          {/* Verification Results Feedback Banner */}
          {verificationResult.status === 'success' && (
            <div className="p-4 rounded-xl bg-[#e6f4ea] border border-[#ceead6] text-[#137333] space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#1e8e3e] shrink-0" />
                <span>API Key Verified &amp; Saved Successfully!</span>
              </div>
              <p className="text-xs text-[#137333]">
                Your API key is valid, connected to Google AI Studio, and ready to generate reviews.
              </p>
            </div>
          )}

          {verificationResult.status === 'failed' && (
            <div className="p-4 rounded-xl bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <XCircle className="w-4 h-4 text-[#d93025] shrink-0" />
                <span>Invalid API Key — Key Was NOT Saved</span>
              </div>
              <p className="text-xs text-[#5f6368] leading-relaxed">
                {verificationResult.error || 'This API key is not valid. Please enter a valid, active API key from Google AI Studio.'}
              </p>
            </div>
          )}

          {/* Action Button: Verify & Save */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={verifying || !apiKey.trim()}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying API Key...</span>
                </>
              ) : isKeyModified || !isConfigured ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Verify &amp; Save API Key</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Re-test Connection</span>
                </>
              )}
            </button>

            {verificationResult.status === 'failed' && (
              <button
                type="button"
                onClick={async () => {
                  if (!apiKey.trim()) return;
                  try {
                    await api.saveGeminiApiKey(apiKey.trim());
                    setInitialSavedKey(apiKey.trim());
                    setIsConfigured(true);
                    showSuccess('Saved Gemini API key directly to your account profile.');
                    setVerificationResult({
                      status: 'success',
                      message: 'Key saved directly to your account profile.',
                    });
                    await loadKeyStatus();
                  } catch (e: any) {
                    showError(e?.message || 'Failed to save key.');
                  }
                }}
                className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                Save Directly (Skip Test)
              </button>
            )}

            {isKeyModified && (
              <span className="text-xs font-medium text-[#b06000] bg-[#fef7e0] px-3 py-1.5 rounded-lg border border-[#feefc3] inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#b06000]" />
                <span>Key modified. Click verify to test &amp; save.</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
