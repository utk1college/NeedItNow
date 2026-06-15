/**
 * Lambda handler — unified API + AI proxy.
 *
 * Routes (determined by path + method):
 *   POST   /ai              → Gemini primary, Groq fallback  (original behaviour)
 *   POST   /order           → Save order to DynamoDB
 *   GET    /orders/{userId} → Fetch orders for a user from DynamoDB
 *   GET    /user/{userId}   → Fetch user profile from DynamoDB
 *   POST   /user            → Create / update user profile in DynamoDB
 *
 * Input for /ai:  { systemPrompt, userMessage, imageBase64? }
 * Output:         { text }
 *
 * All other routes use standard REST JSON in/out.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// ── Environment ───────────────────────────────────────────────────────────────
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY;
const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const AWS_REGION       = process.env.AWS_REGION ?? "ap-south-1";
const ORDERS_TABLE     = process.env.ORDERS_TABLE ?? "needitnow-orders";
const USERS_TABLE      = process.env.USERS_TABLE  ?? "needitnow-users";

const GEMINI_MODEL     = "gemini-2.5-flash";
const GEMINI_ENDPOINT  = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GROQ_MODEL       = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT    = "https://api.groq.com/openai/v1/chat/completions";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json",
};

// ── DynamoDB client ───────────────────────────────────────────────────────────
const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: AWS_REGION })
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  try {
    const raw = typeof event.body === "string" ? event.body : JSON.stringify(event.body ?? {});
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Extract path and HTTP method from both API GW v1 and v2 event shapes
function getRouteInfo(event) {
  const method =
    event?.requestContext?.http?.method ??
    event?.httpMethod ??
    "POST";

  // API GW v2 uses rawPath; v1 uses path
  const rawPath =
    event?.rawPath ??
    event?.path ??
    "/";

  // Strip stage prefix if present (e.g. /prod/order → /order)
  const path = rawPath.replace(/^\/[^/]+(?=\/)/, "") || rawPath;

  return { method: method.toUpperCase(), path };
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userMessage, imageBase64) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

  const parts = [];
  if (imageBase64) {
    let mimeType = "image/jpeg";
    if (imageBase64.startsWith("iVBORw")) mimeType = "image/png";
    else if (imageBase64.startsWith("R0lGOD")) mimeType = "image/gif";
    else if (imageBase64.startsWith("UklGR"))  mimeType = "image/webp";
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }
  parts.push({ text: userMessage });

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.4 },
  };

  console.log(`[Gemini] model=${GEMINI_MODEL} hasImage=${!!imageBase64}`);
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error(`Gemini unexpected shape: ${JSON.stringify(data)}`);
  console.log(`[Gemini] OK length=${text.length}`);
  return text;
}

// ── Groq ──────────────────────────────────────────────────────────────────────
async function callGroq(systemPrompt, userMessage) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage  },
    ],
    temperature: 0.4,
  };

  console.log(`[Groq] model=${GROQ_MODEL}`);
  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
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
  if (typeof text !== "string") throw new Error(`Groq unexpected shape: ${JSON.stringify(data)}`);
  console.log(`[Groq] OK length=${text.length}`);
  return text;
}

// ── Route handlers ────────────────────────────────────────────────────────────

/** POST /ai — original LLM proxy */
async function handleAI(event) {
  const body = parseBody(event);
  if (!body) return respond(400, { error: "Invalid JSON body" });

  const { systemPrompt, userMessage, imageBase64 } = body;
  if (!systemPrompt || !userMessage) {
    return respond(400, { error: "Missing required fields: systemPrompt, userMessage" });
  }

  try {
    const text = await callGemini(systemPrompt, userMessage, imageBase64);
    return respond(200, { text });
  } catch (geminiErr) {
    console.error(`[Gemini] Failed: ${geminiErr.message} — falling back to Groq`);
  }

  try {
    const text = await callGroq(systemPrompt, userMessage);
    return respond(200, { text });
  } catch (groqErr) {
    console.error(`[Groq] Failed: ${groqErr.message}`);
    return respond(500, { error: `Both providers failed. Last: ${groqErr.message}` });
  }
}

