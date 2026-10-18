import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Upload,
  Image as ImageIcon,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BusinessSettingsTabProps {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function BusinessSettingsTab({
  settings,
  onUpdateSettings,
}: BusinessSettingsTabProps) {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [saving, setSaving] = useState(false);

  // 1. Business Identity
  const [businessName, setBusinessName] = useState(settings?.businessName || '');
  const [businessLogo, setBusinessLogo] = useState(settings?.businessLogo || '');
  const [logoFileName, setLogoFileName] = useState('');
  const [logoFileSize, setLogoFileSize] = useState('');
  const [logoError, setLogoError] = useState('');

  // 2. Owner Details
  const [ownerFullName, setOwnerFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const email = user?.email || '';

  // 3. Google Maps Integration
  const [googleReviewUrl, setGoogleReviewUrl] = useState(settings?.googleReviewUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local form inputs when settings prop updates
  useEffect(() => {
    if (settings) {
      if (settings.businessName !== undefined) {
        setBusinessName(settings.businessName);
      }
      if (settings.businessLogo !== undefined) {
        setBusinessLogo(settings.businessLogo || '');
      }
      if (settings.googleReviewUrl !== undefined) {
        setGoogleReviewUrl(settings.googleReviewUrl || '');
      }
    }
  }, [settings]);

  // Synchronize owner inputs when user auth state updates
  useEffect(() => {
    if (user) {
      if (user.fullName) setOwnerFullName(user.fullName);
      if (user.mobileNumber) setMobileNumber(user.mobileNumber);
    }
  }, [user]);

  // Clean, high-quality, transparency-preserving image compressor
  const processLogoFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 1. If SVG, read directly as data URL to preserve 100% crisp vector sharpness
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // 2. For Raster Images (PNG, JPG, WebP), resize cleanly to max 420x420 while preserving alpha transparency
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 420;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          // Clear with transparent alpha channel
          ctx.clearRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // For PNG and WebP, preserve PNG format so transparent backgrounds never turn black
          const isTransparent = file.type === 'image/png' || file.type === 'image/webp';
          if (isTransparent) {
            try {
              // Try webp with transparency first for ultra-lightweight size
              const webp = canvas.toDataURL('image/webp', 0.9);
              if (webp.startsWith('data:image/webp')) {
                resolve(webp);
                return;
              }
            } catch {}
            // Fallback to standard PNG
            resolve(canvas.toDataURL('image/png'));
          } else {
            // For standard JPEG/others
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          }
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Logo File Selection with instant preview
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError('');

    if (!file.type.startsWith('image/')) {
      setLogoError('Invalid file type. Please upload an image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setLogoError(`Selected file is ${sizeMb} MB. Maximum allowed file size is 5 MB.`);
      return;
    }

    try {
      const processedDataUrl = await processLogoFile(file);
      setBusinessLogo(processedDataUrl);
      setLogoFileName(file.name);
      const approxKb = Math.round((processedDataUrl.length * 3) / 4 / 1024);
      setLogoFileSize(`${approxKb} KB`);
      showSuccess('Logo loaded! Click "Save Changes" to apply across all portals.');
    } catch {
      setLogoError('Failed to process image file. Please try another image.');
    }
  };

  const handleRemoveLogo = () => {
    setBusinessLogo('');
    setLogoFileName('');
    setLogoFileSize('');
    setLogoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogoError('');

    if (!businessName.trim()) {
      showError('Please enter a business name.');
      return;
    }

    if (!ownerFullName.trim()) {
      showError('Please enter owner full name.');
      return;
    }

    if (!mobileNumber.trim()) {
      showError('Please enter mobile number.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateBusinessSettings({
        businessName: businessName.trim(),
        businessLogo: businessLogo, // passes empty string if removed, or valid data URL
        fullName: ownerFullName.trim(),
        mobileNumber: mobileNumber.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Business profile and logo saved successfully!');
        if (res.settings) {
          onUpdateSettings(res.settings);
        }
        if (res.user) {
          refreshUser();
        }
      }
    } catch {
      showError('Failed to save business settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* SECTION 1: BUSINESS IDENTITY (Logo & Business Name) */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#f1f3f4] pb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#202124] tracking-tight">
                Business Identity
              </h3>
              <p className="text-xs text-[#5f6368]">
                Store name and brand logo for QR stand cards, table displays, and public review pages.
              </p>
            </div>
          </div>
        </div>

        {/* Business Logo Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider">
              Business Logo
            </label>
            <span className="text-[11px] font-medium text-[#5f6368]">
              PNG (with transparent background), JPG, WebP, SVG &bull; Max 5MB
            </span>
          </div>

          <div className="p-5 sm:p-6 bg-[#f8fafd] border border-[#e2e8f0] rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors">
            {/* Circular Logo Preview Avatar with subtle alpha checkerboard pattern */}
            <div
              className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#94a3b8] bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all"
              style={{
                backgroundImage: businessLogo
                  ? 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)'
                  : 'none',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              {businessLogo ? (
                <>
                  <img
                    src={businessLogo}
                    alt={businessName || 'Business Logo'}
                    className="w-full h-full object-cover rounded-full select-none"
                  />
                  <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#137333] text-white shadow-xs border-2 border-white">
                    Ready
                  </span>
                </>
              ) : (
                <div className="text-center p-3 select-none">
                  <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center mx-auto mb-1 text-[#5f6368]">
                    <ImageIcon className="w-5 h-5 text-[#80868b]" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#5f6368] block leading-tight">
                    Upload Logo
                  </span>
                </div>
              )}
            </div>

            {/* Logo Upload & Management Actions */}
            <div className="flex-1 w-full space-y-3 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
                id="business-logo-input"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <label
                  htmlFor="business-logo-input"
                  className="px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{businessLogo ? 'Change Business Logo' : 'Upload Business Logo'}</span>
                </label>

                {businessLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-4 py-2.5 bg-white hover:bg-[#fce8e6] border border-[#dadce0] hover:border-[#f5c2c7] text-[#c5221f] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              {logoFileName ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e6f4ea] border border-[#ceead6] text-xs font-medium text-[#137333]">
                  <CheckCircle2 className="w-4 h-4 text-[#1e8e3e] shrink-0" />
                  <span>{logoFileName} {logoFileSize && `(${logoFileSize})`}</span>
                </div>
              ) : (
                <p className="text-xs text-[#5f6368] leading-relaxed max-w-lg">
                  Transparent PNG or high-contrast SVG recommended for best quality on printed QR acrylic stands and public review pages.
                </p>
              )}
            </div>
          </div>

          {logoError && (
            <div className="p-3.5 bg-[#fce8e6] border border-[#f5c2c7] rounded-xl text-xs text-[#c5221f] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{logoError}</span>
            </div>
          )}
        </div>

        {/* Business Name Field */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider">
            Business Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Arventa Ventures / EcoMart Official"
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#dadce0] rounded-xl text-sm font-semibold text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-[#5f6368]">
            This name represents your company, store, or agency independently from the owner's personal name.
          </p>
        </div>
      </div>

      {/* SECTION 2: OWNER ACCOUNT DETAILS */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-[#f1f3f4] pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#202124] tracking-tight">
              Owner Account Information
            </h3>
            <p className="text-xs text-[#5f6368]">
              Owner administrator profile and security contact details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Owner Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#202124]">
              Owner Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={ownerFullName}
                onChange={(e) => setOwnerFullName(e.target.value)}
                placeholder="e.g., Jaydeb Jana"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-[#5f6368]">
              Personal name of the business owner or primary administrator.
            </p>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#202124]">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g., +91 8001608004"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-[#5f6368]">
              Registered contact phone number for customer inquiries and alerts.
            </p>
          </div>
        </div>

        {/* Registered Email (Strictly Non-Editable / Locked) */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#202124] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>Registered Email Address</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6]">
              <Lock className="w-3 h-3 text-[#1e8e3e]" />
              <span>Verified Account Email</span>
            </span>
          </div>

          <div className="relative">
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-10 pr-10 py-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-sm font-medium text-[#5f6368] cursor-not-allowed select-all shadow-2xs"
            />
            <Mail className="w-4 h-4 text-[#80868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Lock className="w-4 h-4 text-[#80868b] absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <p className="text-[11px] text-[#5f6368] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#137333] shrink-0" />
            <span>Email is locked to protect your account ownership and security authentication.</span>
          </p>
        </div>
      </div>

      {/* SECTION 3: GOOGLE MAPS REVIEW LINK */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-[#f1f3f4] pb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#202124] tracking-tight">
                Google Maps Review Link
              </h3>
              <p className="text-xs text-[#5f6368]">
                Where customers submit their 5-star ratings directly onto Google Maps.
              </p>
            </div>
          </div>
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#1a73e8] hover:underline inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8f0fe] rounded-full border border-[#d2e3fc] cursor-pointer shrink-0 transition-colors"
            >
              <span>Test Live Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#202124]">
            Google Review Submission URL
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-[#5f6368]">
            Enter your Google Business Profile review link or Google Maps write-review URL.
          </p>
        </div>
      </div>

      {/* SECTION 4: SAVE CHANGES ACTION */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#202124]">
            Ready to update your business profile?
          </h4>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Changes will immediately reflect on your review link, QR stands, and dashboard.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
}
