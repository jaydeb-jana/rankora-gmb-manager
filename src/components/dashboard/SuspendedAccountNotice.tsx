import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  MessageCircle,
  Phone,
  Mail,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Lock,
  FileText,
  Clock,
} from 'lucide-react';
import { CustomerUser } from '../../types';

interface SuspendedAccountNoticeProps {
  user: CustomerUser;
  businessName?: string;
  onLogout: () => void;
}

export function SuspendedAccountNotice({
  user,
  businessName,
  onLogout,
}: SuspendedAccountNoticeProps) {
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  const partnerWhatsAppNumber = '+91 7872490719';
  const partnerRawNumber = '917872490719';
  const partnerEmail = 'info@arventaventures.online';

  const waMessage = encodeURIComponent(
    `Hello Partner,\nMy Google Business Profile account has been suspended.\nAccount Email: ${user.email}\nBusiness Name: ${businessName || user.fullName}\nStatus: Suspended by Google Policy Review.\nPlease help me appeal and resolve this violation.`
  );
  const waUrl = `https://wa.me/${partnerRawNumber}?text=${waMessage}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(partnerWhatsAppNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full pb-4 border-b border-[#dadce0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Google Store Canopy Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-[#dadce0] shadow-2xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M4 10V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 7L4.5 4H19.5L22 7L20 10H4L2 7Z" fill="#1A73E8" />
              <path d="M7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 10" stroke="#EA4335" strokeWidth="2" />
              <path d="M11 10C11 11.1046 10.1046 12 9 12C7.89543 12 7 10" stroke="#FBBC04" strokeWidth="2" />
              <path d="M15 10C15 11.1046 14.1046 12 13 12C11.8954 12 11 10" stroke="#34A853" strokeWidth="2" />
              <path d="M19 10C19 11.1046 18.1046 12 17 12C15.8954 12 15 10" stroke="#1A73E8" strokeWidth="2" />
              <path d="M9 20V14H15V20" stroke="#1A73E8" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-[#202124] tracking-tight">
                Google Business Profile
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fce8e6] text-[#d93025] border border-[#fad2cf]">
                POLICY ENFORCEMENT
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#5f6368]">
              Trust &amp; Safety Compliance Division
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5f6368] hover:text-[#d93025] bg-white border border-[#dadce0] rounded-lg hover:bg-[#fce8e6]/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Alert Container */}
      <main className="max-w-4xl mx-auto w-full my-6 space-y-6">
        {/* Urgent Policy Violation Banner */}
        <div className="bg-white rounded-2xl border-2 border-[#d93025] shadow-lg overflow-hidden">
          <div className="bg-[#d93025] px-6 py-4 text-white flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Official Google Notice: Your Site Access and Services Have Been Suspended
                </h1>
                <p className="text-xs text-red-100 font-medium">
                  Enforced by Google Business Profile Trust &amp; Safety Compliance Team
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#d93025] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
              SUSPENDED
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Primary Violation Description in English */}
            <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#d93025] shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-[#b31412]">
                    Account Suspended Due to Policy &amp; Legal Framework Violations
                  </h2>
                  <p className="text-sm text-[#3c4043] leading-relaxed">
                    Following an internal review by the <strong>Google Trust &amp; Safety Compliance Team</strong>, this site and associated business profile have been found in direct violation of legal frameworks or Google Business Profile engagement policies. Consequently, all public review landing pages, custom QR stand redirections, and automated AI reply systems have been deactivated across the Google network.
                  </p>
                  <p className="text-xs text-[#5f6368] leading-relaxed italic">
                    &ldquo;This site has been suspended by official Google staff due to a direct violation of legal frameworks or Google Business Profile content and engagement guidelines.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Case Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f6368]">
                  <FileText className="w-4 h-4 text-[#1a73e8]" />
                  <span>Account &amp; Business Information</span>
                </div>
                <div className="text-sm font-bold text-[#202124]">
                  {businessName || user.fullName || 'Business Owner'}
                </div>
                <div className="text-xs text-[#5f6368] font-mono">
                  {user.email}
                </div>
                <div className="text-[11px] text-[#70757a]">
                  Account ID: <span className="font-mono">{user.id}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5f6368]">
                  <Clock className="w-4 h-4 text-[#d93025]" />
                  <span>Enforcement Status</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fce8e6] text-[#d93025] text-xs font-bold">
                  <span>Suspended / Under Regulatory Review</span>
                </div>
                <div className="text-xs text-[#5f6368]">
                  Enforcement Body: <strong>Official Google Policy Compliance Team</strong>
                </div>
                <div className="text-[11px] text-[#70757a]">
                  Impacted Features: QR Stands, Review Collection, and AI Auto-Replies Disabled
                </div>
              </div>
            </div>

            {/* "CONTACT TO PARTNER" SECTION */}
            <div className="bg-gradient-to-br from-[#f0fdf4] to-[#e6f4ea] border-2 border-[#34A853] rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ceead6]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e8e3e] text-white text-xs font-bold tracking-wide mb-2 shadow-2xs">
                    <span>CONTACT TO PARTNER</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#137333]">
                    Contact Authorized Partner for Assistance &amp; Appeal
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3c4043] mt-1">
                    To resolve compliance violations or request account reinstatement, please get in touch directly with our authorized regional partner via WhatsApp.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-[#1e8e3e] uppercase tracking-wider block">
                    Authorized Regional Partner
                  </span>
                  <span className="text-sm font-extrabold text-[#202124]">
                    Arventa Ventures
                  </span>
                </div>
              </div>

              {/* WhatsApp Action Card */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Message Partner on WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#ceead6]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#e6f4ea] flex items-center justify-center text-[#1e8e3e]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[#5f6368]">
                        WhatsApp &amp; Helpline Number
                      </div>
                      <a
                        href={`tel:${partnerWhatsAppNumber}`}
                        className="text-sm font-bold text-[#202124] hover:text-[#1a73e8] tracking-wider"
                      >
                        {partnerWhatsAppNumber}
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    title="Copy Phone Number"
                    className="p-2 rounded-lg bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] transition-colors cursor-pointer"
                  >
                    {copiedNumber ? (
                      <Check className="w-4 h-4 text-[#1e8e3e]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Partner Contact Details Info */}
              <div className="mt-4 pt-4 border-t border-[#ceead6] flex items-center justify-between flex-wrap gap-2 text-xs text-[#5f6368]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#1e8e3e]" />
                  <span>Official Partner Email:</span>
                  <a
                    href={`mailto:${partnerEmail}`}
                    className="font-medium text-[#1a73e8] hover:underline"
                  >
                    {partnerEmail}
                  </a>
                </div>
                <div>
                  Support Hours: Mon – Sat (10:00 AM – 8:00 PM IST)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-4 text-center text-xs text-[#5f6368] border-t border-[#dadce0]">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="font-semibold text-[#202124]">Google Business Profile Support</span>
          <span>&bull;</span>
          <span>Compliance &amp; Policy Enforcement</span>
          <span>&bull;</span>
          <span>Partner: Arventa Ventures</span>
        </div>
      </footer>
    </div>
  );
}
