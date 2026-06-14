# Implementation Plan: Shopping Missions

## Overview

Implement the Shopping Missions feature in the existing NeedItNow React + Vite codebase. The work follows the existing patterns: pure utility module for all logic, a React screen component, an AI prompt + mock, and a home screen preview tile. Tasks are ordered so each step integrates with the previous — no hanging code.

## Tasks

- [ ] 1. Create the `missionEngine.js` utility module with core analysis logic
  - Create `src/utils/missionEngine.js` with the following exported pure functions:
    - `analyzePurchasePatterns(orders, products)` — builds a co-occurrence matrix, clusters products that appear together in ≥2 orders, filters to missions with ≥2 products and `avgIntervalDays` 7–90
    - `predictNextRefill(missionOrders)` — computes `avgIntervalDays` from order intervals; defaults to 30 days when only one order exists; clamps `predictedDaysUntil` to 0 minimum
    - `findSubstitute(original, catalog)` — scores in-stock same-category products, same brand +10, price within 20% +5, returns highest-scoring candidate or `null`
    - `buildMissionCart(mission, products)` — resolves each `productId` to a Product, calls `findSubstitute` for OOS items, deduplicates by product ID, attaches `qty` from order history averages and `isSubstitute` flag
    - `findBestMission(query, missions)` — tokenizes query, scores missions by token overlap against name/product names/categories (case-insensitive), returns top scorer or `null` if score = 0
  - Import `getProductById` from `src/data/products.js` inside the module
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 8.2, 8.3, 8.6_

  - [ ]* 1.1 Write property test for `analyzePurchasePatterns` — mission detection
    - **Property 1: Mission detection from co-occurring products**
    - Use fast-check to generate order histories where at least two orders share a product; assert missions array is non-empty and the shared product appears in a mission
    - **Validates: Requirements 1.1, 1.2, 2.1**

  - [ ]* 1.2 Write property test for `analyzePurchasePatterns` — interval bounds
    - **Property 4: Refill interval bounds**
    - Use fast-check to generate valid order sets; assert all resulting missions have `avgIntervalDays` between 7 and 90
    - **Validates: Requirements 1.4, 6.1**

  - [ ]* 1.3 Write property test for `analyzePurchasePatterns` — idempotence
    - **Property 8: Pattern analysis idempotence**
    - Call `analyzePurchasePatterns` twice with the same input and assert both calls return missions with identical product ID sets
    - **Validates: Requirements 1.5**

  - [ ]* 1.4 Write property test for `findSubstitute` — always in stock and same category
    - **Property 3: Substitute is always in stock and same category**
    - Use fast-check to generate OOS products and catalog arrays; assert return is either `null` or a product with `inStock = true` and matching `category`
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [ ]* 1.5 Write property test for `buildMissionCart` — cart completeness
    - **Property 2: Mission cart completeness with substitutes**
    - Generate random missions and partial-OOS catalogs; assert every product ID in the mission is represented (original or substitute) in the returned list
    - **Validates: Requirements 5.2, 7.1**

  - [ ]* 1.6 Write property test for `buildMissionCart` — no duplicate product IDs
    - **Property 5: No duplicate products in a mission cart**
    - Generate missions; assert the returned array has unique product IDs (deduplicated)
    - **Validates: Requirements 5.3**

  - [ ]* 1.7 Write property test for `findBestMission` — keyword match
    - **Property 6: Emergency mission match on keyword overlap**
    - Generate query strings containing tokens from existing mission names/products; assert `findBestMission` returns a non-null result
    - **Validates: Requirements 8.2, 8.3**

- [ ] 2. Checkpoint — Verify mission engine logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Add Shopping Missions AI prompt to `claude.js` and mock to `mockLLM.js`
  - In `src/utils/claude.js`:
    - Add a `shoppingMissions` entry to the `SYSTEM` object with the prompt: generates a `{ name, emoji }` JSON from a product list; name ≤ 4 words, category-focused
    - Add a `shoppingMissions(productNames)` prompt builder to the `PROMPTS` object returning `{ systemPrompt, userMessage }`
  - In `src/utils/mockLLM.js`:
    - Add a new branch detected by `systemPrompt.includes('mission name')`
    - Return context-appropriate mock responses: grocery products → `{ name: "Monthly Grocery Refill", emoji: "🛒" }`, baby products → `{ name: "Baby Care Essentials", emoji: "👶" }`, personal care → `{ name: "Personal Care Refill", emoji: "🪥" }`, cleaning → `{ name: "Home Cleaning Bundle", emoji: "🧹" }`, fallback → `{ name: "Regular Essentials", emoji: "🛍️" }`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.1 Write property test for AI mission name format
    - **Property 10: AI mission name is a non-empty short string**
    - Call the mock with various product name lists; assert the returned `name` is non-empty and has ≤ 4 words
    - **Validates: Requirements 3.1, 3.2**

