export const products = [
  // --- HEALTH (8) ---
  {
    id: 'p001', name: 'Dettol Antiseptic Liquid 250ml', brand: 'Dettol',
    price: 89, mrp: 110,
    image: 'https://placehold.co/80x80/FEF3C7/D97706?text=Dettol',
    category: 'health', tags: ['antiseptic', 'first aid', 'hygiene'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p002', name: 'Calpol 500mg Tablets (15 tabs)', brand: 'GSK',
    price: 32, mrp: 38,
    image: 'https://placehold.co/80x80/DBEAFE/1D4ED8?text=Calpol',
    category: 'health', tags: ['fever', 'paracetamol', 'medicine'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p003', name: 'Omron Digital Thermometer', brand: 'Omron',
    price: 249, mrp: 320,
    image: 'https://placehold.co/80x80/D1FAE5/065F46?text=Omron',
    category: 'health', tags: ['thermometer', 'fever', 'baby'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p004', name: 'Electral ORS Sachets (Pack of 10)', brand: 'Electral',
    price: 65, mrp: 80,
    image: 'https://placehold.co/80x80/FCE7F3/9D174D?text=ORS',
    category: 'health', tags: ['ors', 'dehydration', 'electrolytes'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p005', name: 'Vicks VapoRub 50g', brand: 'Vicks',
    price: 79, mrp: 95,
    image: 'https://placehold.co/80x80/EDE9FE/6D28D9?text=Vicks',
    category: 'health', tags: ['cold', 'cough', 'relief'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p006', name: 'Band-Aid Flexible Fabric Strips (30ct)', brand: 'Band-Aid',
    price: 120, mrp: 145,
    image: 'https://placehold.co/80x80/FEE2E2/991B1B?text=BandAid',
    category: 'health', tags: ['bandage', 'first aid', 'wound'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p007', name: 'Glucose-D Orange 500g', brand: 'Dabur',
    price: 95, mrp: 115,
    image: 'https://placehold.co/80x80/FEF9C3/854D0E?text=Glucose',
    category: 'health', tags: ['energy', 'glucose', 'hydration'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p008', name: 'Ibuprofen 400mg Tablets (10 tabs)', brand: 'Cipla',
    price: 28, mrp: 35,
    image: 'https://placehold.co/80x80/CCFBF1/134E4A?text=Cipla',
    category: 'health', tags: ['pain', 'fever', 'anti-inflammatory'], inStock: true, deliveryMins: 12,
  },

  // --- GROCERY (8) ---
  {
    id: 'p009', name: 'Aashirvaad Atta 5kg', brand: 'Aashirvaad',
    price: 235, mrp: 265,
    image: 'https://placehold.co/80x80/FEF3C7/92400E?text=Atta',
    category: 'grocery', tags: ['flour', 'wheat', 'staple'], inStock: true, deliveryMins: 15,
  },
  {
    id: 'p010', name: 'Amul Taaza Milk 1L', brand: 'Amul',
    price: 68, mrp: 72,
    image: 'https://placehold.co/80x80/DBEAFE/1E40AF?text=Milk',
    category: 'grocery', tags: ['milk', 'dairy', 'daily'], inStock: true, deliveryMins: 10,
  },
  {
    id: 'p011', name: 'Lays Classic Salted Chips 90g', brand: "Lay's",
    price: 35, mrp: 40,
    image: 'https://placehold.co/80x80/FEF9C3/713F12?text=Lays',
    category: 'grocery', tags: ['snacks', 'chips', 'party'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p012', name: 'Thums Up 2L Bottle', brand: 'Thums Up',
    price: 95, mrp: 105,
    image: 'https://placehold.co/80x80/D1FAE5/064E3B?text=ThumsUp',
    category: 'grocery', tags: ['soft drink', 'beverage', 'party'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p013', name: 'Britannia Good Day Cookies 200g', brand: 'Britannia',
    price: 45, mrp: 50,
    image: 'https://placehold.co/80x80/FCE7F3/831843?text=GoodDay',
    category: 'grocery', tags: ['biscuits', 'snacks', 'tea'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p014', name: 'Fortune Sunflower Oil 1L', brand: 'Fortune',
    price: 142, mrp: 165,
    image: 'https://placehold.co/80x80/FEF08A/713F12?text=Oil',
    category: 'grocery', tags: ['cooking oil', 'sunflower', 'daily'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p015', name: 'Tata Salt 1kg', brand: 'Tata',
    price: 22, mrp: 25,
    image: 'https://placehold.co/80x80/E0F2FE/0369A1?text=Salt',
    category: 'grocery', tags: ['salt', 'iodized', 'staple'], inStock: true, deliveryMins: 10,
  },
  {
    id: 'p016', name: 'Maggi Masala Noodles (12 pack)', brand: 'Maggi',
    price: 168, mrp: 192,
    image: 'https://placehold.co/80x80/FEF3C7/B45309?text=Maggi',
    category: 'grocery', tags: ['noodles', 'instant', 'quick meal'], inStock: true, deliveryMins: 11,
  },

  // --- BABY (4) ---
  {
    id: 'p017', name: "Pampers Active Baby Diapers (M, 40 pcs)", brand: 'Pampers',
    price: 649, mrp: 799,
    image: 'https://placehold.co/80x80/DBEAFE/1D4ED8?text=Pampers',
    category: 'baby', tags: ['diapers', 'baby', 'medium'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p018', name: 'Johnson\'s Baby Powder 200g', brand: "Johnson's",
    price: 189, mrp: 220,
    image: 'https://placehold.co/80x80/FCE7F3/9D174D?text=JnJ',
    category: 'baby', tags: ['baby powder', 'talc', 'gentle'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p019', name: 'Mamy Poko Pants XL (36 pcs)', brand: 'Mamy Poko',
    price: 549, mrp: 650,
    image: 'https://placehold.co/80x80/EDE9FE/5B21B6?text=MamyPoko',
    category: 'baby', tags: ['diapers', 'pants', 'xl'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p020', name: 'Nestlé Nan Pro 1 Formula 400g', brand: 'Nestlé',
    price: 540, mrp: 599,
    image: 'https://placehold.co/80x80/D1FAE5/064E3B?text=Nestle',
    category: 'baby', tags: ['formula', 'infant', 'nutrition'], inStock: true, deliveryMins: 15,
  },

  // --- CLEANING (4) ---
  {
    id: 'p021', name: 'Harpic Power Plus Toilet Cleaner 500ml', brand: 'Harpic',
    price: 99, mrp: 120,
    image: 'https://placehold.co/80x80/CCFBF1/065F46?text=Harpic',
    category: 'cleaning', tags: ['toilet', 'cleaner', 'disinfectant'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p022', name: 'Surf Excel Matic Liquid 1L', brand: 'Surf Excel',
    price: 259, mrp: 305,
    image: 'https://placehold.co/80x80/DBEAFE/1E3A8A?text=Surf',
    category: 'cleaning', tags: ['detergent', 'laundry', 'liquid'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p023', name: 'Colin Glass Cleaner 500ml', brand: 'Colin',
    price: 85, mrp: 99,
    image: 'https://placehold.co/80x80/E0F2FE/0C4A6E?text=Colin',
    category: 'cleaning', tags: ['glass', 'surface', 'spray'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p024', name: 'Scotch-Brite Scrub Pad (3 pack)', brand: 'Scotch-Brite',
    price: 65, mrp: 78,
    image: 'https://placehold.co/80x80/FEF3C7/92400E?text=ScotchBrite',
    category: 'cleaning', tags: ['scrubber', 'utensils', 'cleaning'], inStock: true, deliveryMins: 11,
  },

  // --- PARTY (4) ---
  {
    id: 'p025', name: 'Paper Plates (50 pcs)', brand: 'Areca',
    price: 120, mrp: 145,
    image: 'https://placehold.co/80x80/FEF9C3/78350F?text=Plates',
    category: 'party', tags: ['disposable', 'plates', 'party'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p026', name: 'Decorative Balloons Pack (30 pcs)', brand: 'Funcart',
    price: 149, mrp: 199,
    image: 'https://placehold.co/80x80/FCE7F3/BE185D?text=Balloons',
    category: 'party', tags: ['balloons', 'decoration', 'birthday'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p027', name: 'Birthday Cake Candles (24 pcs)', brand: 'Camlin',
    price: 45, mrp: 55,
    image: 'https://placehold.co/80x80/FEF3C7/D97706?text=Candles',
    category: 'party', tags: ['candles', 'birthday', 'celebration'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p028', name: 'Lay\'s Party Pack Assorted (5 flavours)', brand: "Lay's",
    price: 175, mrp: 200,
    image: 'https://placehold.co/80x80/FEF9C3/713F12?text=PartyPack',
    category: 'party', tags: ['chips', 'assorted', 'party'], inStock: true, deliveryMins: 12,
  },

  // --- PERSONAL CARE (4) ---
  {
    id: 'p029', name: 'Colgate MaxFresh Toothpaste 150g', brand: 'Colgate',
    price: 89, mrp: 105,
    image: 'https://placehold.co/80x80/D1FAE5/064E3B?text=Colgate',
    category: 'personal_care', tags: ['toothpaste', 'oral care', 'fresh'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p030', name: 'Dove Body Wash 250ml', brand: 'Dove',
    price: 199, mrp: 235,
    image: 'https://placehold.co/80x80/EDE9FE/4C1D95?text=Dove',
    category: 'personal_care', tags: ['body wash', 'moisturizing', 'shower'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p031', name: 'Gillette Fusion5 Razor', brand: 'Gillette',
    price: 349, mrp: 420,
    image: 'https://placehold.co/80x80/DBEAFE/1E40AF?text=Gillette',
    category: 'personal_care', tags: ['razor', 'shaving', 'grooming'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p032', name: 'Whisper Ultra Soft Pads (30 pcs)', brand: 'Whisper',
    price: 189, mrp: 225,
    image: 'https://placehold.co/80x80/FCE7F3/9D174D?text=Whisper',
    category: 'personal_care', tags: ['sanitary', 'feminine', 'hygiene'], inStock: true, deliveryMins: 11,
  },
];

export const getProductById = (id) => products.find(p => p.id === id);
