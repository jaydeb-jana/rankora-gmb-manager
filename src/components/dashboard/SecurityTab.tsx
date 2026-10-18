import React from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  KeyRound,
  FileCheck,
  Server,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Building2,
  Mail,
} from 'lucide-react';

export function SecurityTab() {
  const securityPillars = [
    {
      icon: Database,
      title: 'Row Level Security & Tenant Isolation',
      desc: 'All business settings, review link templates, QR stands, and customer feedback are isolated by authenticated user IDs. PostgreSQL Row Level Security (RLS) policies block unauthorized cross-account access.',
      badge: 'Active & Enforced',
    },
    {
      icon: Lock,
      title: 'Google OAuth 2.0 Token Vault',
      desc: 'Location management permissions are granted via Google OAuth 2.0. Access and refresh tokens are stored securely with AES-256 encryption and are never exposed to browser clients or external scripts.',
      badge: 'AES-256 Encrypted',
    },
    {
      icon: KeyRound,
      title: 'Zero Client-Side Secret Leakage',
      desc: 'All Gemini 3.8 Flash API calls and Gmail SMTP OTP dispatches are executed through server-side proxy routes (/api/*). Website visitors and customer landing pages have zero access to your API keys.',
      badge: 'Server-Side Isolated',
    },
    {
      icon: UserCheck,
      title: 'Cryptographic Auth & Salted Password Hashing',
      desc: 'Account authentication utilizes PBKDF2 cryptographic derivation with unique 16-byte cryptographic salts and 1,000 rounds of SHA-512. Temporary email OTPs use SHA-256 verification codes expiring in 10 minutes.',
      badge: 'PBKDF2 SHA-512',
    },
    {
      icon: Server,
      title: 'Encrypted In-Transit & At-Rest',
      desc: 'All communications between your browser, our customer portal, and Google Business Profile APIs are transmitted over modern TLS 1.3 encrypted tunnels with HSTS protection.',
      badge: 'TLS 1.3 Certified',
    },
    {
      icon: FileCheck,
      title: '100% Data Ownership & Exportability',
      desc: 'Under the governance of Arventa Ventures, you retain total ownership of all generated review drafts, store templates, and customer analytics. You can update or request complete account deletion at any time.',
      badge: 'Customer Sovereign',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-xs font-semibold border border-[#ceead6]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1e8e3e]" />
              <span>Enterprise Data Protection</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Data Security &amp; Privacy Architecture
            </h1>

            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Engineered and maintained by <strong>Arventa Ventures</strong>, RANKORA enforces strict data segregation, cryptographic credential storage, and zero-exposure API proxying to keep your Google Business Profile secure.
            </p>

            <div className="pt-1 flex items-center gap-3 text-xs text-[#5f6368]">
              <span className="flex items-center gap-1 font-medium text-[#202124]">
                <Building2 className="w-3.5 h-3.5 text-[#1a73e8]" />
                Governed by Arventa Ventures
              </span>
              <span>&bull;</span>
              <a
                href="https://arventaventures.online/"
                target="_blank"
                rel="noreferrer"
                className="text-[#1a73e8] hover:underline flex items-center gap-1"
              >
                <span>arventaventures.online</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Compliance Status Badge */}
          <div className="p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2 min-w-[220px]">
            <div className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
              Security Status
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#137333]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e] animate-pulse" />
              <span>All Systems Secured</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">
              End-to-end encrypted session with continuous Row Level Security enforcement.
            </p>
          </div>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#202124] tracking-tight">
          Comprehensive Security Measures &amp; Protocols
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {securityPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs space-y-3 hover:border-[#1a73e8]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-2xs">
                    <Icon className="w-5 h-5 text-[#1a73e8]" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                    {pillar.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#202124]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DPO & Contact Notice */}
      <div className="p-5 sm:p-6 bg-[#f8fafd] border border-[#d2e3fc] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#202124] flex items-center gap-2">
            <span>Data Protection &amp; Security Inquiries</span>
          </h4>
          <p className="text-xs text-[#5f6368] leading-relaxed">
            For security audits, data portability requests, or privacy concerns, contact our Data Protection Team at <strong>Arventa Ventures</strong> directly.
          </p>
        </div>

        <a
          href="mailto:info@arventaventures.online?subject=Data%20Protection%20Inquiry%20-%20RANKORA"
          className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Data Protection Desk</span>
        </a>
      </div>
    </div>
  );
}
