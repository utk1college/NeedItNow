# NeedItNow — Complete Setup, Build & Deployment Guide

For teammates setting up the project from scratch, building locally, testing, and pushing to production.

---

## Table of Contents

1. [Local Setup](#local-setup)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Development & Testing](#development--testing)
4. [Building for Production](#building-for-production)
5. [AWS Deployment](#aws-deployment)
6. [Pushing to GitHub](#pushing-to-github)
7. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites

Ensure you have:
- **Node.js 18+** (check: `node --version`)
- **npm 9+** (check: `npm --version`)
- **Git** (check: `git --version`)
- **AWS Account** (for Lambda deployment)

### Step 1: Clone the Repository

```bash
git clone https://github.com/utk1college/NeedItNow.git
cd NeedItNow
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- React 18
- Vite
- Tailwind CSS
- React Router
- lucide-react

### Step 3: Create `.env` File

Copy the template and add the Lambda endpoint:

```bash
# Create .env in project root
echo "VITE_LLM_PROXY_URL=https://your-lambda-url-here.lambda-url.region.on.aws/" > .env
```

**Important:** `.env` is in `.gitignore` — it won't be pushed to GitHub. Each environment (dev, staging, prod) has its own `.env`.

### Step 4: Verify Setup

```bash
npm run dev
```

You should see:
```
  VITE v8.0.12  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. The app should load with mock data.

---

## Understanding the Architecture

### How the App Works

```
┌─────────────────────────────────┐
│  Frontend (React + Vite)        │
│  - 6 AI features                │
│  - Mock fallbacks for testing   │
└──────────────┬──────────────────┘
               │ HTTPS POST
               │ { systemPrompt, userMessage, imageBase64 }
               │
┌──────────────▼──────────────────┐
│  AWS Lambda (Node.js 20.x)      │
│  - LLM proxy                    │
│  - Function URL (no auth)       │
│  - Environment: GEMINI_API_KEY  │
│                 GROQ_API_KEY    │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐  ┌──▼────────┐
│  Gemini API  │  │ Groq API  │
│  (Primary)   │  │ (Fallback)│
└──────────────┘  └───────────┘
```

### Key Components

| Component | Role | Location |
|---|---|---|
| **Frontend** | React SPA with 6 features | `src/` |
| **LLM Proxy** | Node.js Lambda | `lambda/index.mjs` |
| **Mock System** | Free testing without API calls | `src/utils/mockLLM.js` |
| **API Routes** | 4 features call Lambda via `callLLM()` | `src/utils/claude.js` |

### What's Real vs Mock

| Component | Real | Mock | Notes |
|---|---|---|---|
| **Situation Checkout** | ✅ Gemini AI | ✓ Fallback data | AI generates products for situations |
| **Smart Reorder** | ✅ Gemini AI | ✓ Fallback data | AI analyzes order history |
| **Photo to Cart** | ✅ Gemini AI | ✓ "Blue water bottle" | AI identifies images |
| **Calendar Shopping** | ✅ Gemini AI | ✓ Event-specific lists | AI suggests for events |
| **Panic Mode** | ❌ Hardcoded | ✓ Fixed 5 items | No AI — pre-selected emergency items |
| **Group Cart** | ❌ Simulated | ✓ Static members | No backend — UI demo only |
| **Order History** | ❌ Hardcoded | ✓ Static data | Data from `src/data/orders.js` |

---

## Development & Testing

### Running the Development Server

```bash
npm run dev
```

The server runs on `http://localhost:5173` with hot module reload (HMR). Changes to `.jsx` or `.css` files refresh instantly.

### Testing Modes

NeedItNow has **two testing modes** controlled by one line in `src/utils/claude.js`:

#### Mode 1: Mock Testing (Free, Unlimited)

**File:** `src/utils/claude.js` (Line 12)

```javascript
const USE_MOCK = true; // ← This means use mock responses
```

**What you get:**
- Zero API costs
- Instant responses (~800ms simulated delay)
- Perfect for UI/UX testing
- Works offline

**How to use:**
1. Leave `USE_MOCK = true` in `src/utils/claude.js`
2. Run `npm run dev`
3. Test all features freely
4. Check console: `[LLM] Using MOCK responses`

#### Mode 2: Real API Testing (Costs Credits)

**File:** `src/utils/claude.js` (Line 12)

```javascript
const USE_MOCK = false; // ← This means use real Gemini/Groq
```

**What you get:**
- Real Gemini (primary) + Groq (fallback) responses
- Realistic AI output
- Costs ~$0.003–0.015 per request
- Requires valid `.env` with Lambda URL

**How to use:**
1. Change to `const USE_MOCK = false`
2. Ensure `.env` has a valid `VITE_LLM_PROXY_URL`
3. Run `npm run dev`
4. Make requests
5. Check console: `[LLM] Using REAL Gemini/Groq via Lambda`

### Testing Workflow

#### For Development (Use Mock)

```bash
# 1. Start dev server
npm run dev

# 2. In src/utils/claude.js, set:
const USE_MOCK = true;

# 3. Refresh browser (F5)

# 4. Test features:
# - Go to Home screen
# - Type "my kid has fever" in Situation Checkout
# - Click arrow button
# - See mock product list appear

# 5. Test all 4 AI features:
# - Situation Checkout
# - Smart Reorder
# - Photo to Cart (upload any image)
# - Calendar Shopping (click an event)

# 6. Check browser console for:
# [LLM] Using MOCK responses (set USE_MOCK=false to use real Gemini/Groq)
```

#### For Pre-Production Verification (Use Real APIs)

```bash
# 1. Change to USE_MOCK = false in src/utils/claude.js

# 2. Ensure .env has valid Lambda URL:
VITE_LLM_PROXY_URL=https://k82jc863lh.execute-api.ap-south-2.amazonaws.com/default/needitnow-bedrock-proxy

# 3. Run dev server:
npm run dev

# 4. Test 1-2 features:
# - Make ONE request to each feature
# - Verify real AI responses come back
# - Check console shows [LLM] Using REAL Gemini/Groq via Lambda
# - Verify DevTools Network tab shows POST to Lambda URL

# 5. Done — costs ~$0.02 total for verification
```

### Browser DevTools Debugging

Press **F12** to open DevTools:

1. **Console Tab:**
   - Look for `[LLM] Using MOCK responses` or `[LLM] Using REAL Gemini/Groq`
   - Check for any error messages

2. **Network Tab:**
   - Filter for `fetch` requests
   - Look for POST to your Lambda URL
   - Check request body: `{ systemPrompt, userMessage, imageBase64? }`
   - Check response body: `{ text: "..." }`

3. **Application Tab:**
   - Check `Local Storage` for cart items
   - Verify `VITE_LLM_PROXY_URL` is loaded in Environment

---

## Building for Production

### Step 1: Run the Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder:
- Minified JavaScript
- Optimized CSS
- No source maps
- Ready for deployment

**Expected output:**
```
✓ 127 modules transformed
dist/index.html                   0.46 kB
dist/assets/index.xxxxx.js        234.45 kB
dist/assets/index.xxxxx.css       45.23 kB

✓ built in 12.34s
```

### Step 2: Preview the Build Locally

```bash
npm run preview
```

This starts a local server serving the production build on `http://localhost:5173` (or next available port).

Test the production build exactly as you would in production — with real APIs.

### Step 3: Verify Build Files

```bash
# Check that dist/ folder exists and has content
ls -la dist/

# Expected files:
# - index.html
# - assets/index.*.js
# - assets/index.*.css
```

---

## AWS Deployment

### Part A: Deploy the Lambda Backend

The Lambda is the LLM proxy that sits between your frontend and the AI APIs (Gemini/Groq).

#### Step 1: Get API Keys

1. **Gemini API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Click "Get API Key"
   - Create a new API key
   - Copy it

2. **Groq API Key:**
   - Go to [Groq Console](https://console.groq.com/)
   - Sign up / Log in
   - Go to API Keys
   - Create a new API key
   - Copy it

#### Step 2: Deploy Lambda Function

1. **Create the deployment package:**
   ```bash
   cd lambda
   # The lambda/index.mjs already exists — it's your handler
   # No dependencies needed (uses native fetch)
   ```

2. **AWS Console → Lambda → Create Function:**
   - Name: `needitnow-llm-proxy`
   - Runtime: **Node.js 20.x**
   - Architecture: `x86_64`
   - Execution role: Create new role with basic Lambda permissions
   - Click "Create function"

3. **Upload the code:**
   - Code source: **Upload from** → **.zip file**
   - Create a zip containing only `lambda/index.mjs`
     ```bash
     cd lambda
     zip function.zip index.mjs
     ```
   - Upload the zip
   - Click "Deploy"

4. **Set Environment Variables:**
   - AWS Console → Lambda → Your function → Configuration → Environment variables
   - Add two variables:
     - Key: `GEMINI_API_KEY`, Value: `your-gemini-key`
     - Key: `GROQ_API_KEY`, Value: `your-groq-key`
   - Click "Save"

5. **Enable Function URL:**
   - AWS Console → Lambda → Your function → Function URL
   - Click "Create function URL"
   - Auth type: **NONE** (no authentication)
   - Enable CORS: **Yes**
   - Allowed origins: `*`
   - Click "Save"
   - Copy the Function URL (looks like: `https://xxxx.lambda-url.ap-south-2.on.aws/`)

#### Step 3: Test the Lambda

```bash
curl -X POST https://YOUR_LAMBDA_URL \
  -H "Content-Type: application/json" \
  -d '{"systemPrompt":"Say OK","userMessage":"Test"}'
```

Expected response:
```json
{"text":"OK"}
```

If you see `{"response":"..."}` instead of `{"text":"..."}`, the Lambda handler is wrong. Check `lambda/index.mjs`.

### Part B: Deploy Frontend to AWS Amplify

1. **Ensure repository is on GitHub:**
   ```bash
   git remote -v
   # Should show: origin https://github.com/utk1college/NeedItNow.git
   ```

2. **AWS Console → Amplify → New app → Host web app:**
   - Select GitHub as repository service
   - Authorize Amplify to access your GitHub account
   - Select repository: `NeedItNow`
   - Select branch: `master` (or `main`)
   - Click "Next"

3. **Build settings (auto-detected):**
   - Framework: **React**
   - Build command: `npm run build`
   - Output directory: `dist`
   - No changes needed
   - Click "Next"

4. **Environment variables:**
   - Click "Add environment variable"
   - Name: `VITE_LLM_PROXY_URL`
   - Value: `https://YOUR_LAMBDA_URL/` (paste the Lambda Function URL)
   - Click "Save and deploy"

5. **Wait for deployment:**
   - Amplify will build and deploy automatically
   - Watch the logs in real-time
   - Once complete, you get a URL like: `https://master.xxxxx.amplifyapp.com`

6. **Verify deployment:**
   - Open your Amplify URL in browser
   - Test a feature
   - Check DevTools Console: should show `[LLM] Using REAL Gemini/Groq via Lambda`
   - Verify requests go to your Lambda URL

### Continuous Deployment

After first deployment:
- Every push to GitHub (`git push origin master`) triggers a new build and deployment
- Amplify will rebuild and redeploy automatically
- No manual steps needed

---

## Pushing to GitHub

### Step 1: Commit Your Changes

```bash
# Check what changed
git status

# Stage all files (except .env and node_modules, which are in .gitignore)
git add .

# Commit with a message
git commit -m "Setup: Configure mock testing and add deployment guides"
```

### Step 2: Push to GitHub

```bash
# Push to the master branch
git push origin master

# If it's your first push to a new branch:
git push -u origin master
```

### Step 3: Verify on GitHub

1. Go to https://github.com/utk1college/NeedItNow
2. You should see your commit appear
3. The `dist/` folder won't be there (it's in `.gitignore`)
4. The `.env` file won't be there (it's in `.gitignore`)

### For Team Collaboration

When pulling the latest changes:

```bash
git pull origin master
npm install  # Install any new dependencies
npm run dev  # Start dev server
```

---

## File Structure Reference

```
NeedItNow/
├── .env                           # ← LOCAL ONLY (in .gitignore)
├── .gitignore                     # Excludes .env, node_modules, dist
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
│
├── public/                        # Static assets
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── App.jsx                    # Main router
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── App.css                    # App-level styles
│   │
│   ├── context/
│   │   └── CartContext.jsx        # Shared cart state
│   │
│   ├── data/                      # Mock data
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── calendarEvents.js
│   │   └── users.js
│   │
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── LoadingDots.jsx
│   │   ├── DeliveryBadge.jsx
│   │   └── AvatarPill.jsx
│   │
│   ├── screens/                   # Feature screens
│   │   ├── HomeScreen.jsx
│   │   ├── SituationCheckout.jsx
│   │   ├── SmartReorder.jsx
│   │   ├── PhotoToCart.jsx
│   │   ├── CalendarShopping.jsx
│   │   ├── PanicMode.jsx
│   │   ├── GroupCart.jsx
│   │   ├── CartScreen.jsx
│   │   └── OrderConfirmed.jsx
│   │
│   └── utils/
│       ├── claude.js              # LLM proxy + PROMPTS (← Toggle USE_MOCK here)
│       ├── mockLLM.js             # Mock responses
│       └── helpers.js
│
├── lambda/
│   ├── index.mjs                  # Lambda handler (Gemini/Groq proxy)
│   ├── package.json
│   └── requirements.txt            # (Not used in Node.js version)
│
├── dist/                          # Build output (created by npm run build)
├── node_modules/                  # Dependencies (created by npm install)
│
├── README.md                      # Project overview
├── SETUP_AND_DEPLOY.md            # This file
├── TESTING_GUIDE.md               # Testing guide
└── amplify.yml                    # Amplify deployment config
```

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Issue: Dev server won't start (`npm run dev` fails)

**Solution:**
```bash
# Kill existing processes
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :5173
kill -9 <PID>

# Try again
npm run dev
```

### Issue: `VITE_LLM_PROXY_URL not configured` error

**Solution:**
1. Check that `.env` exists in project root
2. Verify it has: `VITE_LLM_PROXY_URL=https://your-lambda-url`
3. Restart dev server: `npm run dev`

### Issue: Lambda returns `{ "response": "..." }` instead of `{ "text": "..." }`

**This means the old Lambda handler is running.** Solution:
1. Check that `lambda/index.mjs` is deployed (not `lambda_function.py`)
2. Verify handler is set to `index.handler` in AWS Lambda console
3. Redeploy: Upload new zip with `index.mjs`

### Issue: `Mock responses keep appearing, I want real APIs`

**Solution:**
1. Open `src/utils/claude.js`
2. Find line 12: `const USE_MOCK = true;`
3. Change to: `const USE_MOCK = false;`
4. Save and refresh browser
5. Check console should show: `[LLM] Using REAL Gemini/Groq via Lambda`

### Issue: Real API requests fail

**Solution:**
1. Verify `GEMINI_API_KEY` and `GROQ_API_KEY` are set in Lambda environment variables
2. Test Lambda directly:
   ```bash
   curl -X POST https://YOUR_LAMBDA_URL \
     -H "Content-Type: application/json" \
     -d '{"systemPrompt":"Say OK","userMessage":"Test"}'
   ```
3. Check Lambda logs in AWS CloudWatch
4. Verify API keys are still valid and haven't hit quota limits

### Issue: Amplify build fails

**Solution:**
1. Check Amplify deployment logs for exact error
2. Common causes:
   - Missing `VITE_LLM_PROXY_URL` environment variable → Add it in Amplify console
   - Syntax error in code → Check ESLint: `npm run lint`
   - Missing dependency → Run `npm install` locally and push `package-lock.json`
3. Redeploy: Push to GitHub → Amplify auto-rebuilds

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Run ESLint
npm run build           # Build for production
npm run preview         # Preview production build

# Git
git status              # Check what changed
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push origin master  # Push to GitHub

# Lambda
cd lambda
zip function.zip index.mjs   # Create deployment package

# Testing
# → See TESTING_GUIDE.md
```

---

## Support

For issues or questions:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing questions
2. Check Amplify deployment logs for deployment issues
3. Check AWS Lambda CloudWatch logs for API issues
4. Check browser DevTools Console for frontend errors

---

**Last Updated:** June 2026
**Maintained by:** NeedItNow Team
