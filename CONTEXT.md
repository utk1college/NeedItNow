# NeedItNow — Project Context

> Read this entire file before making any changes. This is a hackathon prototype. Every decision here is intentional.

---

## What This Is

**NeedItNow** is an AI-powered quick-commerce mobile web app built for Amazon HackOn. It reimagines urgent grocery and essential delivery with AI-powered features, behavioral pattern detection, smart automation, and **real backend persistence**. Tagline: *"Amazon learns your shopping routines and prepares them before you even ask."*

Target user: Urban Indian consumer needing groceries/medicines delivered in 10–15 minutes. Prototype user is "Aahil Sharma" — a young parent in Koramangala, Bengaluru with a baby at home.

**Now with:**
- ✅ Amazon DynamoDB for orders + user profiles
- ✅ Amazon Cognito for real authentication (email-verified sign-ups)
- ✅ API Gateway routes for backend communication
- ✅ Order persistence across sessions
- ✅ Live order history synced from database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + Tailwind CSS 3 |
| Routing | React Router v7 |
| State | React Context API (CartContext) |
| Auth | Amazon Cognito (Hosted UI, PKCE flow) |
| Database | Amazon DynamoDB |
| API | AWS API Gateway + Lambda |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans (UI), Syne (display/hero), Inter (body) |
| AI Primary | Gemini 2.5 Flash (Google) |
| AI Fallback | Groq Llama-3.3-70B |
| AI Proxy | AWS Lambda (Node.js 20.x) |
| Payment | Simulated (Razorpay-ready architecture) |

---

## Architecture

```
React Frontend (Mobile Web, 390px)
        │
        ├─────────────────────────────┐
        │                             │
        │  POST { systemPrompt, userMessage, imageBase64? }    (AI only)
        │  POST /order (save to DB)
        │  GET /orders/{userId} (fetch from DB)
        │  POST /user (upsert profile)
        │
        ▼                             ▼
AWS Lambda Router            Amazon Cognito
        │                    (Email sign-up/in)
        ├──► Gemini 2.5 Flash         │
        └──► Groq Llama-3.3-70B       │
                                      │
                                      ▼
                            Amazon DynamoDB
                            - needitnow-orders
                            - needitnow-users
```

**Authentication:**
- User logs in via Cognito Hosted UI → Authorization Code + PKCE flow
- Session stored in `localStorage` (auto-restores on reload)
- Demo mode fallback: if Cognito env vars blank, app runs with "Continue as Demo User"

**Data Persistence:**
- Every order after checkout POSTs to Lambda → DynamoDB
- ProfileScreen fetches live orders from DynamoDB + merges with seed data
- No data loss across page reloads or browser sessions (for authenticated users)

---

## THE ONE CRITICAL TOGGLE

**`src/utils/claude.js` line 12:**

```js
const USE_MOCK = true;   // free, no API calls
const USE_MOCK = false;  // real Gemini/Groq via Lambda (costs credits)
```

**Default `true`. Never commit `false`. Always revert after testing.**

When `USE_MOCK = true`, all calls hit `src/utils/mockLLM.js` which detects the feature by `systemPrompt` keyword and returns hardcoded JSON instantly.

---

## Authentication (Cognito)

`.env` controls Cognito:
```
VITE_COGNITO_DOMAIN=ap-south-2ehnitpcvs.auth.ap-south-2.amazoncognito.com
VITE_COGNITO_CLIENT_ID=bcj54suvga12o6t3nh0ggbg4c
VITE_COGNITO_REDIRECT=http://localhost:5173
```

- **Leave blank** → demo mode (one-tap login, no real auth)
- **Fill in** → real Cognito login flow

LoginScreen shows "Sign in with Amazon" if configured, else "Continue as Demo User".

---

## Backend API

`.env` backend URL:
```
VITE_API_URL=https://k82jc863lh.execute-api.ap-south-2.amazonaws.com/default
```

