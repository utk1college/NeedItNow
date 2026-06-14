# Project Context — Read This First

This document is for AI agents working on this codebase. Read it before making any changes.

---

## What This Is

NeedItNow is a mobile-first React app that reimagines quick-commerce shopping. It's a hackathon prototype. The UI is designed for 390px width (iPhone). 6 features, 4 of which use AI.

---

## Architecture

```
Frontend (React + Vite)
    ↓ POST { systemPrompt, userMessage, imageBase64? }
AWS Lambda (Node.js 20.x) — API Gateway endpoint
    ↓
Gemini 2.5 Flash (primary) → Groq Llama-3.3-70B (fallback)
    ↓ returns { text: "..." }
```

- Frontend has **zero API keys**. All AI goes through the Lambda.
- Lambda URL is in `.env` as `VITE_LLM_PROXY_URL` — not committed to git.
- `.env` is in `.gitignore`.

---

## The ONE Critical Toggle

**`src/utils/claude.js` line 12:**

```javascript
const USE_MOCK = true;  // mock responses, free, no API calls
const USE_MOCK = false; // real Gemini/Groq via Lambda (costs credits)
```

**Default is `true`.** Do not change to `false` unless specifically testing real API responses. Always switch back to `true` after.

---

## File Map

| File | Purpose | Touch? |
|---|---|---|
| `src/App.jsx` | Router + CartProvider | Only to add routes |
| `src/screens/*.jsx` | One file per feature screen | ✅ Main work area |
| `src/components/*.jsx` | Reusable UI pieces | ✅ Safe to modify |
| `src/utils/claude.js` | LLM proxy + PROMPTS | ⚠️ Only toggle line 12 |
| `src/utils/mockLLM.js` | Mock responses per feature | ✅ Update to change mock data |
| `src/utils/helpers.js` | Formatters, utilities | ✅ Safe to modify |
| `src/context/CartContext.jsx` | Global cart state | ⚠️ Careful |
| `src/data/*.js` | Hardcoded mock data | ✅ Safe to modify |
| `lambda/index.mjs` | Lambda handler (Gemini/Groq) | ❌ Don't touch |
| `vite.config.js` | Build config | ❌ Don't touch |
| `tailwind.config.js` | Tailwind config | ❌ Don't touch unless adding theme |

---

## Routes

| Path | Screen | AI? |
|---|---|---|
| `/` | HomeScreen | ❌ |
| `/situation-checkout` | SituationCheckout | ✅ |
| `/smart-reorder` | SmartReorder | ✅ |
| `/photo-to-cart` | PhotoToCart | ✅ |
| `/calendar/:eventId` | CalendarShopping | ✅ |
| `/panic` | PanicMode | ❌ hardcoded |
| `/group-cart` | GroupCart | ❌ simulated |
| `/cart` | CartScreen | ❌ |
| `/order-confirmed` | OrderConfirmed | ❌ |

---

## AI Features — How Each Works

### Situation Checkout (`/situation-checkout`)
- User types a situation ("my kid has fever")
- Calls `callClaude(systemPrompt, userMessage)`
- Expects JSON: `{ items: [{ name, brand, price, reason }] }`
- Has hardcoded fallback in `FALLBACKS` object if AI fails

### Smart Reorder (`/smart-reorder`)
- Loads on mount, reads from `src/data/orders.js`
- Calls `callClaude(systemPrompt, userMessage)` with order history
- Expects JSON: `{ predictions: [{ productName, reasoning, urgency }] }`
- Has `FALLBACK_PREDICTIONS` array

### Photo to Cart (`/photo-to-cart`)
- User uploads image → FileReader converts to base64
- Calls `callClaude(systemPrompt, userMessage, imageBase64)`
- Expects JSON: `{ detected, suggestion: { name, brand, price, category } }`
- Has `FALLBACK_RESULT` constant

### Calendar Shopping (`/calendar/:eventId`)
- `eventId` matches entries in `src/data/calendarEvents.js`
- Calls `callClaude(systemPrompt, userMessage)` with event details
- Expects JSON: `{ headline, items: [{ name, price, reason }] }`
- Has `eventFallbacks` object in calendarEvents.js

---

## LLM API Contract

**Request (frontend → Lambda):**
```json
{
  "systemPrompt": "You are a ...",
  "userMessage": "User situation: ...",
  "imageBase64": "iVBORw0KGgo..." // optional, only for photoToCart
}
```

**Response (Lambda → frontend):**
```json
{
  "text": "{\"items\": [...]}"
}
```

`data.text` is always a JSON string. Parse it with `safeParseJSON()` from `src/utils/helpers.js`.

---

## Adding a New AI Feature

1. Add system prompt to `SYSTEM` object in `src/utils/claude.js`
2. Add prompt builder to `PROMPTS` object in `src/utils/claude.js`
3. Add mock response to `src/utils/mockLLM.js` (detect by systemPrompt keyword)
4. In the screen:
   ```jsx
   import { callClaude, PROMPTS } from '../utils/claude';
   import { safeParseJSON } from '../utils/helpers';

   const { systemPrompt, userMessage } = PROMPTS.yourFeature(input);
   const raw = await callClaude(systemPrompt, userMessage);
   const parsed = safeParseJSON(raw);
   ```
5. Add fallback data for when AI fails

---

## Styling Rules

- Mobile-first: `max-w-sm mx-auto` on all screens
- Primary color: `#FF9900` (orange) — CTAs only
- Background: `#F3F3F3` (page), `#FFFFFF` (cards)
- Cards: `rounded-2xl border border-gray-100 shadow-sm`
- Buttons: `rounded-full active:scale-95 transition-all`
- All screens animate in: `animate-fade-in` class

---

## Cart System

`CartContext` provides:
- `addItem(product, qty)` — add single item
- `addItems([...products])` — add multiple
- `removeItem(id)`
- `updateQty(id, qty)`
- `clearCart()`
- `items`, `total`, `count`

---

## What's Hardcoded / Simulated

| Feature | Status | Notes |
|---|---|---|
| Panic Mode items | Hardcoded | 5 fixed emergency items |
| Group Cart members | Simulated | "Priya" and "Dad" static |
| Order history | Hardcoded | `src/data/orders.js` — 8 fake orders |
| Products catalog | Hardcoded | `src/data/products.js` — 32 products |
| Calendar events | Hardcoded | `src/data/calendarEvents.js` — 5 events |
| Delivery timers | Simulated | Fixed 11–14 min counts |
| Address | Hardcoded | "Koramangala, Bengaluru" |
| User identity | Hardcoded | No auth |

---

## Common Patterns

### Loading state in a screen
```jsx
const [loading, setLoading] = useState(true);
// In async function:
setLoading(true);
// ... do work
setLoading(false);
// In JSX:
{loading ? <LoadingDots message="..." /> : <YourContent />}
```

### Navigate with state
```jsx
navigate('/situation-checkout', { state: { situation: value } });
// Receive:
const { state } = useLocation();
const situation = state?.situation ?? 'default';
```

### Price formatting
```jsx
import { formatPrice } from '../utils/helpers';
formatPrice(249) // → "₹249"
```

---

## Do Not

- ❌ Add API keys to any frontend file
- ❌ Import `@aws-sdk` anywhere in `src/`
- ❌ Call Gemini/Groq directly from frontend
- ❌ Modify `lambda/index.mjs` for frontend changes
- ❌ Set `USE_MOCK = false` and leave it — always revert
- ❌ Commit `.env`
