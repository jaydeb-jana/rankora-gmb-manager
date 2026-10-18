# RANKORA - 100% Client-Side Pure Static Web Application

> **গুরুত্বপূর্ণ নীতি (Strict Architectural Rule):**
> এই প্রজেক্টে কোনো সার্ভার-সাইড ব্যাকএন্ড (Node.js/Express ইত্যাদি) ব্যবহার করা হবে না। সম্পূর্ণ অ্যাপ্লিকেশনটি একটি Pure Static Single Page Application (React + Vite) যা যেকোনো স্ট্যাটিক হোস্টিং (Vercel, Netlify, Cloudflare Pages, GitHub Pages) এ সরাসরি রান করবে। ব্যাকএন্ডের সমস্ত কার্যক্রম শুধুমাত্র **Supabase** দিয়ে সম্পন্ন হবে।

---

## 🛠️ প্রযুক্তি ও ফ্রেমওয়ার্ক (Tech Stack)
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Motion
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com) (`@supabase/supabase-js`)
- **AI Engine**: Google Gemini API (`@google/genai`) client-side
- **QR Engine**: Client-side `qrcode`

---

## 🚀 লোকাল ডেভেলপমেন্ট (Local Development)

```bash
# ডিপেন্ডেন্সি ইনস্টল করুন
bun install
# অথবা
npm install

# লোকাল ডেভ সার্ভার চালান (Pure Vite)
npm run dev
```

ব্রাউজারে ওপেন করুন: `http://localhost:3000`

---

## 📦 স্ট্যাটিক হোস্টিং-এ ডিপ্লয় (Static Hosting Deployment)

```bash
# স্ট্যাটিক বিল্ড তৈরি করুন
npm run build
```
এটি `dist/` ফোল্ডারে পিওর স্ট্যাটিক ফাইল তৈরি করবে যা কোনো সার্ভার ছাড়াই সরাসরি লাইভ হোস্টিং-এ চলবে।