Routes (all via Lambda):
| Method | Path | Purpose |
|---|---|---|
| POST | `/order` | Save order to DynamoDB |
| GET | `/orders/{userId}` | Fetch user's orders |
| GET | `/user/{userId}` | Fetch user profile |
| POST | `/user` | Create/update user profile |
| POST | `/ai` | LLM proxy (original) |

All endpoints fail gracefully — order save fails? It logs a warning and the order is lost (demo data remains).

---

## Complete Route Map

| Path | Screen | AI? |
|---|---|---|
| `/` | `HomeScreen.jsx` | ❌ |
| `/search` | `SearchScreen.jsx` | ❌ — filters + Smart Presets + Incognito |
| `/situation` | `SituationLanding.jsx` | ❌ — entry page |
| `/situation-checkout` | `SituationCheckout.jsx` | ✅ — Gemini builds cart from text |
| `/panic` | `PanicMode.jsx` | ❌ — hardcoded items, qty steppers |
| `/my-basket` | `MyBasket.jsx` | ✅ (Soon tab) — 3-tab hub |
| `/daily-essentials` | `DailyEssentials.jsx` | ✅ (legacy path) |
| `/smart-reorder` | `SmartReorder.jsx` | ✅ — Gemini predicts restock |
| `/photo-to-cart` | `PhotoToCart.jsx` | ✅ — Gemini Vision |
| `/shopping-missions` | `ShoppingMissions.jsx` | ✅ (naming only) |
| `/calendar-home` | `CalendarScreen.jsx` | ❌ — full interactive calendar |
| `/calendar/:eventId` | `CalendarShopping.jsx` | ✅ — Gemini event prep |
| `/group-cart` | `GroupCart.jsx` | ❌ — simulated |
| `/cart` | `CartScreen.jsx` | ❌ — group mode toggle |
| `/payment` | `PaymentScreen.jsx` | ❌ — simulated UPI/card/COD |
| `/payment-processing` | `PaymentProcessing.jsx` | ❌ — 5s animation |
| `/order-confirmed` | `OrderConfirmed.jsx` | ❌ |
| `/profile` | `ProfileScreen.jsx` | ❌ — profile + past orders |
| `/lists` | `SmartLists.jsx` | ❌ (legacy route) |
| `/smart-presets` | `SmartPresets.jsx` | ❌ |

**Bottom nav (4 tabs):** Home `/` · Cart `/cart` · Basket `/my-basket` · Profile `/profile`

---

## AI Features — How Each Works

### 1. Situation Checkout (`/situation` → `/situation-checkout`)
User describes a situation in natural language. Gemini returns 4–6 contextually relevant products. Items have individual checkboxes + `QuantityStepper` before ordering.

- **Prompt:** `PROMPTS.situationCheckout(situation)`
- **Response:** `{ "items": [{ "name", "brand", "price", "reason" }] }`
- **Fallback:** `FALLBACKS` object in `SituationCheckout.jsx` keyed by situation type

### 2. Smart Reorder (`/my-basket` Soon tab + `/smart-reorder`)
Reads 20 orders from `orders.js`, Gemini predicts what's running low. Items have quantity steppers — price × qty shown in total and CTA.

- **Prompt:** `PROMPTS.smartReorder(orderHistory)`
- **Response:** `{ "predictions": [{ "productName", "reasoning", "urgency": "high|medium|low" }] }`
- **Fallback:** `FALLBACK_PREDICTIONS` in `SmartReorder.jsx`

### 3. Photo to Cart (`/photo-to-cart`)
User uploads image → base64 → Gemini Vision identifies product. Only feature using image input.

- **Prompt:** `PROMPTS.photoToCart()` + `imageBase64`
- **Response:** `{ "detected", "suggestion": { "name", "brand", "price", "category" } }`
- **Fallback:** `FALLBACK_RESULT` in `PhotoToCart.jsx`

