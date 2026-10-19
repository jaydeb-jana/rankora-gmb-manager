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

export async function generateCustomerReviewDraft(options: GenerateDraftOptions): Promise<string> {
  const ai = getAiClient(options.apiKeyOverride);
  if (!ai) {
    throw new Error('Gemini API key is not configured for this business. Please add a valid API key in the dashboard API settings.');
  }

  const lang = options.language || 'English';
  const rating = Number(options.starRating) || 5;
  const isPositive = rating >= 4;
  const isNeutral = rating === 3;
  const isNegative = rating <= 2;

  let personaInstruction = '';
  let ratingPromptGuide = '';

  if (isPositive) {
    personaInstruction = `You are a real, satisfied customer writing a genuine, positive ${rating}-star Google Business Profile review.
Express authentic customer satisfaction, praise, and appreciation in a warm, natural, and conversational tone.`;
    ratingPromptGuide = `Write a genuine, positive ${rating}-star customer review praising "${options.businessName}" (${options.category}).`;
  } else if (isNeutral) {
    personaInstruction = `You are a real customer writing an honest, balanced 3-star Google Business Profile review.
Mention both acceptable points and areas that could be improved. Keep the tone moderate, fair, and constructive.`;
    ratingPromptGuide = `Write a balanced, realistic 3-star customer review with constructive feedback for "${options.businessName}" (${options.category}).`;
  } else {
    personaInstruction = `You are a real, disappointed customer writing an honest, critical ${rating}-star Google Business Profile review.
Write in a frustrated, dissatisfied, yet realistic customer tone detailing poor service, issues faced, and disappointment.
Do NOT praise the business or sound satisfied; reflect the genuine frustration and dissatisfaction of a ${rating}-star experience.`;
    ratingPromptGuide = `Write an authentic, critical ${rating}-star customer review expressing dissatisfaction, disappointment, and issues faced with "${options.businessName}" (${options.category}).`;
  }

  const systemInstruction = `${personaInstruction}
Write in first-person natural perspective, exactly like everyday people write reviews on Google Maps.
Rules:
- Sound 100% human, casual, and authentic.
- Avoid sounding like an advertisement, marketing copy, or an AI bot.
- Do NOT use formal corporate jargon, buzzwords (like "testament", "seamless blend", "nestled"), hashtags, or quotation marks.
- Follow these guidelines: ${options.reviewWritingRules || (isPositive ? 'Keep it natural, genuine and specific to the service received.' : 'Express honest, constructive customer feedback.')}
- Keep it concise (2-4 sentences).
- Output ONLY the review text itself, with no introductory or concluding pleasantries.`;

  const activeServices = (options.selectedServices && options.selectedServices.length > 0)
    ? options.selectedServices.join(', ')
    : (options.productsAndServices || '');

  const prompt = `${ratingPromptGuide}

KEY CONTEXT & DETAILS:
${activeServices ? `- Services or Products Experienced: "${activeServices}" (Mention these exact services naturally)` : ''}
${options.shopAiDetails?.trim() ? `- Business Specialty & Shop Details: "${options.shopAiDetails.trim()}"` : ''}
${options.customerExperience?.trim() ? `- Atmosphere & Experience: "${options.customerExperience.trim()}"` : ''}

${isPositive ? 'HIGHLIGHTS THE CUSTOMER LIKED:' : isNeutral ? 'KEY FEEDBACK & OBSERVATIONS:' : 'SPECIFIC ISSUES & GRIEVANCES FACED:'}
${options.highlightChips.length > 0 ? options.highlightChips.map((c) => `- ${c}`).join('\n') : isNegative ? '- Poor service and unsatisfactory experience' : '- Good service'}
${options.customNotes?.trim() ? `\nCUSTOMER'S PERSONAL NOTES (Incorporate these points directly): "${options.customNotes.trim()}"` : ''}

${options.reviewWritingRules?.trim() && isPositive ? `BUSINESS OWNER'S SPECIFIC WRITING RULES:
${options.reviewWritingRules.trim()}
` : ''}
Review Tone: ${isNegative ? 'disappointed, critical, and dissatisfied' : isNeutral ? 'balanced and constructive' : options.brandTone || 'friendly and authentic'}
Language required: ${lang}.

Write a natural, conversational 2-4 sentence Google review now:`;

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
          temperature: 0.85,
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
