# Testing Guide

## Two Modes

### Mock Testing (Free)

**File:** `src/utils/claude.js` line 12

```javascript
const USE_MOCK = true;
```

- No API keys
- No setup
- Instant responses
- Works offline

### Real API Testing (Team Lead's Lambda)

**File:** `src/utils/claude.js` line 12

```javascript
const USE_MOCK = false;
```

**Setup:**
1. Get Lambda URL from team lead
2. Create `.env`: `VITE_LLM_PROXY_URL=<url>`
3. Restart dev server
4. Test features
5. Switch back to `USE_MOCK = true`

---

## How to Toggle

1. Open `src/utils/claude.js`
2. Line 12: Change between `true` (mock) and `false` (real)
3. Save
4. Refresh browser (F5)

**Console output tells you which mode is active:**
- `[LLM] Using MOCK responses` → Mock mode
- `[LLM] Using REAL Gemini/Groq via Lambda` → Real API mode

---

## Cost

| Mode | Cost | When to Use |
|---|---|---|
| Mock | $0 | Development, UI testing |
| Real | ~$0.003–0.015/request | Final verification only |

---

**Always test with mocks first. Only switch to real for final checks.**