### 4. Calendar Shopping (`/calendar/:eventId`)
Reads event from `calendarEvents.js`. Gemini suggests event-prep products. Items now have per-item `QuantityStepper`.

- **Prompt:** `PROMPTS.calendarShopping(event)`
- **Response:** `{ "headline", "items": [{ "name", "price", "reason" }] }`
- **Fallback:** `eventFallbacks[event.type]` in `calendarEvents.js`

### 5. Shopping Missions (`/shopping-missions`)
Pattern detection is **pure algorithm** in `missionEngine.js` (no AI). AI used only to name missions.

- **Prompt:** `PROMPTS.shoppingMissions(productNames)`
- **Response:** `{ "name": "Monthly Grocery Refill", "emoji": "🛒" }`
- **Fallback:** `CATEGORY_FALLBACKS` in `ShoppingMissions.jsx`

### 6. Daily Essentials (`/my-basket` Today tab + `/daily-essentials`)
Today tab = 16 hardcoded items in 4 categories. AI call exists but is not wired to the bento UI — items are static. Each item has a qty stepper in the category modal.

---

## LLM API Contract

**Request:**
```json
{ "systemPrompt": "...", "userMessage": "...", "imageBase64": "..." }
```

**Response:**
```json
{ "text": "{\"items\": [...]}" }
```

`data.text` is always a JSON string. Always parse with `safeParseJSON()`. Never trust raw string.

---

## Adding a New AI Feature

1. Add system prompt to `SYSTEM` in `claude.js`
2. Add prompt builder to `PROMPTS` in `claude.js`
3. Add mock branch in `mockLLM.js` — detect by `systemPrompt.includes('your keyword')`
4. In screen:
```jsx
const { systemPrompt, userMessage } = PROMPTS.yourFeature(input);
const raw = await callClaude(systemPrompt, userMessage);
const parsed = safeParseJSON(raw); // null if bad JSON — always handle
```
5. Add hardcoded fallback data

---

## Data Files

### `src/data/products.js` — 32 products
Real product images from Blinkit CDN (`cdn.grofers.com`). Categories: `health` (8), `grocery` (8), `baby` (4), `cleaning` (4), `party` (4), `personal_care` (4).

```js
{
  id: 'p001', name: 'Dettol Antiseptic Liquid 250ml', brand: 'Dettol',
  price: 89, mrp: 110,
  image: 'https://cdn.grofers.com/cdn-cgi/image/...',
  category: 'health', tags: [...], inStock: true, deliveryMins: 12,
}
```

### `src/data/orders.js` — 20 orders over 6 months
Rich behavioral profile: Pampers ~30 days, Milk ~10 days, Atta ~25 days, personal care ~45 days. Each order has: `date`, `displayDate`, `items[]`, `total`, `daysAgo`, `status`, `deliveryMins`, `address`, `paymentMode`, `savingsAmount`. Also exports `orderStats` with totals + member since.

### `src/data/calendarEvents.js` — 5 seed events + `eventFallbacks` by type

### `src/data/users.js` — 3 simulated Group Cart users (You, Priya, Dad)

---

## Cart System

`CartContext` (`src/context/CartContext.jsx`):

| Method | Description |
|---|---|
| `addItem(product, qty)` | Add/merge single item |
| `addItems([...])` | Add/merge multiple |
| `removeItem(id)` | Remove by id |
| `updateQty(id, qty)` | Update qty; removes at 0 |
| `clearCart()` | Empty cart |
| `cartItems`, `total`, `itemCount` | State values |

Cart is **not persisted** — resets on page reload.

---

## Checkout Flow

```
Any feature → navigate('/payment', { state: { orderTotal, deliveryMins, isEmergency } })
PaymentScreen  — UPI / Card / Wallet / COD selection, clearCart() on pay
PaymentProcessing  — 5 sequential status steps over 5 seconds
OrderConfirmed  — ETA + progress bar
```

