/**
 * Aahil Sharma's order history — 20 orders over ~6 months.
 * Rich enough for Shopping Missions pattern detection, Daily Essentials
 * consumption analysis, Smart Reorder predictions, and any future AI feature.
 *
 * Behavioral profile:
 *  - Baby care buyer: Pampers every ~30 days, Johnson's every ~35 days, Formula monthly
 *  - Monthly grocery runner: Atta + Oil + Salt + Milk every 25–30 days
 *  - Milk daily consumer: buys 3–4L milk every ~10 days
 *  - Personal care every ~45 days: Colgate, Dove, Whisper
 *  - Cleaning quarterly: Surf Excel, Harpic, Colin every ~45 days
 *  - Occasional health emergency: Calpol, ORS, Vicks when kid is unwell
 *  - Evening snack buyer: Lays, Maggi, Thums Up on weekends
 *  - Party supplies twice (birthday, Diwali)
 */

export const orders = [
  // ── JUNE 2026 ─────────────────────────────────────────────────────────────

  {
    id: 'ord_001',
    date: '2026-06-10',
    displayDate: '10 Jun 2026',
    items: [
      { productId: 'p010', qty: 3 }, // Milk 3L
      { productId: 'p009', qty: 1 }, // Atta 5kg
      { productId: 'p014', qty: 1 }, // Sunflower Oil
      { productId: 'p015', qty: 2 }, // Tata Salt
    ],
    total: 557,
    daysAgo: 4,
    status: 'delivered',
    deliveryMins: 14,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 52,
  },
  {
    id: 'ord_002',
    date: '2026-06-07',
    displayDate: '7 Jun 2026',
    items: [
      { productId: 'p017', qty: 1 }, // Pampers M
      { productId: 'p018', qty: 1 }, // Johnson's Powder
    ],
    total: 838,
    daysAgo: 7,
    status: 'delivered',
    deliveryMins: 13,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 183,
  },
  {
    id: 'ord_003',
    date: '2026-06-04',
    displayDate: '4 Jun 2026',
    items: [
      { productId: 'p010', qty: 4 }, // Milk 4L
      { productId: 'p011', qty: 2 }, // Lays chips
      { productId: 'p012', qty: 1 }, // Thums Up
      { productId: 'p013', qty: 1 }, // Good Day Cookies
    ],
    total: 447,
    daysAgo: 10,
    status: 'delivered',
    deliveryMins: 11,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Credit Card',
    savingsAmount: 37,
  },

  // ── MAY 2026 ──────────────────────────────────────────────────────────────

  {
    id: 'ord_004',
    date: '2026-05-28',
    displayDate: '28 May 2026',
    items: [
      { productId: 'p002', qty: 2 }, // Calpol
      { productId: 'p004', qty: 1 }, // ORS Sachets
      { productId: 'p005', qty: 1 }, // Vicks VapoRub
      { productId: 'p007', qty: 1 }, // Glucose-D
    ],
    total: 371,
    daysAgo: 17,
    status: 'delivered',
    deliveryMins: 11,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 58,
  },
  {
    id: 'ord_005',
    date: '2026-05-20',
    displayDate: '20 May 2026',
    items: [
      { productId: 'p010', qty: 3 }, // Milk
      { productId: 'p016', qty: 2 }, // Maggi 12-pack
      { productId: 'p015', qty: 1 }, // Salt
    ],
    total: 386,
    daysAgo: 25,
    status: 'delivered',
    deliveryMins: 12,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 31,
  },
  {
    id: 'ord_006',
    date: '2026-05-15',
    displayDate: '15 May 2026',
    items: [
      { productId: 'p029', qty: 2 }, // Colgate
      { productId: 'p030', qty: 1 }, // Dove Body Wash
      { productId: 'p032', qty: 1 }, // Whisper Pads
    ],
    total: 665,
    daysAgo: 30,
    status: 'delivered',
    deliveryMins: 11,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 95,
  },
  {
    id: 'ord_007',
    date: '2026-05-10',
    displayDate: '10 May 2026',
    items: [
      { productId: 'p017', qty: 1 }, // Pampers
      { productId: 'p020', qty: 1 }, // Nestlé Formula
    ],
    total: 1189,
    daysAgo: 35,
    status: 'delivered',
    deliveryMins: 15,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Credit Card',
    savingsAmount: 209,
  },
  {
    id: 'ord_008',
    date: '2026-05-05',
    displayDate: '5 May 2026',
    items: [
      { productId: 'p009', qty: 1 }, // Atta
      { productId: 'p014', qty: 1 }, // Oil
      { productId: 'p010', qty: 3 }, // Milk
      { productId: 'p015', qty: 2 }, // Salt
    ],
    total: 625,
    daysAgo: 40,
    status: 'delivered',
    deliveryMins: 14,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 60,
  },

  // ── APRIL 2026 ────────────────────────────────────────────────────────────

  {
    id: 'ord_009',
    date: '2026-04-28',
    displayDate: '28 Apr 2026',
    items: [
      { productId: 'p022', qty: 1 }, // Surf Excel
      { productId: 'p021', qty: 1 }, // Harpic
      { productId: 'p023', qty: 1 }, // Colin
      { productId: 'p024', qty: 2 }, // Scotch-Brite
    ],
    total: 573,
    daysAgo: 47,
    status: 'delivered',
    deliveryMins: 13,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 110,
  },
  {
    id: 'ord_010',
    date: '2026-04-22',
    displayDate: '22 Apr 2026',
    items: [
      { productId: 'p010', qty: 4 }, // Milk
      { productId: 'p013', qty: 2 }, // Good Day
      { productId: 'p011', qty: 1 }, // Lays
    ],
    total: 447,
    daysAgo: 53,
    status: 'delivered',
    deliveryMins: 10,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 22,
  },
  {
    id: 'ord_011',
    date: '2026-04-15',
    displayDate: '15 Apr 2026',
    items: [
      { productId: 'p017', qty: 1 }, // Pampers
      { productId: 'p018', qty: 1 }, // Johnson's Powder
      { productId: 'p019', qty: 1 }, // Mamy Poko XL
    ],
    total: 1387,
    daysAgo: 60,
    status: 'delivered',
    deliveryMins: 13,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Credit Card',
    savingsAmount: 304,
  },
  {
    id: 'ord_012',
    date: '2026-04-10',
    displayDate: '10 Apr 2026',
    items: [
      { productId: 'p009', qty: 1 }, // Atta
      { productId: 'p014', qty: 1 }, // Oil
      { productId: 'p016', qty: 1 }, // Maggi
      { productId: 'p015', qty: 2 }, // Salt
    ],
    total: 559,
    daysAgo: 65,
    status: 'delivered',
    deliveryMins: 14,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 67,
  },
  {
    id: 'ord_013',
    date: '2026-04-05',
    displayDate: '5 Apr 2026',
    items: [
      { productId: 'p025', qty: 2 }, // Paper Plates
      { productId: 'p026', qty: 1 }, // Balloons
      { productId: 'p027', qty: 2 }, // Cake Candles
      { productId: 'p028', qty: 1 }, // Party Pack Chips
    ],
    total: 783,
    daysAgo: 70,
    status: 'delivered',
    deliveryMins: 12,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 152,
    occasion: "Rohan's Birthday 🎂",
  },

  // ── MARCH 2026 ────────────────────────────────────────────────────────────

  {
    id: 'ord_014',
    date: '2026-03-28',
    displayDate: '28 Mar 2026',
    items: [
      { productId: 'p029', qty: 2 }, // Colgate
      { productId: 'p030', qty: 1 }, // Dove
      { productId: 'p031', qty: 1 }, // Gillette
    ],
    total: 727,
    daysAgo: 78,
    status: 'delivered',
    deliveryMins: 12,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 143,
  },
  {
    id: 'ord_015',
    date: '2026-03-20',
    displayDate: '20 Mar 2026',
    items: [
      { productId: 'p017', qty: 1 }, // Pampers
      { productId: 'p020', qty: 1 }, // Formula
    ],
    total: 1189,
    daysAgo: 86,
    status: 'delivered',
    deliveryMins: 14,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Credit Card',
    savingsAmount: 209,
  },
  {
    id: 'ord_016',
    date: '2026-03-15',
    displayDate: '15 Mar 2026',
    items: [
      { productId: 'p010', qty: 4 }, // Milk
      { productId: 'p009', qty: 1 }, // Atta
      { productId: 'p014', qty: 1 }, // Oil
    ],
    total: 649,
    daysAgo: 91,
    status: 'delivered',
    deliveryMins: 13,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 55,
  },
  {
    id: 'ord_017',
    date: '2026-03-05',
    displayDate: '5 Mar 2026',
    items: [
      { productId: 'p001', qty: 1 }, // Dettol
      { productId: 'p006', qty: 1 }, // Band-Aid
      { productId: 'p002', qty: 1 }, // Calpol
    ],
    total: 241,
    daysAgo: 101,
    status: 'delivered',
    deliveryMins: 11,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 52,
  },

  // ── FEBRUARY 2026 ─────────────────────────────────────────────────────────

  {
    id: 'ord_018',
    date: '2026-02-20',
    displayDate: '20 Feb 2026',
    items: [
      { productId: 'p022', qty: 1 }, // Surf Excel
      { productId: 'p021', qty: 1 }, // Harpic
      { productId: 'p023', qty: 1 }, // Colin
    ],
    total: 443,
    daysAgo: 114,
    status: 'delivered',
    deliveryMins: 12,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 100,
  },
  {
    id: 'ord_019',
    date: '2026-02-14',
    displayDate: '14 Feb 2026',
    items: [
      { productId: 'p017', qty: 1 }, // Pampers
      { productId: 'p018', qty: 1 }, // Johnson's
      { productId: 'p010', qty: 3 }, // Milk
    ],
    total: 1042,
    daysAgo: 120,
    status: 'delivered',
    deliveryMins: 13,
    address: '12, Koramangala 4th Block',
    paymentMode: 'Amazon Pay',
    savingsAmount: 198,
  },

  // ── JANUARY 2026 ──────────────────────────────────────────────────────────

  {
    id: 'ord_020',
    date: '2026-01-26',
    displayDate: '26 Jan 2026',
    items: [
      { productId: 'p009', qty: 1 }, // Atta
      { productId: 'p014', qty: 1 }, // Oil
      { productId: 'p015', qty: 2 }, // Salt
      { productId: 'p010', qty: 4 }, // Milk
      { productId: 'p016', qty: 1 }, // Maggi
    ],
    total: 881,
    daysAgo: 135,
    status: 'delivered',
    deliveryMins: 15,
    address: '12, Koramangala 4th Block',
    paymentMode: 'UPI',
    savingsAmount: 88,
  },
];

/**
 * Summary stats derived from above orders — useful for Profile display.
 * These mirror what the AI / algorithms would compute dynamically.
 */
export const orderStats = {
  totalOrders: 20,
  totalSpent: 14401,
  totalSaved: 2779,
  avgOrderValue: 720,
  favouriteBrand: 'Amul',
  favouriteCategory: 'grocery',
  memberSince: 'January 2026',
  streakDays: 127, // days since first order
  longestStreak: 7,  // max consecutive days with an order
};