- [ ] 4. Create the `MissionCard.jsx` sub-component
  - Create `src/components/MissionCard.jsx`
  - Props: `{ mission: NamedMission, onRefill: fn, isLoading: boolean }`
  - Render using Tailwind, matching the app's card style (`rounded-2xl border border-gray-100 shadow-sm p-4 bg-white`):
    - Top row: `mission.emoji` + `mission.name` (bold) + product count badge (`bg-orange-50 text-orange-700 rounded-full px-2 py-0.5 text-xs`)
    - Middle row: "Last ordered: X days ago" and "Refill in: Y days" (or "Due Now" / "Due Soon" with urgency colors — red for ≤ 0, amber for ≤ 3)
    - Refill nudge banner (amber strip): shown when `predictedDaysUntil ≤ 3 && > 0`, text: "Your [name] may be due soon."
    - Product thumbnail strip: first 3 product images as small `w-10 h-10 rounded-xl` stacked horizontally
    - "Refill Now" CTA: `bg-[#FF9900] text-white rounded-full px-4 py-2 text-sm font-semibold active:scale-95`; disabled + greyed when `resolvedItems.length === 0`
    - Show `<LoadingDots />` inside the button when `isLoading = true`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.4, 6.4_

  - [ ]* 4.1 Write property test for MissionCard data completeness
    - **Property 9: Mission card renders all required fields**
    - Use fast-check to generate random `NamedMission` objects; render `MissionCard` with React Testing Library; assert the rendered output contains the mission name, product count, last ordered text, and refill date text
    - **Validates: Requirements 4.2**

- [ ] 5. Create the `ShoppingMissions.jsx` screen
  - Create `src/screens/ShoppingMissions.jsx`
  - On mount (`useEffect`):
    1. Call `analyzePurchasePatterns(orders, products)` → `rawMissions[]`
    2. `Promise.all(rawMissions.map(...))` each calling `callClaude(PROMPTS.shoppingMissions(productNames))` → named missions
    3. Wrap each AI call with `safeParseJSON`; fall back to category-derived name on parse failure
    4. `setMissions(namedMissions)`, `setLoading(false)`
  - Layout (mobile-first, `max-w-sm mx-auto pb-24 animate-fade-in`):
    - Header: "🎯 Shopping Missions" title + "AI" badge (matching existing section header style)
    - Loading state: `<LoadingDots message="Detecting your patterns..." />`
    - Empty state: plain message card when `missions.length === 0`
    - Mission list: `missions.map(m => <MissionCard ... />)`
    - Emergency section at the bottom:
      - Label: "Need something urgently?"
      - `<input>` with placeholder "e.g. 'monthly groceries' or 'baby items'"
      - Submit button (arrow icon, `#FF9900`)
      - Error message when `findBestMission` returns null
  - `handleRefill(mission)`: call `buildMissionCart`, `addItems`, `navigate('/cart')`
  - `handleEmergencySubmit(e)`: call `findBestMission`, if match then sort by `deliveryMins`, `addItems`, `navigate('/cart')`, else show error
  - Imports: `useCart`, `useNavigate`, `orders`, `products`, `getProductById`, `callClaude`, `PROMPTS`, `safeParseJSON`, `analyzePurchasePatterns`, `buildMissionCart`, `findBestMission`, `MissionCard`, `LoadingDots`
  - _Requirements: 2.1, 2.2, 2.3, 3.3, 3.4, 4.1, 4.6, 5.1, 8.1, 8.4, 8.5_

- [ ] 6. Add `/shopping-missions` route to `App.jsx`
  - Import `ShoppingMissions` from `./screens/ShoppingMissions`
  - Add `<Route path="/shopping-missions" element={<ShoppingMissions />} />` to the `<Routes>` block
  - _Requirements: 4.6_

- [ ] 7. Checkpoint — Verify screen renders and navigation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Create the `ShoppingMissionsPreview` home screen tile and wire into `HomeScreen.jsx`
  - Create the `ShoppingMissionsPreview` component (can be co-located at the top of `HomeScreen.jsx` alongside the other preview functions):
    - Run `analyzePurchasePatterns(orders, products)` synchronously (no AI call — use raw mission data)
    - Sort by `predictedDaysUntil` ascending; take top 2
    - If no missions: return `null` (hide tile entirely)
    - Render a tile matching the home screen style (`bg-white rounded-2xl border border-gray-100 shadow-sm p-4`):
      - Section header: target emoji + "Shopping Missions" label + "AI" badge + "See all →" button navigating to `/shopping-missions`
      - For each top mission: mission emoji + name + `predictedDaysUntil` formatted as "Due in X days" or "Due Now" (red)
      - Full tile is tappable → `navigate('/shopping-missions')`
  - In `HomeScreen`'s JSX scroll body, add `<ShoppingMissionsPreview />` after `<ReorderStrip />` and before `<SmartListsCard />`
  - Add `Target` icon import from `lucide-react` for the section header
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9. Add `BottomNav` entry for Shopping Missions (optional wiring)
  - Open `src/components/BottomNav.jsx` and check if a "Missions" tab slot is available
  - If space exists, add a nav item with a `Target` icon and label "Missions" pointing to `/shopping-missions`
  - If the nav is already full (5 items), skip this task and note it in a comment
  - _Requirements: 4.6_

- [ ] 10. Final checkpoint — Full feature integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify the full flow manually:
    1. Home screen shows the ShoppingMissionsPreview tile with top missions
    2. Tapping the tile navigates to `/shopping-missions`
    3. The screen shows mission cards with AI-generated names (mock)
    4. Tapping "Refill Now" populates the cart and navigates to `/cart`
    5. Typing "monthly groceries" in the emergency input finds the best mission and navigates to `/cart`

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All AI calls use the existing `callClaude` / `USE_MOCK = true` infrastructure — no new API keys required
- `missionEngine.js` contains only pure functions — safe to unit and property test in isolation
- The design uses the actual `orders.js` data which has 8 orders — the pattern analyzer will find: baby care cluster (p017/Pampers recurring), grocery cluster (p009/Atta recurring), personal care cluster (p029/Colgate recurring)
- Checkpoints ensure incremental validation at each integration boundary
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
