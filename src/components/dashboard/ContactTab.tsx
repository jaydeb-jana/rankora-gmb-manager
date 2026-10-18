import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Mail,
  ExternalLink,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  PhoneOff,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';

// Distinctive WhatsApp SVG Icon
function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
    </svg>
  );
}

export function ContactTab() {
  const { showSuccess, showError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [subject, setSubject] = useState('Google Business Profile Review Automation');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Auto-resizing textarea ref
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    autoGrowTextarea();
  };

  const autoGrowTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Minimum height of 115px, expands automatically as content grows
      textareaRef.current.style.height = `${Math.max(115, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    autoGrowTextarea();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      showError('Please fill in your name, email, and message.');
      return;
    }

    setSending(true);
    try {
      const res = await api.sendContactInquiry({
        name: fullName.trim(),
        email: email.trim(),
        mobile: mobileNumber.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.success) {
        setSentSuccess(true);
        showSuccess('Message Delivered successfully!');
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = '115px';
        }
      } else {
        throw new Error(res.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      console.warn('API direct delivery issue, opening email client fallback:', err);
      // Fallback: Open mailto client directly to info@arventaventures.online
      const mailtoUrl = `mailto:info@arventaventures.online?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(
        `Name: ${fullName}\nEmail: ${email}\nMobile: ${mobileNumber}\n\nMessage:\n${message}`
      )}`;
      window.location.href = mailtoUrl;
      showSuccess('Opening your email client...');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner - Parent Operating Company */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold border border-[#d2e3fc]">
              <Building2 className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Parent Operating Entity</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Arventa Ventures
            </h1>

            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              RANKORA is engineered and operated by <strong>Arventa Ventures</strong>, a performance-driven agency delivering full-funnel digital scaling, Google Business Profile local SEO ranking, and AI reputation automation.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href="https://arventaventures.online/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/917872490719?text=Hello%20Arventa%20Ventures%20Support"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#0f6b2f] text-xs font-semibold rounded-lg border border-[#a8dab5] transition-colors cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp Chat Support</span>
              </a>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2.5 min-w-[220px]">
            <div className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
              Company Snapshot
            </div>
            <div className="text-xs text-[#202124]">
              <span className="font-semibold block">Official Domain:</span>
              <span className="text-[#1a73e8]">arventaventures.online</span>
            </div>
            <div className="text-xs text-[#202124]">
              <span className="font-semibold block">Customer Support:</span>
              <span>Available 6 Days / Week</span>
            </div>
            <div className="text-xs text-[#137333] font-semibold flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Business Provider</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Official Email */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-2xs">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">Official Email</h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              For enterprise inquiries, partnerships, and technical questions.
            </p>
          </div>
          <div className="pt-2 border-t border-[#f1f3f4]">
            <a
              href="mailto:info@arventaventures.online"
              className="text-xs font-semibold text-[#1a73e8] hover:underline block break-all"
            >
              info@arventaventures.online
            </a>
          </div>
        </div>

        {/* Card 2: WhatsApp Card - Exact single-line header with WhatsApp icon and English 'do not call' notice */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* WhatsApp Icon and Title in one clean line */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shadow-2xs shrink-0">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[#202124] leading-tight">
                  WhatsApp Support
                </h3>
              </div>
            </div>

            {/* Subtitle description */}
            <p className="text-xs text-[#5f6368] leading-relaxed">
              Direct instant messaging desk for priority customer support.
            </p>
          </div>

          {/* WhatsApp Link + Strict No Call Notice in English */}
          <div className="pt-2 border-t border-[#f1f3f4] space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <a
                href="https://wa.me/917872490719?text=Hello%20Arventa%20Ventures%20Support"
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm font-bold text-[#128C7E] hover:underline inline-flex items-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>+91 7872490719</span>
              </a>

              <span className="text-[10px] font-semibold text-[#b3261e] bg-[#fce8e6] border border-[#f5c2c7] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <PhoneOff className="w-2.5 h-2.5" />
                <span>No phone calls — WhatsApp messages only</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Support Hours */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-5 shadow-xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">Working Hours</h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              Monday to Saturday<br />
              9:00 AM – 7:00 PM IST
            </p>
          </div>
          <div className="pt-2 border-t border-[#f1f3f4]">
            <span className="text-[11px] font-semibold text-[#137333] inline-block">
              Sunday: Emergency WhatsApp Support Only
            </span>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#dadce0] pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#202124]">
            Send an Official Inquiry
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Leave us a note and our technical strategy team at Arventa Ventures will respond directly.
          </p>
        </div>

        {sentSuccess && (
          <div className="p-4 bg-[#e6f4ea] border border-[#ceead6] rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm text-[#137333]">
              <p className="font-bold">Message Delivered</p>
              <p className="text-xs text-[#1e4620]">
                Thank you! Your inquiry has been dispatched to Arventa Ventures. Our executive support desk will review and contact you shortly.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Jaydeb Jana"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., you@company.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
                Mobile / WhatsApp Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 7872490719"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-lg text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] shadow-2xs transition-colors"
            />
          </div>

          {/* Auto-expanding Message Box without manual drag resize handle */}
          <div>
            <label className="block text-xs font-semibold text-[#5f6368] mb-1.5">
              Message / Inquiries *
            </label>
            <textarea
              ref={textareaRef}
              rows={3}
              required
              value={message}
              onChange={handleMessageChange}
              placeholder="Tell us about your business, multi-location requirements, custom integrations, or any support questions..."
              className="w-full p-3.5 bg-white border border-[#dadce0] rounded-xl text-xs sm:text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 shadow-2xs leading-relaxed resize-none overflow-hidden transition-[height] duration-75"
              style={{ minHeight: '115px' }}
            />
          </div>

          {/* Action Bar & Message Button */}
          <div className="pt-6 border-t border-[#f1f3f4] flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto px-8 py-3 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm hover:shadow flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