/** POST /order — save a new order to DynamoDB */
async function handleSaveOrder(event) {
  const body = parseBody(event);
  if (!body) return respond(400, { error: "Invalid JSON body" });

  const { userId, items, total, paymentMode, deliveryMins, address } = body;
  if (!userId || !items || !total) {
    return respond(400, { error: "Missing required fields: userId, items, total" });
  }

  const orderId   = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  const date      = timestamp.split("T")[0];

  const order = {
    orderId,
    userId,
    date,
    timestamp,
    items,           // [{ productId, name, price, qty }]
    total,
    paymentMode:    paymentMode ?? "UPI",
    deliveryMins:   deliveryMins ?? 14,
    address:        address ?? "Koramangala, Bengaluru",
    status:         "delivered",
    savingsAmount:  Math.floor(total * 0.1), // 10% simulated savings
  };

  await dynamo.send(new PutCommand({
    TableName: ORDERS_TABLE,
    Item: order,
  }));

  console.log(`[DynamoDB] Order saved: ${orderId} for user ${userId}`);
  return respond(201, { orderId, message: "Order saved successfully" });
}

/** GET /orders/{userId} — fetch all orders for a user */
async function handleGetOrders(event) {
  // Path params come from API GW path parameters
  const userId =
    event?.pathParameters?.userId ??
    event?.pathParameters?.proxy ??
    (event?.rawPath ?? event?.path ?? "").split("/").pop();

  if (!userId || userId === "orders") {
    return respond(400, { error: "userId is required" });
  }

  const result = await dynamo.send(new QueryCommand({
    TableName:                ORDERS_TABLE,
    IndexName:                "userId-timestamp-index",
    KeyConditionExpression:   "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
    ScanIndexForward:          false, // newest first
    Limit:                     50,
  }));

  console.log(`[DynamoDB] Fetched ${result.Items?.length ?? 0} orders for ${userId}`);
  return respond(200, { orders: result.Items ?? [] });
}

/** GET /user/{userId} — fetch user profile */
async function handleGetUser(event) {
  const userId =
    event?.pathParameters?.userId ??
    (event?.rawPath ?? event?.path ?? "").split("/").pop();

  if (!userId || userId === "user") {
    return respond(400, { error: "userId is required" });
  }

  const result = await dynamo.send(new GetCommand({
    TableName: USERS_TABLE,
    Key:       { userId },
  }));

  if (!result.Item) {
    return respond(404, { error: "User not found" });
  }

  return respond(200, { user: result.Item });
}

/** POST /user — create or update user profile (called after Cognito sign-up) */
async function handleUpsertUser(event) {
  const body = parseBody(event);
  if (!body) return respond(400, { error: "Invalid JSON body" });

  const { userId, name, email, phone, address } = body;
  if (!userId || !email) {
    return respond(400, { error: "Missing required fields: userId, email" });
  }

  const user = {
    userId,
    name:        name    ?? "Aahil Sharma",
    email,
    phone:       phone   ?? "",
    address:     address ?? "Koramangala, Bengaluru",
    memberSince: new Date().toISOString().split("T")[0],
    updatedAt:   new Date().toISOString(),
  };

  await dynamo.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
  }));

  console.log(`[DynamoDB] User upserted: ${userId}`);
  return respond(200, { user, message: "User profile saved" });
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function handler(event) {
  const { method, path } = getRouteInfo(event);
  console.log(`[Handler] ${method} ${path}`);

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  // Route matching
  if (method === "POST" && (path === "/ai" || path === "/default" || path === "/")) {
    return handleAI(event);
  }
  if (method === "POST" && path === "/order") {
    return handleSaveOrder(event);
  }
  if (method === "GET" && path.startsWith("/orders/")) {
    return handleGetOrders(event);
  }
  if (method === "GET" && path.startsWith("/user/")) {
    return handleGetUser(event);
  }
  if (method === "POST" && path === "/user") {
    return handleUpsertUser(event);
  }

  // Legacy: if no path routing (old Lambda URL with no path), treat as AI
  if (method === "POST") {
    return handleAI(event);
  }

  return respond(404, { error: `No route for ${method} ${path}` });
}
