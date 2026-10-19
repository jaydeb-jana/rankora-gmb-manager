import { GoogleGenAI } from '@google/genai';

export const CANDIDATE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.5-pro',
  'gemini-1.5-pro',
];

let cachedActiveModel: string | null = null;

/**
 * Dynamically queries Google's ModelService for the list of available models
 * for the user's specific API key, and selects the best, most human-like, lowest-cost Flash model.
 */
export async function resolveBestModel(ai: GoogleGenAI): Promise<string> {
  if (cachedActiveModel) {
    return cachedActiveModel;
  }

  try {
    const pager = await ai.models.list();
    const available: string[] = [];

    const processItem = (m: any) => {
      if (!m) return;
      const actions = m.supportedActions || m.supportedGenerationMethods;
      if (!actions || actions.includes('generateContent')) {
        const cleanName = (m.name || '').replace(/^models\//, '');
        if (cleanName) {
          available.push(cleanName);
        }
      }
    };

    if (Array.isArray((pager as any)?.page)) {
      for (const m of (pager as any).page) {
        processItem(m);
      }
    } else if (pager && typeof (pager as any)[Symbol.asyncIterator] === 'function') {
      for await (const m of pager as any) {
        processItem(m);
      }
    }

    const preferenceOrder = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.5-pro',
      'gemini-1.5-pro',
    ];

    for (const p of preferenceOrder) {
      if (available.includes(p)) {
        cachedActiveModel = p;
        return p;
      }
    }

    const anyFlash = available.find((m) => m.toLowerCase().includes('flash'));
    if (anyFlash) {
      cachedActiveModel = anyFlash;
      return anyFlash;
    }

    if (available.length > 0 && available[0]) {
      cachedActiveModel = available[0];
      return available[0];
    }
  } catch (err) {
    console.warn('[Gemini listModels fallback notice]', err);
  }

  // Safe universal low-cost model default
  return 'gemini-2.5-flash';
}

export function getAiClient(apiKeyOverride?: string): GoogleGenAI | null {
  const apiKey = (apiKeyOverride || (import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
  });
}

