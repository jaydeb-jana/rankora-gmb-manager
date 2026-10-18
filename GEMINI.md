# CRITICAL ARCHITECTURAL RULES (বাধ্যতামূলক নিয়মাবলী)

## 1. 100% Client-Side Static SPA (কোনো সার্ভার সাইড কোড বা ল্যাঙ্গুয়েজ ব্যবহার করা যাবে না)
- **NO SERVER-SIDE BACKEND**: এই প্রজেক্টে Node.js / Express / Python / PHP বা অন্য কোনো সার্ভার-সাইড ব্যাকএন্ড ল্যাঙ্গুয়েজ বা কাস্টম ব্যাকএন্ড সার্ভার ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।
- **ONLY SUPABASE**: সমস্ত ডেটাবেস, অথেন্টিকেশন (Auth), স্টোরেজ, এবং ব্যাকএন্ড লজিক শুধুমাত্র **Supabase** ক্লায়েন্ট SDK (`@supabase/supabase-js`) দিয়ে ক্লায়েন্ট-সাইড থেকেই পরিচালিত হবে।
- **DIRECT CLIENT INTEGRATIONS**:
  - AI সংক্রান্ত সব কাজ ক্লায়েন্ট-সাইড থেকে সরাসরি Gemini API (`@google/genai`) দিয়ে হবে।
  - QR Code ইত্যাদি সব কিছু ব্রাউজারেই জেনারেট হবে।
- **STATIC HOSTING READY**:
  - প্রজেক্টটি যাতে Vercel, Netlify, Cloudflare Pages, GitHub Pages ইত্যাদি যেকোনো স্ট্যাটিক হোস্টিং প্ল্যাটফর্মে `vite build` চালিয়ে সরাসরি `dist` ফোল্ডার ডেপ্লয় করলেই কোনো সার্ভার ছাড়াই পুরোপুরি কাজ করে।
  - কোনো লোকাল `/api/...` সার্ভার এন্ডপয়েন্টের ওপর নির্ভর করা যাবে না। সমস্ত রিকোয়েস্ট সরাসরি Supabase ও ব্রাউজারেই এক্সিকিউট হতে হবে।

---

## 2. Dev & Build Configuration
- `npm run dev` বা `bun run dev` সরাসরি `vite` চালাবে।
- `npm run build` সরাসরি `vite build` করবে যা পিওর স্ট্যাটিক ফাইল তৈরি করবে।
