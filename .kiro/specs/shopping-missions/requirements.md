# Requirements Document

## Introduction

Shopping Missions is an AI-powered feature for the NeedItNow app that automatically discovers recurring purchase patterns from a user's order history and converts them into named, reusable "missions." Each mission represents a group of products the user regularly buys together (e.g., "Monthly Grocery Refill", "Baby Care Essentials"). The feature allows users to refill their common shopping bundles in a single tap, with AI-generated names, predictive refill dates, smart substitutes for out-of-stock items, and an emergency reorder input.

## Glossary

- **Mission_Engine**: The pure utility module (`missionEngine.js`) responsible for pattern analysis, cart building, substitution, and scoring logic.
- **Shopping_Missions_Screen**: The React screen component at `/shopping-missions` (`ShoppingMissions.jsx`).
- **Mission_Card**: The UI sub-component that renders a single mission's details.
- **AI_Name_Generator**: The `callClaude` call that generates a human-readable mission name and emoji from a list of product names.
- **Cart_Context**: The existing `CartContext` providing `addItems` to populate the cart.
- **Mission**: A named cluster of ≥ 2 products that a user has purchased together in ≥ 2 orders within a 40-day window.
- **Substitute**: An in-stock product from the same category used in place of an out-of-stock item.
- **Refill_Interval**: The average number of days between purchases of a mission's products, constrained to 7–90 days.
- **Emergency_Mode**: A text input flow where the user describes an urgent need and the system finds the best-matching mission automatically.

## Requirements

### Requirement 1: Purchase Pattern Detection

**User Story:** As a user, I want the app to automatically discover my recurring shopping patterns from my purchase history, so that I don't have to manually create shopping lists for things I regularly buy.

#### Acceptance Criteria

1. WHEN `analyzePurchasePatterns` is called with order history, THE Mission_Engine SHALL identify all product pairs that appear together in ≥ 2 orders and cluster them into missions.
2. WHEN building missions, THE Mission_Engine SHALL group all products that co-occur with ≥ 2 members of an existing cluster into that cluster.
3. THE Mission_Engine SHALL only surface missions with ≥ 2 unique products.
4. THE Mission_Engine SHALL only surface missions whose computed `avgIntervalDays` is between 7 and 90 inclusive.
5. WHEN `analyzePurchasePatterns` is called with the same input multiple times, THE Mission_Engine SHALL return the same missions each time (deterministic behavior).

---

### Requirement 2: Automatic Mission Creation

**User Story:** As a user, I want shopping missions to be created automatically without any manual setup, so that I can start reordering immediately.

#### Acceptance Criteria

1. WHEN the Shopping_Missions_Screen mounts, THE Shopping_Missions_Screen SHALL automatically call `analyzePurchasePatterns` using the existing `orders` data without any user action.
2. WHEN no recurring patterns are found, THE Shopping_Missions_Screen SHALL display an empty state message: "No missions yet. Shop a few more times and we'll detect your patterns."
3. THE Shopping_Missions_Screen SHALL NOT expose any manual mission creation UI.

---

### Requirement 3: AI-Generated Mission Names

**User Story:** As a user, I want each mission to have a friendly, descriptive name so that I can instantly recognize what it contains.

#### Acceptance Criteria

1. WHEN a raw mission is detected, THE AI_Name_Generator SHALL be called with the list of product names in that mission and SHALL return a `name` string and an `emoji` string.
2. THE AI_Name_Generator SHALL return a `name` that is a non-empty string of ≤ 4 words.
3. IF the AI_Name_Generator call fails or returns unparseable JSON, THEN THE Shopping_Missions_Screen SHALL use a fallback name derived from the mission's dominant product category (e.g., "Grocery Refill 🛒").
4. WHEN multiple missions are detected, THE Shopping_Missions_Screen SHALL call the AI_Name_Generator for all missions in parallel using `Promise.all`.

---

### Requirement 4: Mission Dashboard

**User Story:** As a user, I want to see all my shopping missions in a clear dashboard, so that I can review and act on them at a glance.

#### Acceptance Criteria

1. THE Shopping_Missions_Screen SHALL display one Mission_Card for each detected mission.
2. WHEN rendering a Mission_Card, THE Mission_Card SHALL display the mission name, the number of products in the mission, the last ordered date (formatted as human-readable text), and the predicted next refill date.
3. WHEN `predictedDaysUntil` is 0, THE Mission_Card SHALL display "Due Now" instead of a day count.
4. WHEN `predictedDaysUntil` is ≤ 3 and > 0, THE Mission_Card SHALL display a refill nudge banner with the text "Your [Mission Name] may be due soon."
5. THE Mission_Card SHALL display a thumbnail strip showing product images for the first 3 products in the mission.
6. THE Shopping_Missions_Screen SHALL be accessible at the route `/shopping-missions`.