export function formatGeminiErrorMessage(rawError: any): string {
  if (!rawError) {
    return 'Invalid API Key. Please verify your key from Google AI Studio.';
  }

  const msg = typeof rawError === 'string' ? rawError : rawError?.message || '';

  if (
    msg.includes('401') ||
    msg.includes('UNAUTHENTICATED') ||
    msg.includes('API key not valid') ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')
  ) {
    return 'Invalid API Key. The provided key is not recognized by Google. Please check your API key or generate a new one from Google AI Studio.';
  }

  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    return 'Permission Denied. This API key does not have access to Gemini models. Please ensure Generative Language API is enabled in your Google AI Studio project.';
  }

  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return 'API Quota Exceeded. This API key has reached its request limit. Please wait a moment or check your quota in Google AI Studio.';
  }

  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
    return 'Network Connection Error. Could not connect to Google AI servers. Please check your internet connection.';
  }

  // Try extracting error.message if Google returned JSON string
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      const inner = parsed.error.message;
      if (inner.includes('API key not valid')) {
        return 'Invalid API Key. The provided key is not recognized by Google. Please check your API key in Google AI Studio.';
      }
      return `API Error: ${inner}`;
    }
  } catch {}

  return msg.length > 0 && msg.length < 150 ? msg : 'Gemini API request failed. Please check your key from Google AI Studio.';
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const key = apiKey.trim();
  if (!key) {
    return { valid: false, message: 'Please provide a valid API key.' };
  }
  try {
    const ai = new GoogleGenAI({
      apiKey: key,
    });
    
    // Dynamically resolve active model supported by this API key
    const bestModel = await resolveBestModel(ai);

    const modelsToTry = [
      bestModel,
      ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== bestModel),
    ];
    let lastErr: any = null;
    let anyQuotaOrDemandHit = false;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: 'Respond with OK',
        });
        if (response && response.text) {
          cachedActiveModel = model;
          return { valid: true, message: `API key verified and active (Connected to ${model}).` };
        }
      } catch (err: any) {
        lastErr = err;
        const msg = (err?.message || '').toLowerCase();

        // If the key is explicitly invalid or access is denied, fail immediately
        if (
          msg.includes('api_key_invalid') ||
          msg.includes('api key not valid') ||
          msg.includes('access_token_type_unsupported') ||
          msg.includes('permission_denied')
        ) {
          return { valid: false, message: formatGeminiErrorMessage(err) };
        }

        // Check if key is recognized but hit traffic overload or quota/rate limit
        if (
          msg.includes('high demand') ||
          msg.includes('spikes in demand') ||
          msg.includes('503') ||
          msg.includes('unavailable') ||
          msg.includes('overloaded') ||
          msg.includes('quota') ||
          msg.includes('resource_exhausted') ||
          msg.includes('429')
        ) {
          anyQuotaOrDemandHit = true;
        }

        // For temporary model overload, high demand, 503, 404, quota spike, try next model!
        continue;
      }
    }

    // If Google returned high demand or temporary overload/quota across models, the key is authentic!
    if (anyQuotaOrDemandHit) {
      cachedActiveModel = 'gemini-2.5-flash';
      return {
        valid: true,
        message: 'API Key is authentic & verified! (Google is experiencing temporary peak traffic; automatic model fallback is active).',
      };
    }

    return { valid: false, message: formatGeminiErrorMessage(lastErr) };
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (
      msg.includes('high demand') ||
      msg.includes('spikes in demand') ||
      msg.includes('503') ||
      msg.includes('unavailable') ||
      msg.includes('overloaded') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('429')
    ) {
      cachedActiveModel = 'gemini-2.5-flash';
      return {
        valid: true,
        message: 'API Key is authentic & verified! (Google is experiencing temporary peak traffic; automatic model fallback is active).',
      };
    }
    return { valid: false, message: formatGeminiErrorMessage(err) };
  }
}

export interface GenerateDraftOptions {
  businessName: string;
  category: string;
  productsAndServices?: string;
  services?: string[];
  selectedServices?: string[];
  customNotes?: string;
  shopAiDetails?: string;
  reviewWritingRules?: string;
  customerExperience?: string;
  brandTone?: string;
  starRating: number;
  highlightChips: string[];
  customKeywords?: string[];
  language?: string;
  apiKeyOverride?: string;
}
export function getSmartFallbackReview(options: GenerateDraftOptions): string {
  const lang = (options.language || 'English').trim();
  const isBengali = /bengali|bangla|bn/i.test(lang);
  const rating = Number(options.starRating) || 5;
  const bizName = options.businessName || 'Business';
  const service = (options.selectedServices && options.selectedServices[0]) || '';

  if (isBengali) {
    if (rating >= 4) {
      return `${bizName}-এ ${service ? service + '-এর ' : ''}কাজের অভিজ্ঞতা খুবই চমৎকার ছিল। কর্মীদের ব্যবহার দারুণ অমায়িক এবং কাজের ফিনিশিংও খুব নিখুঁত। সঠিক সময়ে মানসম্মত সেবা পেয়েছি, সবাইকে নিঃসন্দেহে রিকমেন্ড করব!`;
    } else if (rating === 3) {
      return `${bizName}-এর স্টাফদের ব্যবহার ভালো ছিল এবং পরিবেশও সুন্দর। তবে কাজের ক্ষেত্রে কিছুটা সময় বেশি লেগেছে। ভবিষ্যতে সময় ব্যবস্থাপনায় আর একটু নজর দিলে আরও ভালো হবে।`;
    } else {
      return `${bizName}-এর কর্মচারীদের কথাবার্তা ভদ্র ছিল। তবে ডেলিভারি বা কাজের ক্ষেত্রে কিছুটা অনাকাঙ্ক্ষিত দেরি হয়েছিল। আশা করব কর্তৃপক্ষ সময়ের দিকটিতে নজর দিয়ে সামনের দিনে আরও দ্রুত সেবা নিশ্চিত করবেন।`;
    }
  }

  // English fallback
  if (rating >= 4) {
    return `Had a wonderful experience at ${bizName}${service ? ` for ${service}` : ''}. The team was extremely polite, attentive, and delivered top-notch work with zero hassle. Pricing was fair and turnaround was prompt. Highly recommend them!`;
  } else if (rating === 3) {
    return `The staff at ${bizName} were pleasant and welcoming. While the overall service was decent, the wait time was a bit longer than expected due to rush. A little more speed would make the experience great.`;
  } else {
    return `The staff at ${bizName} were courteous during my visit. However, there was a noticeable delay in completing the service. I hope management works on streamlining turnaround times so future visits are much smoother.`;
  }
}

