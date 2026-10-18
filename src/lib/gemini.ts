import { GoogleGenAI } from '@google/genai';

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

  return 'Invalid API Key. Verification failed. Please check your key from Google AI Studio.';
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
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with OK',
    });
    if (response && response.text) {
      return { valid: true, message: 'API key verified and active.' };
    }
    return { valid: false, message: 'Received empty response from Gemini API.' };
  } catch (err: any) {
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
  const lang = options.language || 'English';

  const systemInstruction = `You are a real, satisfied customer writing a genuine, organic Google Business Profile review.
Write in first-person natural perspective. Avoid sounding like an advertisement, marketing copy, or an AI bot.
Do NOT use overly formal words, corporate buzzwords, hashtags, or quotation marks around the review.
Follow these review writing guidelines if applicable: ${options.reviewWritingRules || 'Keep it natural, genuine and specific to the service received.'}
Output ONLY the review text itself, with no introductory or concluding pleasantries.`;

  const activeServices = (options.selectedServices && options.selectedServices.length > 0)
    ? options.selectedServices.join(', ')
    : (options.productsAndServices || 'Quality products and services');

  const prompt = `Write a ${options.starRating}-star customer review for "${options.businessName}" (${options.category}).
Key details about the business:
- Services & Offerings experienced: ${activeServices}
${options.shopAiDetails ? `- Shop & Business Details: ${options.shopAiDetails}` : ''}
- Atmosphere / Experience: ${options.customerExperience || 'Clean, welcoming and professional'}

Things I specifically loved and want to mention:
${options.highlightChips.length > 0 ? options.highlightChips.map((c) => `- ${c}`).join('\n') : '- Great service and quality'}
${options.customNotes?.trim() ? `\nCUSTOMER'S PERSONAL NOTES (Enhance and smoothly integrate these specific points): "${options.customNotes.trim()}"` : ''}

Keywords to blend in naturally if appropriate:
${(options.customKeywords || []).join(', ')}

Review Style / Tone: ${options.brandTone || 'friendly'}
${options.reviewWritingRules ? `Specific Review Writing Rules to obey:\n${options.reviewWritingRules}` : ''}

Language required: ${lang}.
Keep it concise, authentic, friendly, and approximately 2-4 sentences.`;

  if (!ai) {
    throw new Error('Gemini API key is not configured for this business. Please add a valid API key in the dashboard API settings.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const text = response.text?.trim();
    if (text) {
      return text.replace(/^"|"$/g, '');
    }
    throw new Error('Gemini API returned an empty response. Please try again.');
  } catch (err: any) {
    throw new Error(formatGeminiErrorMessage(err));
  }
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
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text.replace(/^"|"$/g, '');
      }
    } catch (err: any) {
      console.warn('[Gemini Reply Client Notice]', err?.message);
    }
  }

  // Graceful fallback
  if (options.starRating >= 4) {
    return `Thank you so much for the glowing review, ${options.authorName}! Our team at ${options.businessName} is thrilled you enjoyed your experience. We truly appreciate your support and look forward to welcoming you back soon!`;
  } else {
    return `Hello ${options.authorName}, thank you for sharing your candid feedback. At ${options.businessName}, we hold our standards high and would love the chance to make this right. Please feel free to reach out to us directly so we can assist you.`;
  }
}