---

## Quantity Steppers

Shared `QuantityStepper` component in `src/components/QuantityStepper.jsx`.

```jsx
import { QuantityStepper } from '../components/QuantityStepper';

<QuantityStepper
  qty={qty}
  onChange={(newQty) => handleQtyChange(newQty)}
  min={1}      // default 1; set 0 to allow deselect-via-decrement
  size="sm"    // 'sm' | 'md'
/>
```

Quantity steppers are present in:
- **SituationCheckout** — per AI-suggested item
- **CalendarShopping** — per event-prep item  
- **My Basket Today tab** — per daily essential (stepper replaces checkmark when selected)
- **My Basket Soon tab** — per prediction (stepper replaces checkbox when selected)
- **PanicMode** — per emergency item + per product in "Add more" modal
- **CartScreen** — per cart item (always visible)

---

## Shared Components

| Component | File | Purpose |
|---|---|---|
| `BottomNav` | `components/BottomNav.jsx` | Glass nav, 4 tabs, cart badge |
| `DeliveryBadge` | `components/DeliveryBadge.jsx` | Green "X min" pill |
| `LoadingDots` | `components/LoadingDots.jsx` | AI loading spinner |
| `AvatarPill` | `components/AvatarPill.jsx` | User avatar + name |
| `MissionCard` | `components/MissionCard.jsx` | Shopping Mission card |
| `QuantityStepper` | `components/QuantityStepper.jsx` | `+`/`−` qty control |
| `CategoryBrowse` | `components/CategoryBrowse.jsx` | Home category grid + product strips |

---

## Utilities

### `src/utils/helpers.js`
- `formatPrice(n)` → `"₹249"`
- `timeAgo(daysAgo)` → `"Yesterday"` / `"5 days ago"`
- `daysFromNowLabel(n)` → `"Tomorrow"` / `"In 3 days"`
- `safeParseJSON(raw)` → parse AI JSON string, returns `null` on failure
- `generateOrderId()` → `"ORD-ABC123"`
- `randomDeliveryMins(base)` → random mins

### `src/utils/missionEngine.js` — Pure functions, no React
- `analyzePurchasePatterns(orders, products)` → detects recurring missions
- `buildMissionCart(mission, products)` → resolves products + substitutes OOS
- `findSubstitute(original, catalog)` → same-category substitute scoring (same brand +10, price within 20% +5)
- `predictNextRefill(missionOrders)` → avg interval + days until next refill
- `findBestMission(query, missions)` → keyword overlap scoring

---

## Styling Rules

| Rule | Value |
|---|---|
| Viewport | 390px iPhone |
| Page wrapper | `max-w-sm mx-auto` on every screen |
| Background | `#F7F8FC` (not `#F3F3F3`) |
| Primary CTA | `#FF9900` orange — CTAs only |
| Cards | `rounded-2xl border border-gray-100 shadow-sm` |
| Buttons | `rounded-full active:scale-95 transition-all` |
| Entry animation | `animate-fade-in` on root div |
| Hero header | `linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)` |
| Font — UI | `Plus Jakarta Sans` (Tailwind `font-sans`) |
| Font — Display/Hero | `Syne` via `.font-display` CSS class |

### z-index / scroll overlap rule
Sticky headers must use `z-50` minimum. The scrollable body must have `style={{ isolation: 'isolate' }}` so card stacking contexts never paint over the header.

---

## Home Screen Feed Order

1. 🚨 Emergency Mode (PanicCard) — red gradient
2. ⚡ Situation Checkout — orange gradient → `/situation`
3. 📅 My Calendar — → `/calendar-home`
4. 🎯 Shopping Missions preview
5. ── Browse divider ──
6. Category Browse (7 sections × 4-col chips + horizontal product scrolls)
7. NeedItNow footer

---

## My Basket Screen (`/my-basket`)

Three tabs with a shared dark navy gradient header:

