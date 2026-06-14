# Testing Guide: Mock vs Real APIs

## Quick Toggle

**File:** `src/utils/claude.js` (Line 12)

```javascript
const USE_MOCK = true; // ← TOGGLE THIS
```

### To use MOCK responses (free, unlimited):
```javascript
const USE_MOCK = true;
```
- No API costs
- Instant responses (~800ms simulated delay)
- Perfect for frontend development and UI testing
- All 4 features work with realistic mock data

### To use REAL Gemini/Groq APIs (costs credits):
```javascript
const USE_MOCK = false;
```
- Real AI responses
- Actual Gemini (primary) + Groq (fallback) model calls
- Costs ~$0.003–0.015 per request
- Only do this for final testing before deployment

---

## How to Switch

### Step 1: Open the file
```
src/utils/claude.js
```

### Step 2: Find line 12
```javascript
const USE_MOCK = true; // ← TOGGLE THIS TO SWITCH BETWEEN MOCK AND REAL
```

### Step 3: Change the value
- **Mock testing:** `const USE_MOCK = true;`
- **Real API testing:** `const USE_MOCK = false;`

### Step 4: Save and refresh
1. Save the file (Ctrl+S)
2. Refresh the browser (F5)
3. Check the browser console (F12) for confirmation:
   - Mock: `[LLM] Using MOCK responses`
   - Real: `[LLM] Using REAL Gemini/Groq via Lambda`

---

## What Gets Mocked

All 4 AI features return realistic mock responses:

| Feature | Mock Response | Real API |
|---|---|---|
| **Situation Checkout** | 5 products for the given situation | Gemini generates custom products |
| **Smart Reorder** | 4 replenishment predictions | Gemini analyzes order history |
| **Photo to Cart** | "Blue water bottle" → Bisleri Water | Gemini analyzes the actual image |
| **Calendar Shopping** | 5 event-specific products | Gemini suggests items for the event |

---

## Testing Workflow

### Development (FREE - Use Mock)
```
const USE_MOCK = true;
```
1. Refresh app
2. Test all 4 features multiple times
3. Verify UI/UX works correctly
4. No cost, unlimited testing

### Pre-Deployment (REAL - Small Cost)
```
const USE_MOCK = false;
```
1. Run 1 smoke test per feature (~4 requests)
2. Verify responses are realistic
3. Check app handles real API responses correctly
4. Cost: ~$0.02–0.05 total

### After Deployment (REAL - Production)
```
const USE_MOCK = false;
```
- Leave as `false` in production
- Real users get real AI responses
- Monitor API costs

---

## Console Output

### When using MOCK:
```
[LLM] Using MOCK responses (set USE_MOCK=false to use real Gemini/Groq)
```

### When using REAL:
```
[LLM] Using REAL Gemini/Groq via Lambda
```

Open DevTools (F12 → Console) to confirm which mode is active.

---

## Cost Comparison

| Scenario | Requests | Cost with Real APIs | Cost with Mock |
|---|---|---|---|
| 1 day of dev testing | 50 | ~$0.15–0.75 | $0 |
| 1 week of dev testing | 350 | ~$1–5 | $0 |
| Full feature testing | 4 | ~$0.02 | $0 |

**Recommendation:** Use mock for 99% of development, real APIs only for final verification.

---

## Troubleshooting

### I see fallback data instead of mock responses
- Check console for errors
- Verify `USE_MOCK = true` in `src/utils/claude.js`
- Restart dev server

### I want to see a real API response
- Change `USE_MOCK = false`
- Save and refresh
- Check console says `[LLM] Using REAL Gemini/Groq`
- Make a request and watch the Lambda URL in DevTools Network tab

### The mock responses feel fake
- They are — they're hardcoded for testing
- Real API is 100x more creative and contextual
- Use `USE_MOCK = false` to see real responses

### How do I know which API responded?
- Open DevTools Console (F12)
- Look for `[LLM]` log message
- Or check Network tab for requests to your Lambda URL
  - **If URL appears:** Real API was used
  - **If no URL appears:** Mock was used
