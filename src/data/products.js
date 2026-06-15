export const products = [
  // --- HEALTH (8) ---
  {
    id: 'p001', name: 'Dettol Antiseptic Liquid 250ml', brand: 'Dettol',
    price: 89, mrp: 110,
    image: '/products/p001.jpg',
    category: 'health', tags: ['antiseptic', 'first aid', 'hygiene'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p002', name: 'Calpol 500mg Tablets (15 tabs)', brand: 'GSK',
    price: 32, mrp: 38,
    image: '/products/p002.jpg',
    category: 'health', tags: ['fever', 'paracetamol', 'medicine'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p003', name: 'Omron Digital Thermometer', brand: 'Omron',
    price: 249, mrp: 320,
    image: '/products/p003.jpg',
    category: 'health', tags: ['thermometer', 'fever', 'baby'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p004', name: 'Electral ORS Sachets (Pack of 10)', brand: 'Electral',
    price: 65, mrp: 80,
    image: '/products/p004.jpg',
    category: 'health', tags: ['ors', 'dehydration', 'electrolytes'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p005', name: 'Vicks VapoRub 50g', brand: 'Vicks',
    price: 79, mrp: 95,
    image: '/products/p005.jpg',
    category: 'health', tags: ['cold', 'cough', 'relief'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p006', name: 'Band-Aid Flexible Fabric Strips (30ct)', brand: 'Band-Aid',
    price: 120, mrp: 145,
    image: '/products/p006.jpg',
    category: 'health', tags: ['bandage', 'first aid', 'wound'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p007', name: 'Glucose-D Orange 500g', brand: 'Dabur',
    price: 95, mrp: 115,
    image: '/products/p007.jpg',
    category: 'health', tags: ['energy', 'glucose', 'hydration'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p008', name: 'Ibuprofen 400mg Tablets (10 tabs)', brand: 'Cipla',
    price: 28, mrp: 35,
    image: '/products/p008.jpg',
    category: 'health', tags: ['pain', 'fever', 'anti-inflammatory'], inStock: true, deliveryMins: 12,
  },

  // --- GROCERY (8) ---
  {
    id: 'p009', name: 'Aashirvaad Atta 5kg', brand: 'Aashirvaad',
    price: 235, mrp: 265,
    image: '/products/p009.jpg',
    category: 'grocery', tags: ['flour', 'wheat', 'staple'], inStock: true, deliveryMins: 15,
  },
  {
    id: 'p010', name: 'Amul Taaza Milk 1L', brand: 'Amul',
    price: 68, mrp: 72,
    image: '/products/p010.jpg',
    category: 'grocery', tags: ['milk', 'dairy', 'daily'], inStock: true, deliveryMins: 10,
  },
  {
    id: 'p011', name: "Lay's Classic Salted Chips 90g", brand: "Lay's",
    price: 35, mrp: 40,
    image: '/products/p011.jpg',
    category: 'grocery', tags: ['snacks', 'chips', 'party'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p012', name: 'Thums Up 2L Bottle', brand: 'Thums Up',
    price: 95, mrp: 105,
    image: '/products/p012.jpg',
    category: 'grocery', tags: ['soft drink', 'beverage', 'party'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p013', name: 'Britannia Good Day Cookies 200g', brand: 'Britannia',
    price: 45, mrp: 50,
    image: '/products/p013.jpg',
    category: 'grocery', tags: ['biscuits', 'snacks', 'tea'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p014', name: 'Fortune Sunflower Oil 1L', brand: 'Fortune',
    price: 142, mrp: 165,
    image: '/products/p014.jpg',
    category: 'grocery', tags: ['cooking oil', 'sunflower', 'daily'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p015', name: 'Tata Salt 1kg', brand: 'Tata',
    price: 22, mrp: 25,
    image: '/products/p015.jpg',
    category: 'grocery', tags: ['salt', 'iodized', 'staple'], inStock: true, deliveryMins: 10,
  },
  {
    id: 'p016', name: 'Maggi Masala Noodles (12 pack)', brand: 'Maggi',
    price: 168, mrp: 192,
    image: '/products/p016.jpg',
    category: 'grocery', tags: ['noodles', 'instant', 'quick meal'], inStock: true, deliveryMins: 11,
  },

  // --- BABY (4) ---
  {
    id: 'p017', name: 'Pampers Active Baby Diapers (M, 40 pcs)', brand: 'Pampers',
    price: 649, mrp: 799,
    image: '/products/p017.jpg',
    category: 'baby', tags: ['diapers', 'baby', 'medium'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p018', name: "Johnson's Baby Powder 200g", brand: "Johnson's",
    price: 189, mrp: 220,
    image: '/products/p018.jpg',
    category: 'baby', tags: ['baby powder', 'talc', 'gentle'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p019', name: 'Mamy Poko Pants XL (36 pcs)', brand: 'Mamy Poko',
    price: 549, mrp: 650,
    image: '/products/p019.jpg',
    category: 'baby', tags: ['diapers', 'pants', 'xl'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p020', name: 'Nestlé Nan Pro 1 Formula 400g', brand: 'Nestlé',
    price: 540, mrp: 599,
    image: '/products/p020.jpg',
    category: 'baby', tags: ['formula', 'infant', 'nutrition'], inStock: true, deliveryMins: 15,
  },

  // --- CLEANING (4) ---
  {
    id: 'p021', name: 'Harpic Power Plus Toilet Cleaner 500ml', brand: 'Harpic',
    price: 99, mrp: 120,
    image: '/products/p021.jpg',
    category: 'cleaning', tags: ['toilet', 'cleaner', 'disinfectant'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p022', name: 'Surf Excel Matic Liquid 1L', brand: 'Surf Excel',
    price: 259, mrp: 305,
    image: '/products/p022.jpg',
    category: 'cleaning', tags: ['detergent', 'laundry', 'liquid'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p023', name: 'Colin Glass Cleaner 500ml', brand: 'Colin',
    price: 85, mrp: 99,
    image: '/products/p023.jpg',
    category: 'cleaning', tags: ['glass', 'surface', 'spray'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p024', name: 'Scotch-Brite Scrub Pad (3 pack)', brand: 'Scotch-Brite',
    price: 65, mrp: 78,
    image: '/products/p024.jpg',
    category: 'cleaning', tags: ['scrubber', 'utensils', 'cleaning'], inStock: true, deliveryMins: 11,
  },

  // --- PARTY (4) ---
  {
    id: 'p025', name: 'Paper Plates (50 pcs)', brand: 'Areca',
    price: 120, mrp: 145,
    image: '/products/p025.jpg',
    category: 'party', tags: ['disposable', 'plates', 'party'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p026', name: 'Decorative Balloons Pack (30 pcs)', brand: 'Funcart',
    price: 149, mrp: 199,
    image: '/products/p026.jpg',
    category: 'party', tags: ['balloons', 'decoration', 'birthday'], inStock: true, deliveryMins: 14,
  },
  {
    id: 'p027', name: 'Birthday Cake Candles (24 pcs)', brand: 'Camlin',
    price: 45, mrp: 55,
    image: '/products/p027.jpg',
    category: 'party', tags: ['candles', 'birthday', 'celebration'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p028', name: "Lay's Party Pack Assorted (5 flavours)", brand: "Lay's",
    price: 175, mrp: 200,
    image: '/products/p028.jpg',
    category: 'party', tags: ['chips', 'assorted', 'party'], inStock: true, deliveryMins: 12,
  },

  // --- PERSONAL CARE (4) ---
  {
    id: 'p029', name: 'Colgate MaxFresh Toothpaste 150g', brand: 'Colgate',
    price: 89, mrp: 105,
    image: '/products/p029.jpg',
    category: 'personal_care', tags: ['toothpaste', 'oral care', 'fresh'], inStock: true, deliveryMins: 11,
  },
  {
    id: 'p030', name: 'Dove Body Wash 250ml', brand: 'Dove',
    price: 199, mrp: 235,
    image: '/products/p030.jpg',
    category: 'personal_care', tags: ['body wash', 'moisturizing', 'shower'], inStock: true, deliveryMins: 12,
  },
  {
    id: 'p031', name: 'Gillette Fusion5 Razor', brand: 'Gillette',
    price: 349, mrp: 420,
    image: '/products/p031.jpg',
    category: 'personal_care', tags: ['razor', 'shaving', 'grooming'], inStock: true, deliveryMins: 13,
  },
  {
    id: 'p032', name: 'Whisper Ultra Soft Pads (30 pcs)', brand: 'Whisper',
    price: 189, mrp: 225,
    image: '/products/p032.jpg',
    category: 'personal_care', tags: ['sanitary', 'feminine', 'hygiene'], inStock: true, deliveryMins: 11,
  },
];

export const getProductById = (id) => products.find(p => p.id === id);