| Tab | Content | AI? |
|---|---|---|
| **Today** | Daily Essentials — 2×2 category grid, tap to open item modal, qty steppers | ❌ static |
| **Soon** | Smart Reorder — AI predictions, qty steppers replace checkboxes | ✅ Gemini |
| **My Lists** | User-created custom lists, product search picker to fill them | ❌ |

Sticky CTA at bottom shows total qty × price for selected items.

---

## What's Hardcoded / Simulated

| Feature | Status |
|---|---|
| Delivery address | "Koramangala, Bengaluru" — hardcoded |
| Delivery times | Fixed per product (10–15 min) |
| Order history | 20 fake orders in `orders.js` |
| Products catalog | 32 products in `products.js` (real images from Blinkit CDN) |
| Calendar events | 5 seed events in `CalendarScreen.jsx` (in-memory additions) |
| Group Cart members | Priya + Dad hardcoded; "Priya adds item" is a 3s timer |
| Payment gateway | Fully simulated — no real charge |
| User identity | "Aahil Sharma" — no auth |
| Groups in Cart | 3 hardcoded groups in `CartScreen.jsx` |
| Smart Presets | 6 hardcoded chips in `SearchScreen.jsx` |
| Daily Essentials items | 16 hardcoded items — not personalized |

---

## File Map — What to Touch

| File/Dir | Touch? | Notes |
|---|---|---|
| `src/screens/*.jsx` | ✅ | Main work area |
| `src/components/*.jsx` | ✅ | Safe to add/modify |
| `src/utils/helpers.js` | ✅ | Add utility functions |
| `src/utils/mockLLM.js` | ✅ | Add mock branches for new AI features |
| `src/utils/missionEngine.js` | ✅ | Pure functions, safe to extend |
| `src/data/*.js` | ✅ | Add products, events, orders |
| `src/context/CartContext.jsx` | ⚠️ | Core state — don't break existing API |
| `src/utils/claude.js` | ⚠️ | Only add prompts — never change `callLLM` |
| `src/App.jsx` | ⚠️ | Routes only — add `<Route>` entries |
| `lambda/index.mjs` | ❌ | Never — Lambda handler |
| `vite.config.js` | ❌ | Never |
| `tailwind.config.js` | ⚠️ | Theme tokens only |

---

## Do Not

- ❌ Add API keys to `src/`
- ❌ Import `@aws-sdk` in `src/`
- ❌ Call Gemini/Groq directly from frontend
- ❌ Set `USE_MOCK = false` and commit
- ❌ Commit `.env`
- ❌ Use `position: fixed` for headers — use `sticky top-0`
- ❌ Add `z-10` to card inner elements — use `isolation: isolate` on scroll body
- ❌ Skip `safeParseJSON` on AI responses

---

## Common Patterns

```jsx
// Loading state
{loading ? <LoadingDots message="..." /> : <YourContent />}

// Navigate with state
navigate('/situation-checkout', { state: { situation: value } });
const { state } = useLocation();
const situation = state?.situation ?? 'default';

// AI call with fallback
try {
  const { systemPrompt, userMessage } = PROMPTS.yourFeature(input);
  const raw = await callClaude(systemPrompt, userMessage);
  const parsed = safeParseJSON(raw);
  setData(parsed?.items?.length ? parsed.items : FALLBACK_DATA);
} catch {
  setData(FALLBACK_DATA);
}

// Add to cart + confirm flash (1.8s)
const handleAdd = (product) => {
  addItem(product, 1);
  setAddedIds(prev => new Set([...prev, product.id]));
  setTimeout(() => setAddedIds(prev => {
    const n = new Set(prev); n.delete(product.id); return n;
  }), 1800);
};
```

---

## Build Commands

```bash
npm run dev      # dev server (run manually)
npm run build    # production build — verify before PRs
npm run lint     # ESLint check
```

Build must pass with zero errors. Run `npm run build` to verify.
