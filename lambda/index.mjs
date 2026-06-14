/**
 * Lambda handler — Gemini primary, Groq fallback.
 * No AWS Bedrock dependencies.
 *
 * Input:  { systemPrompt, userMessage, imageBase64? }
 * Output: { text }
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;

const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GROQ_MODEL     = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT  = "https://api.groq.com/openai/v1/chat/completions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

// ─── Gemini ───────────────────────────────────────────────────────────────────

/**
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {string|undefined} imageBase64  Base-64 encoded image (JPEG/PNG)
 * @returns {Promise<string>}
 */
async function callGemini(systemPrompt, userMessage, imageBase64) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

  // Build the parts array for the user turn
  const parts = [];

  if (imageBase64) {
    // Detect MIME type from the base-64 prefix; default to jpeg
    let mimeType = "image/jpeg";
    if (imageBase64.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    } else if (imageBase64.startsWith("iVBORw")) {
      mimeType = "image/png";
    } else if (imageBase64.startsWith("R0lGOD")) {
      mimeType = "image/gif";
    } else if (imageBase64.startsWith("UklGR")) {
      mimeType = "image/webp";
    }

    parts.push({
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    });
  }

  parts.push({ text: userMessage });

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.4,
    },
  };

  console.log(`[Gemini] Calling model=${GEMINI_MODEL} hasImage=${!!imageBase64}`);

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string") {
    throw new Error(`Gemini returned unexpected shape: ${JSON.stringify(data)}`);
  }

  console.log(`[Gemini] OK length=${text.length}`);
  return text;
}

// ─── Groq ─────────────────────────────────────────────────────────────────────

/**
 * Groq does not support image inputs; imageBase64 is intentionally ignored.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function callGroq(systemPrompt, userMessage) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system",  content: systemPrompt },
      { role: "user",    content: userMessage  },
    ],
    temperature: 0.4,
  };

  console.log(`[Groq] Calling model=${GROQ_MODEL}`);

  const res = await fetch(GROQ_ENDPOINT, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Groq HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== "string") {
    throw new Error(`Groq returned unexpected shape: ${JSON.stringify(data)}`);
  }

  console.log(`[Groq] OK length=${text.length}`);
  return text;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handler(event) {
  // Determine HTTP method (API Gateway v2 vs v1)
  const method =
    event?.requestContext?.http?.method ??
    event?.httpMethod ??
    "POST";

  console.log(`[Handler] method=${method}`);

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  // Parse body
  let body;
  try {
    const raw = typeof event.body === "string" ? event.body : JSON.stringify(event.body ?? {});
    body = JSON.parse(raw);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { systemPrompt, userMessage, imageBase64 } = body ?? {};

  if (!systemPrompt || !userMessage) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Missing required fields: systemPrompt, userMessage" }),
    };
  }

  // Try Gemini
  try {
    const text = await callGemini(systemPrompt, userMessage, imageBase64);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ text }),
    };
  } catch (geminiErr) {
    console.error(`[Gemini] Failed: ${geminiErr.message} — falling back to Groq`);
  }

  // Fallback: Groq
  try {
    const text = await callGroq(systemPrompt, userMessage);
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ text }),
    };
  } catch (groqErr) {
    console.error(`[Groq] Failed: ${groqErr.message}`);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Both providers failed. Last error: ${groqErr.message}` }),
    };
  }
}
