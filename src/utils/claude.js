/**
 * LLM proxy client.
 * Sends { systemPrompt, userMessage, imageBase64? } to the Lambda.
 * Lambda tries Gemini (primary) + Groq (fallback).
 * Always returns { text }.
 *
 * ⚠️ IMPORTANT: Toggle USE_MOCK to switch between mock responses and real APIs.
 * - USE_MOCK = true  → Free, unlimited testing with mock responses
 * - USE_MOCK = false → Real Gemini/Groq API calls (costs credits)
 */

const USE_MOCK = true; // ← TOGGLE THIS TO SWITCH BETWEEN MOCK AND REAL
const PROXY_URL = import.meta.env.VITE_LLM_PROXY_URL;

/**
 * Core fetch wrapper — all LLM calls go through here.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {string} [imageBase64]  Base-64 image string (no data-URL prefix)
 * @returns {Promise<string>}
 */
export async function callLLM(systemPrompt, userMessage, imageBase64) {
  // Use mock if enabled
  if (USE_MOCK) {
    const { mockCallLLM } = await import('./mockLLM.js');
    console.log('[LLM] Using MOCK responses (set USE_MOCK=false to use real Gemini/Groq)');
    return mockCallLLM(systemPrompt, userMessage, imageBase64);
  }

  // Real API call
  if (!PROXY_URL || PROXY_URL.includes('your-lambda')) {
    throw new Error('LLM proxy URL not configured — set VITE_LLM_PROXY_URL in .env');
  }

  const body = { systemPrompt, userMessage };
  if (imageBase64) body.imageBase64 = imageBase64;

  console.log('[LLM] Using REAL Gemini/Groq via Lambda');
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }

  return data.text;
}

// Backwards-compatible alias (screens import callClaude)
export const callClaude = callLLM;

// ── System prompts (static, reusable) ────────────────────────────────────────

const SYSTEM = {
  situationCheckout:
    `You are a quick-commerce shopping assistant for Amazon Now India.
Given a user's situation, suggest 4-6 products they urgently need.
Respond ONLY with valid JSON. No markdown, no explanation.
Format: { "items": [{ "name": "...", "brand": "...", "price": 89, "reason": "..." }] }
Prices in INR. Keep reasons under 10 words. Be practical, not generic.`,

  smartReorder:
    `You are a household replenishment AI for Amazon Now India.
Given a user's past order history, predict what they are running low on.
Respond ONLY with valid JSON. No markdown, no explanation.
Format: { "predictions": [{ "productName": "...", "reasoning": "...", "urgency": "high|medium|low" }] }
Reasoning must be under 12 words. Be specific and personal, not generic.`,

  photoToCart:
    `You are a product recognition AI for Amazon Now India.
Identify the product in the image and suggest the closest Amazon Now equivalent.
Respond ONLY with valid JSON. No markdown, no explanation.
Format: { "detected": "...", "suggestion": { "name": "...", "brand": "...", "price": 89, "category": "..." } }`,

  calendarShopping:
    `You are a proactive shopping AI for Amazon Now India.
Given an upcoming calendar event, suggest products the user should order now to be prepared.
Respond ONLY with valid JSON. No markdown, no explanation.
Format: { "headline": "Perfect for [event]", "items": [{ "name": "...", "price": 89, "reason": "..." }] }
Max 6 items. Reasons under 8 words. Think practically — what does someone actually need?`,
};

// ── Prompt builders — return { systemPrompt, userMessage } ───────────────────

export const PROMPTS = {
  /**
   * @param {string} situation  e.g. "my kid has fever"
   * @returns {{ systemPrompt: string, userMessage: string }}
   */
  situationCheckout: (situation) => ({
    systemPrompt: SYSTEM.situationCheckout,
    userMessage: `User situation: ${situation}`,
  }),

  /**
   * @param {object[]} orderHistory
   * @returns {{ systemPrompt: string, userMessage: string }}
   */
  smartReorder: (orderHistory) => ({
    systemPrompt: SYSTEM.smartReorder,
    userMessage: `Order history: ${JSON.stringify(orderHistory)}`,
  }),

  /**
   * @returns {{ systemPrompt: string, userMessage: string }}
   * Caller should also pass imageBase64 separately to callLLM.
   */
  photoToCart: () => ({
    systemPrompt: SYSTEM.photoToCart,
    userMessage: 'Identify the product in the attached image and suggest the best Amazon Now equivalent.',
  }),

  /**
   * @param {{ title: string, type: string, daysFromNow: number, guests: number }} event
   * @returns {{ systemPrompt: string, userMessage: string }}
   */
  calendarShopping: (event) => ({
    systemPrompt: SYSTEM.calendarShopping,
    userMessage: `Event: ${event.title}, Type: ${event.type}, Days away: ${event.daysFromNow}, Guests: ${event.guests}`,
  }),
};