---

### Requirement 5: One-Tap Reorder

**User Story:** As a user, I want to refill a mission with a single tap so that I can rebuild my regular cart in seconds.

#### Acceptance Criteria

1. WHEN a user taps the "Refill Now" button on a Mission_Card, THE Shopping_Missions_Screen SHALL call `buildMissionCart` to resolve all products in the mission, then call `CartContext.addItems` with the resolved products, then navigate to `/cart`.
2. WHEN `buildMissionCart` is called, THE Mission_Engine SHALL return at least one resolved product for every mission product that has an in-stock equivalent (either the original or a substitute).
3. WHEN `buildMissionCart` resolves products, THE Mission_Engine SHALL return a list where each product ID appears at most once.
4. IF all products in a mission are out of stock with no valid substitutes, THEN THE Mission_Card SHALL disable the "Refill Now" button and display "Products unavailable right now."

---

### Requirement 6: Predictive Refill Suggestions

**User Story:** As a user, I want to be reminded when a mission refill is approaching so that I never run out of regular supplies.

#### Acceptance Criteria

1. WHEN computing `predictedDaysUntil` for a mission, THE Mission_Engine SHALL use the average interval between past orders containing that mission's products.
2. WHEN only one prior order exists for a mission, THE Mission_Engine SHALL default `avgIntervalDays` to 30.
3. THE Mission_Engine SHALL clamp `predictedDaysUntil` to a minimum of 0 (overdue missions show "Due Now").
4. WHEN `predictedDaysUntil` ≤ 3, THE Shopping_Missions_Screen SHALL render a "Refill Now" call-to-action prominently on the Mission_Card.

---

### Requirement 7: Mission Adaptation (Smart Substitutes)

**User Story:** As a user, I want unavailable products in my mission to be automatically replaced with the closest alternative, so that my cart is always complete.

#### Acceptance Criteria

1. WHEN `buildMissionCart` encounters a product with `inStock = false`, THE Mission_Engine SHALL call `findSubstitute` to find a replacement.
2. WHEN `findSubstitute` is called, THE Mission_Engine SHALL return a product from the same category that has `inStock = true`, or `null` if no such product exists.
3. WHEN scoring substitute candidates, THE Mission_Engine SHALL assign higher priority to products of the same brand as the original.
4. WHEN scoring substitute candidates, THE Mission_Engine SHALL assign higher priority to products whose price is within 20% of the original product's price.
5. WHEN a substitute is used in the cart, THE Mission_Card SHALL visually indicate which products were substituted (e.g., "Substitute" label on the product).

---

### Requirement 8: Emergency Shopping Mode

**User Story:** As a user, I want to type a quick description of what I need urgently and have the most relevant mission added to my cart automatically, so that I can shop under time pressure.

#### Acceptance Criteria

1. THE Shopping_Missions_Screen SHALL display an emergency text input field with placeholder text "Need something urgently? e.g. 'monthly groceries'".
2. WHEN a user submits text via the emergency input, THE Mission_Engine SHALL call `findBestMission` to identify the highest-scoring mission by keyword overlap with the user's query.
3. WHEN `findBestMission` scores missions, THE Mission_Engine SHALL compare query tokens (case-insensitive) against each mission's name, product names, and product categories.
4. WHEN `findBestMission` returns a non-null mission, THE Shopping_Missions_Screen SHALL call `buildMissionCart`, sort the resolved products by `deliveryMins` ascending, call `CartContext.addItems`, and navigate to `/cart`.
5. IF `findBestMission` returns null (no match found), THEN THE Shopping_Missions_Screen SHALL display the message "Couldn't identify a mission for that. Try 'monthly groceries' or 'baby items'."
6. WHEN building an emergency cart, THE Mission_Engine SHALL sort the resolved products by `deliveryMins` in ascending order so the fastest-delivered items appear first.

---

### Requirement 9: Home Screen Preview Tile

**User Story:** As a user, I want to see my shopping missions highlighted on the home screen so that I can quickly access my most relevant mission without navigating away.

#### Acceptance Criteria

1. THE HomeScreen SHALL render a `ShoppingMissionsPreview` tile in the main scroll body.
2. THE ShoppingMissionsPreview tile SHALL display the name and refill countdown of the top 1–2 missions with the soonest `predictedDaysUntil`.
3. WHEN the ShoppingMissionsPreview tile is tapped, THE HomeScreen SHALL navigate to `/shopping-missions`.
4. IF no missions exist, THE HomeScreen SHALL hide the ShoppingMissionsPreview tile entirely.
