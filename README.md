# NeedItNow

> AI-powered ultra-fast delivery — Amazon HackOn submission

**Live:** [https://master.d2s5tb7hcodz7v.amplifyapp.com](https://master.d2s5tb7hcodz7v.amplifyapp.com)

A mobile-first React web app that reimagines urgent grocery and essentials delivery with six AI-driven features. Real AWS backend — Cognito auth, DynamoDB persistence, Lambda + API Gateway.

---

## Sample UI

![NeedItNow UI](./src/assets/ui.png)

---

## AI Features

| Feature | What it does |
|---|---|
| **Situation Checkout** | Describe any situation in plain text — "my kid has fever", "guests arriving in 1 hr" — Gemini builds a contextual cart of 4–6 products instantly |
| **Smart Reorder** | Analyses 6 months of order history and predicts what you're running low on, with high / medium / low urgency |
| **Photo to Cart** | Upload or capture any product image — Gemini Vision identifies it and finds the Amazon Now equivalent |
| **Calendar Shopping** | Upcoming events (birthdays, festivals, dinner parties) automatically trigger event-prep shopping lists |
| **Shopping Missions** | Detects recurring purchase patterns from order history; Gemini names each mission with a friendly label |
| **Daily Essentials** | AI predicts what will run out by tomorrow based on typical household consumption rates |

---

## Everything Else

- **Panic Mode** — Emergency one-tap order with live 11-min countdown timer
- **Group Cart** — Collaborative cart for multiple members, auto bill split per person
- **My Basket** — Three-tab hub: Today essentials / Soon predictions / Custom lists
- **Calendar** — Full interactive monthly calendar, add occasions, shop for any event
- **Search** — Full-text + category + price range + sort filters, Smart Preset chips
- **Payment** — UPI (4 apps), Cards, Wallets, COD with 5-step processing animation
- **Order History** — Live orders from DynamoDB, grouped by month with reorder
- **Profile** — Edit details, sign out, view stats (total orders, spent, saved)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v7 |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans, Syne, Inter |
| Auth | Amazon Cognito — Hosted UI, Authorization Code + PKCE |
| Database | Amazon DynamoDB |
| API | AWS API Gateway + Lambda (Node.js 20.x) |
| AI Primary | Gemini 2.5 Flash |
| AI Fallback | Groq Llama-3.3-70B Versatile |
| Hosting | AWS Amplify — auto-deploy on push to `master` |

---

## Architecture

```
React SPA (mobile, 375px max-width)
        │
        ├── POST /ai          → Lambda → Gemini 2.5 Flash (primary)
        │                               └─ Groq Llama-3.3-70B (fallback)
        │
        ├── POST /order       → Lambda → DynamoDB (needitnow-orders)
        ├── GET  /orders/:id  → Lambda → DynamoDB
        ├── POST /user        → Lambda → DynamoDB (needitnow-users)
        └── GET  /user/:id    → Lambda → DynamoDB
```

Users authenticate via Cognito Hosted UI (Authorization Code + PKCE). JWT stored in `localStorage`, session auto-restores on reload. After sign-in, the user profile syncs to DynamoDB. Every completed order is persisted to DynamoDB through the payment processing step.

---

## Project Structure

```
needitnow/
├── src/
│   ├── App.jsx                       # Router, auth gate, providers
│   ├── context/
│   │   ├── AuthContext.jsx           # Cognito PKCE auth
│   │   └── CartContext.jsx           # In-memory cart state
│   ├── data/
│   │   ├── products.js               # 32 products, 6 categories (INR)
│   │   ├── orders.js                 # 20 seed orders over 6 months
│   │   ├── calendarEvents.js         # 5 upcoming events + fallbacks
│   │   └── users.js                  # Group cart members
│   ├── utils/
│   │   ├── claude.js                 # LLM client, 6 AI prompts
│   │   ├── api.js                    # REST client (order/user endpoints)
│   │   ├── missionEngine.js          # Purchase pattern detection
│   │   └── helpers.js                # formatPrice, safeParseJSON, etc.
│   ├── components/                   # BottomNav, QuantityStepper, MissionCard, etc.
│   └── screens/                      # 21 screens
├── lambda/
│   └── index.mjs                     # Unified handler: AI proxy + DynamoDB routes
└── public/products/                  # 32 product images
```

---

## AWS Infrastructure

| Service | Purpose |
|---|---|
| **AWS Amplify** | Frontend hosting, CI/CD — auto-deploys on push to `master` |
| **AWS Lambda** (Node.js 20.x) | AI proxy (Gemini → Groq fallback) + all DynamoDB routes |
| **AWS API Gateway** | HTTP API routing to Lambda |
| **Amazon DynamoDB** | `needitnow-orders` + `needitnow-users` tables |
| **Amazon Cognito** | User pool, Hosted UI, PKCE auth |

### Lambda Routes

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/ai` | LLM proxy — Gemini primary, Groq fallback |
| `POST` | `/order` | Save order to DynamoDB |
| `GET` | `/orders/{userId}` | Fetch user's orders (GSI, newest first) |
| `GET` | `/user/{userId}` | Fetch user profile |
| `POST` | `/user` | Create / update user profile |

---

## Running Locally

```bash
git clone https://github.com/utk1college/NeedItNow.git
cd NeedItNow
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_URL=https://k82jc863lh.execute-api.ap-south-2.amazonaws.com/default
VITE_LLM_PROXY_URL=https://k82jc863lh.execute-api.ap-south-2.amazonaws.com/default/needitnow-bedrock-proxy

VITE_COGNITO_DOMAIN=ap-south-2ehnitpcvs.auth.ap-south-2.amazoncognito.com
VITE_COGNITO_CLIENT_ID=bcj54suvga12o6t3nh0ggbg4c
VITE_COGNITO_REDIRECT=http://localhost:5173
```

---

## Product Catalog

32 products across 6 categories, all prices in INR:

- **Health** — Dettol, Calpol, Omron thermometer, Electral ORS, Vicks, Band-Aid, Glucose-D, Ibuprofen
- **Grocery** — Aashirvaad Atta, Amul Milk, Lay's, Thums Up, Britannia cookies, Fortune oil, Tata Salt, Maggi
- **Baby** — Pampers, Johnson's powder, Mamy Poko, Nestlé formula
- **Cleaning** — Harpic, Surf Excel, Colin, Scotch-Brite
- **Party** — Paper plates, balloons, cake candles, Lay's party pack
- **Personal Care** — Colgate, Dove body wash, Gillette, Whisper

---

Built for **Amazon HackOn** · React 19 · AWS Amplify + Lambda + DynamoDB + Cognito · Gemini 2.5 Flash