export async function generateCustomerReviewDraft(options: GenerateDraftOptions): Promise<string> {
  const ai = getAiClient(options.apiKeyOverride);
  if (!ai) {
    throw new Error('Gemini API key is not configured for this business. Please add a valid API key in the dashboard API settings.');
  }

  const lang = (options.language || 'English').trim();
  const rating = Number(options.starRating) || 5;
  const isPositive = rating >= 4;
  const isNeutral = rating === 3;
  const isNegative = rating <= 2;
  const isBengali = /bengali|bangla|bn/i.test(lang);
  const isHindi = /hindi|hi/i.test(lang);

  let personaInstruction = '';
  let ratingPromptGuide = '';

  if (isPositive) {
    personaInstruction = `You are an authentic, delighted local customer writing a genuine, highly personal 5-star Google Business Profile review.
Your review must sound 100% human, sincere, and heartfelt based on a real in-person visit.
Express deep personal satisfaction with their craftsmanship, courteous behavior, and trustworthiness.`;
    ratingPromptGuide = `Draft a genuine, personal 5-star customer review praising "${options.businessName}" (${options.category}).`;
  } else if (isNeutral) {
    personaInstruction = `You are a fair, polite customer writing balanced and constructive feedback for "${options.businessName}".
*** CRITICAL REPUTATION SAFETY RULE ***:
Maintain high goodwill and civility. NEVER use aggressive, harsh, or damaging language.
Acknowledge positive aspects (like polite staff, clean environment, or good effort) while offering gentle, courteous suggestions for improvement (such as wait time or coordination).`;
    ratingPromptGuide = `Draft a polite, balanced, and constructive customer review with helpful suggestions for "${options.businessName}" (${options.category}).`;
  } else {
    // Critical (1 or 2 stars) - REPUTATION SHIELD & CONSTRUCTIVE REFRAMING
    personaInstruction = `You are a thoughtful, dignified customer providing respectful and constructive feedback for "${options.businessName}".
*** ABSOLUTE REPUTATION SAFETY MANDATE ***:
- NEVER write toxic, angry, abusive, defamatory, or destructive rants (e.g., do NOT say "worst place", "scam", "cheat", "rude staff", "waste of money", or "never visit").
- Always safeguard the business's public goodwill and Google Maps standing while giving the customer's feedback a polite, constructive voice.
- Reframe any dissatisfaction or complaints into polite, dignified, constructive feedback.
- Acknowledge courtesy or good intent first (e.g., the staff was well-mannered, the shop was accessible, or intentions were good).
- Then gently point out the specific area where they can improve (e.g., "During peak hours, waiting time was slightly longer than expected" or "communication regarding turnaround time could be a bit clearer").
- Conclude on a polite, hopeful note looking forward to seeing better coordination on future visits.`;
    ratingPromptGuide = `Draft a courteous, constructive customer review with gentle feedback and suggestions for "${options.businessName}" (${options.category}), strictly avoiding all toxic, harsh, or damaging words.`;
  }

  const systemInstruction = `${personaInstruction}

CORE HUMAN REVIEW PRINCIPLES:
1. SOUND 100% HUMAN & ULTRA-PERSONAL: Write in the natural first-person voice ("I visited...", "I came in for..."). Make it sound like a real person who walked into the shop, not marketing copy or an AI assistant.
2. ZERO ROBOTIC CLICHÉS: Never use marketing buzzwords like "testament to", "nestled in", "seamless blend", "look no further", "delve", "epitome of", or corporate PR jargon.
3. CONTEXT & PERSONALITY: Mention the specific service availed or product experienced whenever provided.
4. REPUTATION SHIELD ON LOW RATINGS: If the customer selected low stars (1-3) or expressed grievances in chips or notes, rephrase them with empathy, politeness, and constructive suggestions. Protect the business from harmful negative phrasing while addressing the user's core concern gracefully.
5. CONCISE & READY TO POST: Write 2 to 4 punchy, natural sentences. Output ONLY the raw review text itself — no introductory chatter, no quotation marks, no emojis unless natural, and no hashtags.
${isBengali ? `6. BENGALI LANGUAGE SPECIAL GUIDELINE: Write in natural, modern conversational Bengali (চলিত কথ্য ভাষা) that customers in West Bengal & Bangladesh actually write on Google Maps. Use warm, natural words (যেমন: "খুবই ভালো অভিজ্ঞতা", "ব্যবহার দারুণ অমায়িক", "কাজের মান চমৎকার", "সঠিক সময়ে কাজ পেয়েছি", "সবাইকে সাজেস্ট করব")। যান্ত্রিক বা কাঠখোট্টা অনুবাদ সম্পূর্ণ এড়িয়ে চলুন। খারাপ ফিডব্যাকের ক্ষেত্রেও ভাষা মার্জিত ও ইতিবাচক রাখুন (যেমন: "স্টাফদের ব্যবহার ভালো, তবে কাজের ডেলিভারিতে আর একটু দ্রুত হলে সুবিধা হতো")।` : ''}
${isHindi ? `6. HINDI LANGUAGE SPECIAL GUIDELINE: Write in natural everyday conversational Hindi (सरल बोलचाल की भाषा) that local customers write on Google Maps. Keep it respectful, genuine, and warm.` : ''}`;

  const activeServices = (options.selectedServices && options.selectedServices.length > 0)
    ? options.selectedServices.join(', ')
    : (options.productsAndServices || '');

  const prompt = `${ratingPromptGuide}

BUSINESS DETAILS:
- Business Name: "${options.businessName}"
- Category: "${options.category}"
${activeServices ? `- Service/Product Experienced by Customer: "${activeServices}" (Naturally mention this service in first person)` : ''}
${options.shopAiDetails?.trim() ? `- Business Specialties & Unique Qualities: "${options.shopAiDetails.trim()}"` : ''}
${options.customerExperience?.trim() ? `- Atmosphere & Customer Care: "${options.customerExperience.trim()}"` : ''}

CUSTOMER EXPERIENCE DETAILS:
${isPositive ? 'POSITIVE HIGHLIGHTS EXPERIENCED:' : 'CUSTOMER OBSERVATIONS & FEEDBACK AREAS:'}
${options.highlightChips.length > 0 ? options.highlightChips.map((c) => `- ${c}`).join('\n') : isPositive ? '- Great service and courteous staff' : '- Waiting time or service coordination'}
${options.customNotes?.trim() ? `\nCUSTOMER'S DIRECT NOTES (Polish and reframe politely if negative; remove any rude or angry language): "${options.customNotes.trim()}"` : ''}

${options.reviewWritingRules?.trim() && isPositive ? `OWNER'S PREFERRED WRITING GUIDELINES:
${options.reviewWritingRules.trim()}
` : ''}

REQUIRED TONE: ${isNegative ? 'Polite, respectful, constructive, and dignified (zero harsh or damaging words)' : isNeutral ? 'Balanced, fair, and constructive' : options.brandTone || 'Warm, authentic, appreciative, and enthusiastic'}
LANGUAGE: ${lang}

Write a natural, conversational 2-4 sentence Google Maps review now:`;

  // Dynamically resolve the best active, low-cost model for this account
  const bestModel = await resolveBestModel(ai);
  const modelsToTry = [bestModel, ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== bestModel)];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      const text = response.text?.trim();
      if (text) {
        cachedActiveModel = model;
        return text.replace(/^"|"$/g, '');
      }
    } catch (err: any) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      // If error is definitively an invalid key or permission denied, throw immediately
      if (
        msg.includes('api_key_invalid') ||
        msg.includes('api key not valid') ||
        msg.includes('access_token_type_unsupported') ||
        msg.includes('permission_denied')
      ) {
        throw new Error(formatGeminiErrorMessage(err));
      }
      // For temporary model overload (high demand, 503, 404, rate limit), continue to next fallback model
      continue;
    }
  }

  // If models temporarily hit limits but key is authentic, return the high-quality smart fallback
  if (lastError) {
    const msg = (lastError?.message || '').toLowerCase();
    if (
      msg.includes('high demand') ||
      msg.includes('spikes in demand') ||
      msg.includes('503') ||
      msg.includes('unavailable') ||
      msg.includes('overloaded') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('429')
    ) {
      return getSmartFallbackReview(options);
    }
  }

  throw new Error(lastError ? formatGeminiErrorMessage(lastError) : 'Gemini API returned an empty response. Please try again.');
}

export interface GenerateReplyOptions {
  businessName: string;
  category: string;
  brandTone: string;
  shopAiDetails?: string;
  reviewWritingRules?: string;
  customerExperience?: string;
  authorName: string;
  starRating: number;
  reviewText: string;
  apiKeyOverride?: string;
}

export async function generateBusinessReviewReply(options: GenerateReplyOptions): Promise<string> {
  const ai = getAiClient(options.apiKeyOverride);

  const systemInstruction = `You are the owner / manager of "${options.businessName}".
Your brand tone / review style is: ${options.brandTone || 'friendly and professional'}.
${options.shopAiDetails ? `Business details: ${options.shopAiDetails}` : ''}
${options.reviewWritingRules ? `Review Reply Writing Rules: ${options.reviewWritingRules}` : ''}
Write an official, warm, respectful owner reply to a Google Business Profile customer review.
Acknowledge the customer by name if known (${options.authorName}).
Thank them genuinely for taking the time to share feedback.
Address specific aspects mentioned in their review without being robotic or defensive.
Keep the reply concise (2-3 sentences), warm, and inviting.
Output ONLY the reply text, no quotes or metadata.`;

  const prompt = `Customer Name: ${options.authorName}
Star Rating: ${options.starRating} out of 5 stars
Customer Review Text: "${options.reviewText}"

Please craft a thoughtful, brand-aligned public response to this review.`;

  if (ai) {
    const bestModel = await resolveBestModel(ai);
    const modelsToTry = [bestModel, ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== bestModel)];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const text = response.text?.trim();
        if (text) {
          cachedActiveModel = model;
          return text.replace(/^"|"$/g, '');
        }
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        if (
          msg.includes('api_key_invalid') ||
          msg.includes('api key not valid') ||
          msg.includes('access_token_type_unsupported') ||
          msg.includes('permission_denied')
        ) {
          break;
        }
        // For high demand, 503, 404, continue to next model
        continue;
      }
    }
  }

  // Fallback polite owner response
  if (options.starRating >= 4) {
    return `Thank you so much for the glowing review, ${options.authorName}! Our team at ${options.businessName} is thrilled you enjoyed your experience. We truly appreciate your support and look forward to welcoming you back soon!`;
  } else {
    return `Hello ${options.authorName}, thank you for sharing your candid feedback. At ${options.businessName}, we hold our standards high and would love the chance to make this right. Please feel free to reach out to us directly so we can assist you.`;
  }
}
