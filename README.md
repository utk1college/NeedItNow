# Amazon Now — Reimagining Urgent Shopping

> **HackOn Prototype** · React + Vite · AWS Amplify + Lambda + Gemini/Groq

---

## Overview

Amazon Now reimagined as a mobile-first AI-powered shopping experience purpose-built for urgency. Six AI-driven features help customers discover, decide, and purchase what they need in seconds — not minutes.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Situation Checkout** | Type what's happening ("my kid has fever") → AI builds you a cart |
| 2 | **Panic / Emergency Mode** | One-tap emergency order with live countdown delivery timer |
| 3 | **Smart Re-order** | AI predicts what you're running low on from order history |
| 4 | **Photo to Cart** | Upload a photo → AI identifies the product → add to cart |
| 5 | **Group Cart** | Shop with family, see who added what, split the bill |
| 6 | **Calendar-aware Shopping** | Calendar events trigger proactive AI shopping suggestions |

---

## Architecture

```
Browser (React + Vite)
    │
    │  HTTPS POST  { prompt }
    ▼
AWS Lambda (Node.js 20.x) — Function URL (no auth)
    │
    │  REST API
    ▼
Gemini 2.5 Flash (primary)  OR  Groq Llama-3.3-70B (fallback)
```

**No model-provider API keys ever reach the browser.** The Lambda is the only component that holds AWS credentials (via its execution role).

---

## AWS Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **AWS Amplify Hosting** | Frontend deployment (CI/CD from GitHub) | 1000 build min/mo, 5 GB storage |
| **AWS Lambda** | LLM proxy (Python, Function URL) | 1M requests/mo |
| **Google AI Studio** | Gemini 2.5 Flash (primary) | Free tier available |
| **Groq** | Llama 3.3 70B Versatile (fallback) | Free tier available |

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS v3 (utility-first)
- **Icons:** lucide-react
- **Routing:** React Router v6
- **State:** React useState + useContext (CartContext)
- **AI:** Gemini / Groq via Lambda proxy (`VITE_LLM_PROXY_URL`)
- **Mock data:** `/src/data/*.js`

---

## Project Structure

```
needitnow/
├── src/
│   ├── App.jsx                    # Router + CartProvider
│   ├── context/CartContext.jsx    # Shared cart state
│   ├── data/
│   │   ├── products.js            # 32 mock products
│   │   ├── orders.js              # 8 mock past orders
│   │   ├── calendarEvents.js      # 5 upcoming events + fallbacks
│   │   └── users.js               # 3 household members
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── LoadingDots.jsx
│   │   ├── DeliveryBadge.jsx
│   │   └── AvatarPill.jsx
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── SituationCheckout.jsx  # Feature 1
│   │   ├── PanicMode.jsx          # Feature 2
│   │   ├── SmartReorder.jsx       # Feature 3
│   │   ├── PhotoToCart.jsx        # Feature 4
│   │   ├── GroupCart.jsx          # Feature 5
│   │   ├── CalendarShopping.jsx   # Feature 6
│   │   ├── CartScreen.jsx
│   │   └── OrderConfirmed.jsx
│   └── utils/
│       ├── claude.js              # LLM proxy wrapper + prompts
│       └── helpers.js
└── lambda/
    ├── lambda_function.py         # LLM proxy function (Python)
    └── requirements.txt
```

---

## Setup & Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
# .env (already created — update after Lambda deployment)
VITE_LLM_PROXY_URL=https://<your-function-url>.lambda-url.us-east-1.on.aws/
```

The app works fully **without** the Lambda URL — every AI feature has a hardcoded fallback so the demo always runs.

### 3. Run locally
```bash
npm run dev
```

Open `http://localhost:5173` — use browser DevTools → responsive mode → iPhone 14 (390px) for best experience.

---

## AWS Deployment

### Step 1 — Get API Keys
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Get a Groq API key from [Groq Console](https://console.groq.com/)

### Step 2 — Deploy the Lambda Proxy
```bash
cd lambda
pip install -r requirements.txt -t .
# Windows: use 7-Zip or PowerShell to zip
Compress-Archive -Path * -DestinationPath function.zip
```

1. AWS Console → **Lambda** → Create function → Author from scratch
   - Runtime: **Python 3.12**
   - Upload `function.zip`
2. **Configuration → Environment variables:**
   - `GEMINI_API_KEY` = your Gemini key
   - `GROQ_API_KEY` = your Groq key
3. **Configuration → Function URL** → Create → Auth: **NONE** → Enable CORS
4. Copy the Function URL

### Step 3 — Deploy Frontend to Amplify
1. Push repo to GitHub
2. AWS Console → **Amplify** → New app → Host web app → Connect GitHub repo
3. Build settings are auto-detected (see `amplify.yml`)
4. **App settings → Environment variables** → Add:
   - `VITE_LLM_PROXY_URL` = your Lambda Function URL
5. Deploy → get your live `*.amplifyapp.com` URL

---

## Demo Flow (4 minutes)

1. **Home** → See "Rohan's Birthday — Tomorrow" card → tap
2. **Calendar Shopping** → AI birthday suggestions → "Add all to cart"
3. **Back to Home** → Type *"my kid has fever"* → Situation Checkout → AI cart
4. **Back to Home** → Tap red Emergency card → Panic Mode with countdown
5. **Group Cart** → Priya's items appear via toast → show split payment
6. **Photo to Cart** → "Try sample image" → product detected

---

## Design System

- **Primary:** `#FF9900` (Amazon Orange) — CTAs only
- **Background:** `#F3F3F3` · **Surface:** `#FFFFFF`
- **Font:** Inter (Google Fonts)
- Mobile-first: `max-w-sm mx-auto` (375px)
- Animations: fade-in, slide-up, scale-in (Tailwind keyframes)

---

*Built for HackOn — Amazon Now reimagined.*
