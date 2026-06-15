# NeedItNow — Backend Setup (DynamoDB + API + Cognito)

This guide covers the **manual AWS steps** to activate the backend that was wired into the code.
Everything in the React app and Lambda is already written — these steps just provision the AWS resources and paste a few values into `.env`.

> **Demo-safe:** Until you do these steps, the app runs fine in **demo mode** — login uses "Continue as Demo User", and order-save calls fail silently and fall back to the seed data. Nothing breaks.

Region used in examples: **ap-south-1 (Mumbai)**. Use whatever region you prefer, but keep it consistent.

---

## 1. DynamoDB — two tables

### Table A: `needitnow-orders`
1. DynamoDB console → **Create table**
2. Table name: `needitnow-orders`
3. Partition key: `orderId` (String)
4. Create table.
5. After it's created, open the table → **Indexes** tab → **Create index** (Global Secondary Index):
   - Partition key: `userId` (String)
   - Sort key: `timestamp` (String)
   - Index name: **`userId-timestamp-index`**  ← must match exactly
   - Create.

### Table B: `needitnow-users`
1. **Create table**
2. Table name: `needitnow-users`
3. Partition key: `userId` (String)
4. Create table.

That's it — no other config needed. On-demand capacity (default) is perfect for a prototype.

---

## 2. Lambda — deploy the updated handler

The Lambda code (`lambda/index.mjs`) now handles both AI and DB routes. It needs the AWS SDK bundled and DynamoDB permissions.

### 2a. Build the deployment zip
From the `lambda/` folder (dependencies are already installed):

```bash
cd lambda
npm install          # already done, but safe to re-run
# zip index.mjs, package.json, package-lock.json AND node_modules
```

On Windows PowerShell:
```powershell
Compress-Archive -Path index.mjs,package.json,package-lock.json,node_modules -DestinationPath function.zip -Force
```

### 2b. Upload to Lambda
1. Lambda console → your existing function (the one behind `VITE_LLM_PROXY_URL`).
2. **Code** tab → **Upload from** → **.zip file** → choose `lambda/function.zip` → Save.
3. Runtime should be **Node.js 20.x**. Handler: `index.handler`.

### 2c. Environment variables
Lambda → **Configuration** → **Environment variables**. Make sure these exist:
| Key | Value |
|---|---|
| `GEMINI_API_KEY` | (your existing key) |
| `GROQ_API_KEY` | (your existing key) |
| `ORDERS_TABLE` | `needitnow-orders` |
| `USERS_TABLE` | `needitnow-users` |
| `AWS_REGION` | *(auto-provided by Lambda — do not set manually)* |

### 2d. IAM permissions (so Lambda can read/write DynamoDB)
1. Lambda → **Configuration** → **Permissions** → click the execution role name (opens IAM).
2. **Add permissions** → **Attach policies** → for a prototype attach **`AmazonDynamoDBFullAccess`**.
   *(Production would use a scoped inline policy, but full access is fine for the hackathon.)*

---

## 3. API Gateway routes

Your Lambda currently sits behind one URL. The handler routes internally by path, so you need these routes pointing at the same Lambda. The simplest approach with **HTTP API (API Gateway v2)**:

1. API Gateway console → your API (or create an **HTTP API**).
2. **Routes** → create these, all integrating with the **same Lambda**:
   - `POST /ai`
   - `POST /order`
   - `GET /orders/{userId}`
   - `GET /user/{userId}`
   - `POST /user`
3. **CORS**: enable it (the Lambda also returns CORS headers, but enabling at the gateway avoids preflight issues):
   - Allow origins: `*` (or your Amplify URL)
   - Allow methods: `GET, POST, OPTIONS`
   - Allow headers: `content-type, authorization`
4. Note the **Invoke URL** base, e.g. `https://abc123.execute-api.ap-south-1.amazonaws.com`
   (if there's a stage like `/default`, include it: `https://abc123.execute-api.ap-south-1.amazonaws.com/default`).

> **Shortcut:** If you don't want to set up multiple routes, the handler also treats a bare `POST /` as the AI route, and you can use a `{proxy+}` catch-all route → same Lambda. The path-based routing in `index.mjs` handles the rest.

---

## 4. Amazon Cognito (optional — demo mode works without it)

1. Cognito console → **Create user pool**.
2. Sign-in options: **Email**. Create the pool (defaults are fine).
3. After creation → **App integration** tab:
   - **Create app client**: type **Public client**, name `needitnow-web`.
   - Do **not** generate a client secret (SPA can't keep secrets).
   - **Hosted UI / Allowed callback URLs**: add your app URLs:
     - `http://localhost:5173` (dev)
     - your Amplify URL, e.g. `https://main.xxxx.amplifyapp.com`
   - **Allowed sign-out URLs**: same URLs.
   - **OAuth grant types**: check **Authorization code grant**.
   - **OpenID Connect scopes**: check **openid**, **email**, **profile**.
4. **Domain**: App integration → **Domain** → create a Cognito domain, e.g.
   `needitnow.auth.ap-south-1.amazoncognito.com`
5. Collect:
   - **Domain** (without `https://`)
   - **App client ID**

---

## 5. Paste values into `.env`

```dotenv
VITE_LLM_PROXY_URL=<your existing AI proxy URL>

# Backend API base URL from step 3 (no trailing slash, include stage if any)
VITE_API_URL=https://abc123.execute-api.ap-south-1.amazonaws.com/default

# Cognito from step 4 (leave blank to stay in demo mode)
VITE_COGNITO_DOMAIN=needitnow.auth.ap-south-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REDIRECT=https://main.xxxx.amplifyapp.com
```

For local testing set `VITE_COGNITO_REDIRECT=http://localhost:5173`.

> If `VITE_API_URL` is left blank, the app uses `VITE_LLM_PROXY_URL` as the API base — fine only if that URL routes all paths to the updated Lambda.

---

## 6. Test the flow

1. `npm run dev`
2. Login screen appears → "Sign in with Amazon" (or "Continue as Demo User").
3. Add items → checkout → pay. On success the order is POSTed to `/order` → DynamoDB.
4. Go to **Profile → Past Orders**. Your new order appears at the top (above the seed data), and the stats (Orders / Spent / Saved) recompute from live data.
5. Verify in the DynamoDB console → `needitnow-orders` → **Explore items**.

---

## What the code already does for you
- `lambda/index.mjs` — routes `/ai`, `/order`, `/orders/{userId}`, `/user`, `/user/{userId}` and talks to DynamoDB.
- `src/utils/api.js` — frontend client for the order/user endpoints (never throws, always returns `{ data, error }`).
- `src/context/AuthContext.jsx` — Cognito Hosted UI login via Authorization Code + PKCE, with demo fallback and session persistence in `localStorage`.
- `src/screens/LoginScreen.jsx` — auth gate UI.
- `src/screens/PaymentProcessing.jsx` — saves the order to DynamoDB on payment success.
- `src/screens/ProfileScreen.jsx` — loads live orders, merges with seed data, recomputes stats, Sign Out button.
- `src/App.jsx` — wraps everything in `AuthProvider` and gates the app behind login.

## Troubleshooting
- **Orders not saving:** check Lambda CloudWatch logs; usually IAM (step 2d) or wrong `ORDERS_TABLE` name.
- **`userId-timestamp-index` error on fetch:** the GSI name in step 1 must match exactly.
- **Login redirect loop / 400:** callback URL in Cognito must match `VITE_COGNITO_REDIRECT` exactly (no trailing slash).
- **CORS errors:** enable CORS at API Gateway (step 3.3).
