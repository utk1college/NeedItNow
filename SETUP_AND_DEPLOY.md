# NeedItNow — Setup & Development Guide

---

## Quick Start (5 minutes)

```bash
git clone https://github.com/utk1college/NeedItNow.git
cd NeedItNow
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Setup Steps

### 1. Clone & Install

```bash
git clone https://github.com/utk1college/NeedItNow.git
cd NeedItNow
npm install
```

### 2. Create `.env` (Optional for Mock Testing)

For **mock testing** (free, no API needed): Skip this step.

For **real API testing**: Ask the team lead for the Lambda URL and create `.env`:

```bash
echo "VITE_LLM_PROXY_URL=<lambda-url-from-team-lead>" > .env
```

### 3. Start Dev Server

```bash
npm run dev
```

Navigate to `http://localhost:5173`

---

## Development Modes

### Mock Mode (Default — Free)

```javascript
// src/utils/claude.js line 12
const USE_MOCK = true;
```

- No API keys needed
- Instant responses
- Perfect for UI development
- All features work

**Console output:** `[LLM] Using MOCK responses`

### Real API Mode (Uses Lambda)

```javascript
// src/utils/claude.js line 12
const USE_MOCK = false;
```

**Requirements:**
1. `.env` file with `VITE_LLM_PROXY_URL`
2. Valid Lambda endpoint (ask team lead)

**Console output:** `[LLM] Using REAL Gemini/Groq via Lambda`

**Switch back to mock after testing to avoid charges.**

---

## Testing Checklist

### Test with Mocks (Always Start Here)

```bash
npm run dev
```

1. Leave `USE_MOCK = true`
2. Test Situation Checkout: Type "my kid has fever" → see products
3. Test Smart Reorder: See order predictions
4. Test Photo to Cart: Upload any image
5. Test Calendar Shopping: Click an event

All work instantly, cost $0.

### Test with Real API (Final Verification)

```bash
# 1. Get Lambda URL from team lead via WhatsApp/Slack

# 2. Create .env:
echo "VITE_LLM_PROXY_URL=<paste-url-here>" > .env

# 3. In src/utils/claude.js line 12, change:
const USE_MOCK = false;

# 4. npm run dev

# 5. Test 1-2 features to verify real responses

# 6. Switch back:
const USE_MOCK = true;
```

---

## Project Structure

```
src/
├── screens/              # UI screens — modify these
│   ├── HomeScreen.jsx
│   ├── SituationCheckout.jsx
│   ├── SmartReorder.jsx
│   ├── PhotoToCart.jsx
│   └── CalendarShopping.jsx
├── components/           # Reusable components
│   ├── BottomNav.jsx
│   ├── LoadingDots.jsx
│   └── DeliveryBadge.jsx
├── utils/
│   ├── claude.js         # LLM proxy (don't modify)
│   ├── mockLLM.js        # Mock responses
│   └── helpers.js
├── context/
│   └── CartContext.jsx   # Cart state
└── data/                 # Mock data
    ├── products.js
    ├── orders.js
    └── calendarEvents.js
```

---

## Making Changes

### Edit a Screen

```jsx
// src/screens/HomeScreen.jsx
<button className="bg-blue-500">New Color</button>
```

Save → Auto-reloads in browser.

### Add a Feature

1. Create component in `src/components/`
2. Import in screen
3. Add to layout
4. Test with mocks

---

## Building

```bash
npm run build
```

Creates `dist/` folder with optimized production build.

---

## Git Workflow

```bash
git status                    # See changes
git add src/screens/*.jsx     # Stage changes
git commit -m "feat: description"
git push origin master        # Push to GitHub
```

Amplify auto-deploys on push.

---

## Debugging

**Browser DevTools** (F12):
- **Console:** Look for `[LLM]` messages
- **Network:** Check API requests
- **Application:** View environment variables

---

## Commands Reference

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Dev server won't start | Kill process: `netstat -ano \| findstr :5173` → `taskkill /PID <PID> /F` → `npm run dev` |
| `.env` not loading | Restart dev server after creating `.env` |
| Mock responses | Verify `USE_MOCK = true` in `src/utils/claude.js` line 12 |
| Real API not working | Check `.env` has correct URL, check console for errors |

---

## What NOT to Change

❌ `lambda/index.mjs` — Backend handler  
❌ `src/utils/claude.js` — Only toggle line 12 for testing  
❌ `vite.config.js` — Build config  
❌ `package.json` — Dependencies  

---

**Questions?** Ask team lead.
