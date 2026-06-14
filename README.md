# NeedItNow — AI-Powered Quick Commerce

> React + Vite + Tailwind · AI Features (Gemini/Groq)

---

## Overview

Amazon Now reimagined as a mobile-first AI-powered shopping experience purpose-built for urgency. Six AI-driven features help customers discover, decide, and purchase what they need in seconds — not minutes.

---

## Features

- **Situation Checkout** — Describe a situation, get instant product suggestions
- **Smart Reorder** — AI predicts what you're running low on
- **Photo to Cart** — Take a photo, AI identifies the product
- **Calendar Shopping** — Upcoming events trigger smart suggestions
- **Panic Mode** — Emergency one-tap ordering
- **Group Cart** — Shop together with family

---

## Architecture

Frontend (React) → Lambda Proxy → Gemini (primary) or Groq (fallback)

All AI requests go through a Lambda proxy. No API keys in frontend.

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

- React 18 + Vite
- Tailwind CSS
- React Router
- Mock testing system (no external dependencies)
- Gemini & Groq APIs (backend)

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

## Quick Start

```bash
git clone https://github.com/utk1college/NeedItNow.git
cd NeedItNow
npm install
npm run dev
```

Open `http://localhost:5173`

**See SETUP_AND_DEPLOY.md for full setup guide.**

---

## AWS Deployment

The team lead deploys:
1. Lambda function (LLM proxy)
2. API Gateway endpoint
3. Amplify frontend

**See SETUP_AND_DEPLOY.md Part B for details.**

---

## Testing

- **Mock mode** (default): Free, instant responses. No setup.
- **Real API mode**: Test with team lead's Lambda. Ask for the URL.

See TESTING_GUIDE.md for details.

---

## Design

- Colors: Orange (#FF9900) for actions, gray backgrounds
- Mobile-first: Max 390px width
- Animations: Fade, slide, scale effects

---

**Setup guide:** SETUP_AND_DEPLOY.md  
**Testing guide:** TESTING_GUIDE.md
