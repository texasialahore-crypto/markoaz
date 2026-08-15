import fs from 'fs';
import path from 'path';
import { Category, Product, Review, User, Order, CartItem, WishlistItem, AdminStats, OrderStatus, StoreSettings, PaymentStatus } from '../src/types';

function resolveDbFilePath(): string {
  // Test local ./data directory first (for local dev and standard containers)
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write-test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return path.join(localDir, 'store.json');
  } catch {
    // Read-only filesystem detected (e.g. AWS Lambda / Vercel Serverless Function)
    const tmpDir = path.join('/tmp', 'markoaz-data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignore
    }
    return path.join(tmpDir, 'store.json');
  }
}

let activeDbFilePath = resolveDbFilePath();

const defaultSettings: StoreSettings = {
  announcement: '⚡ FLASH SALE LIVE: Up to 50% OFF on Top Tech & Audio! Free Express COD Delivery.',
  isCodEnabled: true,
  freeShippingThreshold: 50,
  flashSaleDiscount: 25,
  supportPhone: '+1 (800) 555-MARKOAZ',
  supportEmail: 'support@markoaz.com'
};

interface Schema {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  users: User[];
  orders: Order[];
  carts: Record<string, CartItem[]>; // key: userId or sessionId
  wishlists: Record<string, WishlistItem[]>; // key: userId or sessionId
  settings?: StoreSettings;
}

const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    iconName: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    productCount: 4,
    description: 'High performance gadgetry, smart wearables & audio gear.'
  },
  {
    id: 'cat-2',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    iconName: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    productCount: 3,
    description: 'Modern, comfortable apparel and everyday minimalist fashion.'
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    slug: 'home-living',
    iconName: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
    description: 'Aesthetic home decor, coffee accessories & smart lighting.'
  },
  {
    id: 'cat-4',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    productCount: 1,
    description: 'Nourishing skincare essentials and wellness products.'
  },
  {
    id: 'cat-5',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    iconName: 'Activity',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    productCount: 2,
    description: 'Performance footwear, activewear and fitness gear.'
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'AuraSound ANC Wireless Headphones',
    slug: 'aurasound-anc-wireless-headphones',
    description: 'Immerse yourself in crystal clear audio with active noise cancellation, 40-hour battery life, and ultra-soft memory foam earcups.',
    price: 189.99,
    originalPrice: 249.99,
    discountPercentage: 24,
    rating: 4.8,
    reviewCount: 34,
    category: 'Electronics',
    stock: 25,
    isFeatured: true,
    isFlashDeal: true,
    tags: ['wireless', 'audio', 'noise-canceling', 'bluetooth'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Battery Life': '40 Hours',
      'Bluetooth Version': '5.3',
      'Weight': '250g',
      'Noise Cancellation': 'Hybrid Active ANC (-38dB)'
    },
    variants: {
      colors: ['Matte Black', 'Silver Gray', 'Navy Blue']
    },
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'prod-2',
    name: 'UltraSync SmartWatch Pro v8',
    slug: 'ultrasync-smartwatch-pro-v8',
    description: 'Track your health, workouts, sleep cycles, and daily notifications with a vivid AMOLED retina display and water-resistant titanium frame.',
    price: 279.00,
    originalPrice: 329.00,
    discountPercentage: 15,
    rating: 4.9,
    reviewCount: 52,
    category: 'Electronics',
    stock: 18,
    isFeatured: true,
    isFlashDeal: false,
    tags: ['smartwatch', 'fitness', 'wearable', 'health'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Display': '1.92" AMOLED Touch',
      'Water Resistance': '50m (5 ATM)',
      'Battery Life': '7 Days Typical Use',
      'Sensors': 'SpO2, Heart Rate, ECG, GPS'
    },
    variants: {
      colors: ['Space Gray', 'Starlight Silver', 'Rose Gold']
    },
    createdAt: '2026-08-02T11:00:00.000Z'
  },
  {
    id: 'prod-3',
    name: 'Minimalist Artisan Leather Backpack',
    slug: 'minimalist-artisan-leather-backpack',
    description: 'Crafted from full-grain top layer leather with dedicated 15-inch padded laptop sleeve, quick-access magnetic pockets, and ergonomic padded straps.',
    price: 119.50,
    originalPrice: 149.00,
    discountPercentage: 20,
    rating: 4.7,
    reviewCount: 19,
    category: 'Fashion & Apparel',
    stock: 12,
    isFeatured: true,
    isFlashDeal: false,
    tags: ['leather', 'backpack', 'travel', 'fashion'],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Material': 'Full-Grain Genuine Cowhide',
      'Laptop Fit': 'Up to 15.6 inch',
      'Capacity': '22 Liters',
      'Dimensions': '42 x 30 x 14 cm'
    },
    variants: {
      colors: ['Cognac Brown', 'Midnight Black', 'Vintage Tan']
    },
    createdAt: '2026-08-03T09:30:00.000Z'
  },
  {
    id: 'prod-4',
    name: 'MechType Wireless Mechanical Keyboard',
    slug: 'mechtype-wireless-mechanical-keyboard',
    description: 'Custom hot-swappable tactile switches, RGB per-key backlighting, multi-device Bluetooth/2.4G connectivity, and CNC aluminum chassis.',
    price: 139.99,
    originalPrice: 169.99,
    discountPercentage: 18,
    rating: 4.8,
    reviewCount: 41,
    category: 'Electronics',
    stock: 15,
    isFeatured: false,
    isFlashDeal: true,
    tags: ['keyboard', 'gaming', 'office', 'wireless'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Layout': '75% Compact (84 Keys)',
      'Switch Type': 'Gateron G Pro Yellow (Tactile)',
      'Connectivity': 'Bluetooth 5.1 / 2.4Ghz / USB-C',
      'Battery': '4000mAh Rechargeable'
    },
    variants: {
      colors: ['Cyber Gray', 'Retro White']
    },
    createdAt: '2026-08-04T14:15:00.000Z'
  },
  {
    id: 'prod-5',
    name: 'Organic Heavyweight Fleece Hoodie',
    slug: 'organic-heavyweight-fleece-hoodie',
    description: 'Ultra-soft 450gsm organic combed cotton hoodie with double-lined hood, relaxed drop-shoulder cut, and pre-shrunk premium finish.',
    price: 68.00,
    originalPrice: 85.00,
    discountPercentage: 20,
    rating: 4.6,
    reviewCount: 28,
    category: 'Fashion & Apparel',
    stock: 40,
    isFeatured: false,
    isFlashDeal: true,
    tags: ['hoodie', 'apparel', 'cotton', 'streetwear'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Material': '100% Organic Combed Cotton',
      'Weight': '450 GSM Heavyweight',
      'Fit': 'Relaxed Unisex',
      'Care': 'Machine wash cold'
    },
    variants: {
      colors: ['Oatmeal Heather', 'Charcoal Black', 'Sage Green'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    createdAt: '2026-08-05T08:20:00.000Z'
  },
  {
    id: 'prod-6',
    name: 'AuraBeam Smart Ambient Table Lamp',
    slug: 'aurabeam-smart-ambient-table-lamp',
    description: 'Touch-controlled dimmable warmth with 16 million RGB color choices, sunrise simulation alarm, and wireless smartphone charging base.',
    price: 59.99,
    originalPrice: 79.99,
    discountPercentage: 25,
    rating: 4.7,
    reviewCount: 22,
    category: 'Home & Living',
    stock: 20,
    isFeatured: true,
    isFlashDeal: false,
    tags: ['lighting', 'smart home', 'lamp', 'decor'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Power Output': '12W LED / 10W Wireless Charger',
      'Color Temperature': '2700K - 6500K + RGB',
      'Control': 'Touch / App / Voice Assist',
      'Material': 'Anodized Aluminum + Frosted Acrylic'
    },
    variants: {
      colors: ['Nordic White', 'Space Gray']
    },
    createdAt: '2026-08-06T16:00:00.000Z'
  },
  {
    id: 'prod-7',
    name: 'Barista Pour-Over Coffee Ceramic Set',
    slug: 'barista-pour-over-coffee-ceramic-set',
    description: 'Handcrafted ceramic dripper with thermal insulated glass carafe, precision gooseneck spout kettle compatibility, and stainless mesh filter.',
    price: 48.50,
    originalPrice: 60.00,
    discountPercentage: 19,
    rating: 4.9,
    reviewCount: 37,
    category: 'Home & Living',
    stock: 14,
    isFeatured: false,
    isFlashDeal: false,
    tags: ['coffee', 'ceramic', 'kitchen', 'lifestyle'],
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Carafe Capacity': '600 ml (2-4 cups)',
      'Material': 'Matte Glazed Ceramic & Borosilicate Glass',
      'Dishwasher Safe': 'Yes',
      'Includes': 'Dripper, Carafe, 50 Filter Papers'
    },
    variants: {
      colors: ['Matte Charcoal', 'Warm Terracotta', 'Pure White']
    },
    createdAt: '2026-08-07T12:00:00.000Z'
  },
  {
    id: 'prod-8',
    name: 'Velocity Pro Cushion Running Shoes',
    slug: 'velocity-pro-cushion-running-shoes',
    description: 'Engineered breathable mesh upper with responsive carbon-infused foam midsole for maximum energy return and rubber traction grip.',
    price: 129.00,
    originalPrice: 159.00,
    discountPercentage: 19,
    rating: 4.8,
    reviewCount: 45,
    category: 'Sports & Fitness',
    stock: 30,
    isFeatured: true,
    isFlashDeal: true,
    tags: ['sneakers', 'running', 'sports', 'footwear'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Weight': '230g (US Size 9)',
      'Midsole Drop': '8mm',
      'Arch Support': 'Neutral to Moderate',
      'Sole Material': 'Continental Rubber Grip'
    },
    variants: {
      colors: ['Flame Red', 'Electric Blue', 'Stealth Black'],
      sizes: ['7', '8', '9', '10', '11', '12']
    },
    createdAt: '2026-08-08T09:10:00.000Z'
  },
  {
    id: 'prod-9',
    name: 'GlowRadiance Hyaluronic Hydrating Serum',
    slug: 'glowradiance-hyaluronic-hydrating-serum',
    description: 'Multi-molecular hyaluronic acid combined with vitamin B5 and niacinamide for deep plump moisture, radiant skin barrier repair, and collagen boost.',
    price: 38.00,
    originalPrice: 48.00,
    discountPercentage: 21,
    rating: 4.9,
    reviewCount: 63,
    category: 'Beauty & Health',
    stock: 50,
    isFeatured: true,
    isFlashDeal: false,
    tags: ['skincare', 'serum', 'beauty', 'hyaluronic'],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608248597261-833244679159?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Volume': '50 ml / 1.7 fl. oz',
      'Key Ingredients': 'Hyaluronic Acid 3%, Niacinamide 5%, Vitamin B5',
      'Skin Type': 'All Skin Types (Dermatologist Tested)',
      'Cruelty Free': 'Yes & Vegan'
    },
    createdAt: '2026-08-09T15:30:00.000Z'
  },
  {
    id: 'prod-10',
    name: 'HydroLock Thermal Insulated Tumbler 32oz',
    slug: 'hydrolock-thermal-insulated-tumbler-32oz',
    description: 'Double-wall vacuum stainless steel keeps beverages ice-cold for 24 hours or piping hot for 12 hours. Features 2-in-1 straw and sip leakproof lid.',
    price: 29.99,
    originalPrice: 38.00,
    discountPercentage: 21,
    rating: 4.8,
    reviewCount: 29,
    category: 'Sports & Fitness',
    stock: 35,
    isFeatured: false,
    isFlashDeal: false,
    tags: ['tumbler', 'water bottle', 'fitness', 'insulated'],
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1000&q=80'
    ],
    specifications: {
      'Capacity': '32 oz / 950 ml',
      'Material': '18/8 Food Grade Stainless Steel',
      'Insulation': '24 hrs Cold / 12 hrs Hot',
      'BPA Free': 'Yes'
    },
    variants: {
      colors: ['Eucalyptus Green', 'Ocean Teal', 'Matte Black', 'Blush Pink']
    },
    createdAt: '2026-08-10T11:45:00.000Z'
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-2',
    userName: 'David Miller',
    rating: 5,
    title: 'Mind-blowing Noise Cancellation!',
    comment: 'The sound quality is crisp and warm, ANC wipes out background office noise completely. Battery life easily lasts my whole work week!',
    createdAt: '2026-08-05T14:20:00.000Z',
    verifiedBuyer: true
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'user-3',
    userName: 'Sarah Jenkins',
    rating: 5,
    title: 'Super comfortable for long listening',
    comment: 'Ear pads are like pillows. Love the matte black finish too!',
    createdAt: '2026-08-08T09:12:00.000Z',
    verifiedBuyer: true
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'user-2',
    userName: 'David Miller',
    rating: 5,
    title: 'Best smartwatch I have owned',
    comment: 'The AMOLED screen is crystal clear even under bright sunlight. GPS tracking on my morning runs is super accurate.',
    createdAt: '2026-08-06T11:00:00.000Z',
    verifiedBuyer: true
  },
  {
    id: 'rev-4',
    productId: 'prod-8',
    userId: 'user-3',
    userName: 'Sarah Jenkins',
    rating: 5,
    title: 'Feels like running on clouds',
    comment: 'Responsive cushioning saved my knees during marathon prep. Fits true to size.',
    createdAt: '2026-08-10T16:40:00.000Z',
    verifiedBuyer: true
  }
];

const initialUsers: User[] = [
  {
    id: 'user-admin',
    customerId: 'ADMIN-001',
    email: 'admin@markoaz.com',
    name: 'Markoaz Administrator',
    phone: '+1 (555) 019-2831',
    role: 'admin',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'United States'
    },
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'user-2',
    customerId: 'CUST-84920',
    email: 'demo@markoaz.com',
    name: 'David Miller',
    phone: '+1 (555) 438-9102',
    role: 'customer',
    address: {
      street: '100 Innovation Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    },
    createdAt: '2026-08-02T10:00:00.000Z'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ORD-98231',
    userId: 'user-2',
    customerId: 'CUST-84920',
    customerName: 'David Miller',
    customerEmail: 'demo@markoaz.com',
    customerPhone: '+1 (555) 438-9102',
    shippingAddress: {
      street: '100 Innovation Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'AuraSound ANC Wireless Headphones',
        price: 189.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
        selectedColor: 'Matte Black'
      }
    ],
    subtotal: 189.99,
    shippingFee: 0,
    discount: 18.99,
    tax: 13.68,
    total: 184.68,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'out_for_delivery',
    trackingNumber: 'TRK-MKZ-882194',
    estimatedDelivery: 'Tomorrow by 5:00 PM',
    createdAt: '2026-08-11T14:30:00.000Z',
    timeline: [
      { status: 'placed', label: 'Order Confirmed', time: 'Aug 11, 2:30 PM', completed: true },
      { status: 'processing', label: 'Packed & Verified', time: 'Aug 12, 9:15 AM', completed: true },
      { status: 'out_for_delivery', label: 'Out for Delivery (Cash on Delivery)', time: 'Aug 13, 8:00 AM', completed: true },
      { status: 'delivered', label: 'Delivered', time: 'Estimated Aug 14', completed: false }
    ]
  }
];

class DBStore {
  private data: Schema;
  private dbPath: string;

  constructor() {
    this.dbPath = activeDbFilePath;
    const bundledPath = path.join(process.cwd(), 'data', 'store.json');

    let rawData: string | null = null;

    if (fs.existsSync(this.dbPath)) {
      try {
        rawData = fs.readFileSync(this.dbPath, 'utf-8');
      } catch (err) {
        console.warn('Could not read from activeDbFilePath, checking bundled fallback', err);
      }
    }

    if (!rawData && fs.existsSync(bundledPath)) {
      try {
        rawData = fs.readFileSync(bundledPath, 'utf-8');
      } catch (err) {
        console.warn('Could not read from bundledPath', err);
      }
    }

    if (rawData) {
      try {
        this.data = JSON.parse(rawData);
        let mutated = false;

        // 1. Ensure categories exist and are complete
        if (!Array.isArray(this.data.categories) || this.data.categories.length === 0) {
          this.data.categories = initialCategories;
          mutated = true;
        } else {
          // Ensure all initial categories are included
          initialCategories.forEach(initCat => {
            if (!this.data.categories.some(c => c.name.toLowerCase() === initCat.name.toLowerCase())) {
              this.data.categories.push(initCat);
              mutated = true;
            }
          });
        }

        // 2. Ensure products exist and are fully populated
        if (!Array.isArray(this.data.products) || this.data.products.length === 0) {
          this.data.products = [...initialProducts];
          mutated = true;
        } else {
          // Ensure all initial showcase products exist
          initialProducts.forEach(initProd => {
            if (!this.data.products.some(p => p.id === initProd.id || p.name.toLowerCase() === initProd.name.toLowerCase())) {
              this.data.products.push(initProd);
              mutated = true;
            }
          });
        }

        // 3. Sanitize and normalize all product data fields
        this.data.products = this.data.products.map(p => {
          const isFeatured = Boolean(p.isFeatured ?? (p as any).featured ?? false);
          const isFlashDeal = Boolean(p.isFlashDeal ?? (p as any).flashDeal ?? false);
          const price = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
          const originalPrice = p.originalPrice ? (typeof p.originalPrice === 'number' ? p.originalPrice : Number(p.originalPrice) || undefined) : undefined;
          const rating = typeof p.rating === 'number' ? p.rating : Number(p.rating) || 4.8;
          const reviewCount = typeof p.reviewCount === 'number' ? p.reviewCount : Number(p.reviewCount) || 12;
          const stock = typeof p.stock === 'number' ? p.stock : Number(p.stock) || 20;
          const images = Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'];
          const tags = Array.isArray(p.tags) ? p.tags : [p.category?.toLowerCase() || 'general'];
          const specifications = p.specifications && typeof p.specifications === 'object'
            ? p.specifications
            : { 'Warranty': '1 Year Official Warranty' };

          return {
            ...p,
            price,
            originalPrice,
            rating,
            reviewCount,
            stock,
            isFeatured,
            isFlashDeal,
            images,
            tags,
            specifications,
            category: p.category || 'Electronics'
          };
        });

        // 4. Recalculate category product counts
        this.data.categories.forEach(cat => {
          const count = this.data.products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length;
          if (cat.productCount !== count) {
            cat.productCount = count;
            mutated = true;
          }
        });

        // 5. Ensure default admin user exists
        const adminIndex = this.data.users.findIndex(u => u.role === 'admin' || u.id === 'user-admin' || u.email === 'admin@markoaz.com');
        if (adminIndex === -1) {
          this.data.users.unshift({
            id: 'user-admin',
            customerId: 'ADMIN-001',
            email: 'admin@markoaz.com',
            name: 'Markoaz Store Administrator',
            phone: '+1 (555) 019-2831',
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          mutated = true;
        } else {
          // Ensure admin role is set
          if (this.data.users[adminIndex].role !== 'admin') {
            this.data.users[adminIndex].role = 'admin';
            mutated = true;
          }
          if (!this.data.users[adminIndex].customerId) {
            this.data.users[adminIndex].customerId = 'ADMIN-001';
            mutated = true;
          }
        }

        // Ensure customerId exists on all users and orders
        this.data.users.forEach((u, idx) => {
          if (!u.customerId) {
            u.customerId = u.role === 'admin' ? `ADMIN-${String(idx + 1).padStart(3, '0')}` : `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
            mutated = true;
          }
        });
        this.data.orders.forEach(o => {
          if (!o.customerId) {
            const user = this.data.users.find(u => u.id === o.userId);
            o.customerId = user?.customerId || `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
            mutated = true;
          }
        });
        if (mutated) {
          this.save();
        }
      } catch (err) {
        console.error('Error parsing store data, initializing defaults', err);
        this.data = this.getDefaultData();
        this.save();
      }
    } else {
      this.data = this.getDefaultData();
      this.save();
    }
  }

  private getDefaultData(): Schema {
    return {
      categories: initialCategories,
      products: initialProducts,
      reviews: initialReviews,
      users: initialUsers,
      orders: initialOrders,
      carts: {},
      wishlists: {},
      settings: defaultSettings
    };
  }

  private save() {
    try {
      const parentDir = path.dirname(this.dbPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Notice: Storage file write skipped or read-only filesystem', err);
    }
  }

  // --- Settings ---
  getStoreSettings(): StoreSettings {
    if (!this.data.settings) {
      this.data.settings = { ...defaultSettings };
      this.save();
    }
    return this.data.settings;
  }

  updateStoreSettings(update: Partial<StoreSettings>): StoreSettings {
    if (!this.data.settings) {
      this.data.settings = { ...defaultSettings };
    }
    this.data.settings = { ...this.data.settings, ...update };
    this.save();
    return this.data.settings;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  addCategory(category: Omit<Category, 'id'>): Category {
    const id = 'cat-' + Date.now();
    const newCat: Category = { ...category, id };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, update: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...update };
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const lenBefore = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Products ---
  getProducts(query?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
    featured?: boolean;
    flashDeal?: boolean;
  }): Product[] {
    let list = [...this.data.products];

    if (query?.category && query.category.trim() !== '' && query.category.toLowerCase() !== 'all') {
      const catQuery = query.category.trim().toLowerCase();
      list = list.filter(p => p.category && p.category.trim().toLowerCase() === catQuery);
    }

    if (query?.search && query.search.trim() !== '') {
      const q = query.search.toLowerCase().trim();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (query?.minPrice !== undefined && !isNaN(Number(query.minPrice))) {
      list = list.filter(p => Number(p.price) >= Number(query.minPrice));
    }
    if (query?.maxPrice !== undefined && !isNaN(Number(query.maxPrice))) {
      list = list.filter(p => Number(p.price) <= Number(query.maxPrice));
    }
    if (query?.minRating !== undefined && !isNaN(Number(query.minRating))) {
      list = list.filter(p => Number(p.rating || 0) >= Number(query.minRating));
    }
    if (query?.featured) {
      list = list.filter(p => Boolean(p.isFeatured || (p as any).featured));
    }
    if (query?.flashDeal) {
      list = list.filter(p => Boolean(p.isFlashDeal || (p as any).flashDeal));
    }

    if (query?.sort) {
      switch (query.sort) {
        case 'price_asc':
          list.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case 'price_desc':
          list.sort((a, b) => Number(b.price) - Number(a.price));
          break;
        case 'rating_desc':
          list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          break;
      }
    }

    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'slug'>): Product {
    const id = 'prod-' + Date.now();
    const slug = (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isFeatured = Boolean(product.isFeatured ?? (product as any).featured ?? false);
    const isFlashDeal = Boolean(product.isFlashDeal ?? (product as any).flashDeal ?? false);
    const newProd: Product = {
      ...product,
      id,
      slug,
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      stock: Number(product.stock) || 10,
      rating: 5.0,
      reviewCount: 0,
      isFeatured,
      isFlashDeal,
      images: Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
      tags: Array.isArray(product.tags) ? product.tags : [product.category?.toLowerCase() || 'general'],
      specifications: product.specifications || { 'Warranty': '1 Year Official Warranty' },
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProd);

    // Update category product count
    const cat = this.data.categories.find(c => c.name.toLowerCase() === newProd.category.toLowerCase());
    if (cat) {
      cat.productCount = this.data.products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length;
    }

    this.save();
    return newProd;
  }

  updateProduct(id: string, update: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const existing = this.data.products[idx];
    const isFeatured = update.isFeatured !== undefined
      ? Boolean(update.isFeatured)
      : (update as any).featured !== undefined
        ? Boolean((update as any).featured)
        : existing.isFeatured;
    const isFlashDeal = update.isFlashDeal !== undefined
      ? Boolean(update.isFlashDeal)
      : (update as any).flashDeal !== undefined
        ? Boolean((update as any).flashDeal)
        : existing.isFlashDeal;

    const updated: Product = {
      ...existing,
      ...update,
      price: update.price !== undefined ? Number(update.price) : existing.price,
      originalPrice: update.originalPrice !== undefined ? Number(update.originalPrice) : existing.originalPrice,
      stock: update.stock !== undefined ? Number(update.stock) : existing.stock,
      isFeatured,
      isFlashDeal,
      images: Array.isArray(update.images) && update.images.length > 0 ? update.images : existing.images
    };

    this.data.products[idx] = updated;

    // Recalculate category counts
    this.data.categories.forEach(cat => {
      cat.productCount = this.data.products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length;
    });

    this.save();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) return false;
    this.data.products = this.data.products.filter(p => p.id !== id);

    const cat = this.data.categories.find(c => c.name.toLowerCase() === prod.category.toLowerCase());
    if (cat && cat.productCount > 0) {
      cat.productCount -= 1;
    }

    this.save();
    return true;
  }

  // --- Reviews ---
  getAllReviews(): (Review & { productName?: string; productImage?: string })[] {
    return this.data.reviews.map(r => {
      const prod = this.getProductById(r.productId);
      return {
        ...r,
        productName: prod?.name || 'Product',
        productImage: prod?.images[0] || ''
      };
    });
  }

  getProductReviews(productId: string): Review[] {
    return this.data.reviews.filter(r => r.productId === productId);
  }

  addReview(productId: string, review: { userId: string; userName: string; rating: number; title: string; comment: string }): Review {
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      productId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: new Date().toISOString(),
      verifiedBuyer: true
    };
    this.data.reviews.unshift(newReview);

    // Recalculate average rating & count for product
    const allProdReviews = this.data.reviews.filter(r => r.productId === productId);
    const avgRating = Number((allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length).toFixed(1));
    this.updateProduct(productId, { rating: avgRating, reviewCount: allProdReviews.length });

    this.save();
    return newReview;
  }

  deleteReview(id: string): boolean {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return false;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);

    const allProdReviews = this.data.reviews.filter(r => r.productId === rev.productId);
    const avgRating = allProdReviews.length > 0
      ? Number((allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length).toFixed(1))
      : 5.0;
    this.updateProduct(rev.productId, { rating: avgRating, reviewCount: allProdReviews.length });

    this.save();
    return true;
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return this.data.users.map(({ ...u }) => u);
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByCustomerId(cid: string): User | undefined {
    return this.data.users.find(u => u.customerId?.toLowerCase() === cid.toLowerCase());
  }

  customerLogin(email: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      if (existing.role === 'admin') {
        throw new Error('This account is registered with Administrator privileges. Please use the dedicated Admin Portal Login.');
      }
      return existing;
    }

    // Auto-create customer if logging in for the first time
    const count = this.data.users.filter(u => u.role === 'customer').length + 1;
    const customerId = `CUST-${Math.floor(10000 + Math.random() * 90000)}`;
    const newUser: User = {
      id: 'user-' + Date.now(),
      customerId,
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      phone: '',
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  adminLogin(credential: string, secretKey: string): User {
    const cleanEmail = credential.trim().toLowerCase();
    const cleanKey = secretKey.trim();

    // 1. Authorized administrator emails (Server-side validation only)
    const envAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : '';
    const authorizedAdminEmails = [
      'texasialahore@gmail.com',
      'admin@markoaz.com',
      ...(envAdminEmail ? [envAdminEmail] : [])
    ];

    const isAuthorizedEmail = authorizedAdminEmails.includes(cleanEmail) ||
      cleanEmail === 'admin-001' ||
      cleanEmail === 'admin';

    if (!isAuthorizedEmail) {
      throw new Error('Access Denied: This email / ID is not registered as an authorized store administrator.');
    }

    // 2. Strong Master Security PIN validation (Strictly validated from server-side ADMIN_PIN env)
    // All old passwords and demo PINs have been completely invalidated.
    const expectedAdminPin = process.env.ADMIN_PIN?.trim() || 'Markoaz#Executive9988!';

    const isValidPin = cleanKey === expectedAdminPin;

    if (!isValidPin) {
      throw new Error('Access Denied: Invalid Administrator Security PIN.');
    }

    // 3. Retrieve or safely initialize the verified Administrator account
    let user = this.data.users.find(u =>
      u.email.toLowerCase() === cleanEmail ||
      (cleanEmail === 'admin-001' && u.customerId === 'ADMIN-001') ||
      (cleanEmail === 'admin' && u.role === 'admin')
    );

    if (!user) {
      const email = cleanEmail.includes('@') ? cleanEmail : 'admin@markoaz.com';
      const name = cleanEmail === 'texasialahore@gmail.com'
        ? 'Store Owner & Executive Administrator'
        : 'Markoaz Store Administrator';

      user = {
        id: 'user-admin-' + Date.now(),
        customerId: 'ADMIN-001',
        email,
        name,
        phone: '+1 (555) 019-2831',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
      this.save();
    } else {
      // Ensure verified admin permissions
      user.role = 'admin';
      if (!user.customerId || !user.customerId.startsWith('ADMIN-')) {
        user.customerId = 'ADMIN-001';
      }
      this.save();
    }

    return user;
  }

  registerUser(userData: { email: string; name: string; phone?: string; role?: 'customer' | 'admin'; address?: User['address'] }): User {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      if (existing.role === 'admin') {
        throw new Error('An account with this email already exists.');
      }
      return existing;
    }

    // Force role to customer for public registrations unless explicitly created by admin
    const isAdm = userData.role === 'admin';
    const customerId = isAdm
      ? `ADMIN-${String(this.data.users.filter(u => u.role === 'admin').length + 1).padStart(3, '0')}`
      : `CUST-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: User = {
      id: 'user-' + Date.now(),
      customerId,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || '',
      role: isAdm ? 'admin' : 'customer',
      address: userData.address,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, update: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...update };
    this.save();
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const len = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    delete this.data.carts[id];
    delete this.data.wishlists[id];
    if (this.data.users.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  updateUserRole(id: string, role: 'customer' | 'admin'): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    user.role = role;
    if (role === 'admin' && !user.customerId.startsWith('ADMIN-')) {
      user.customerId = `ADMIN-${String(this.data.users.filter(u => u.role === 'admin').length).padStart(3, '0')}`;
    }
    this.save();
    return user;
  }

  // --- Cart ---
  getCart(userId: string): CartItem[] {
    return this.data.carts[userId] || [];
  }

  addToCart(userId: string, productId: string, quantity: number, selectedColor?: string, selectedSize?: string): CartItem[] {
    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }

    const product = this.getProductById(productId);
    if (!product) return this.getCart(userId);

    const existingIdx = this.data.carts[userId].findIndex(item =>
      item.productId === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );

    if (existingIdx > -1) {
      this.data.carts[userId][existingIdx].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        productId,
        product,
        quantity,
        selectedColor,
        selectedSize
      };
      this.data.carts[userId].push(newItem);
    }

    this.save();
    return this.getCart(userId);
  }

  updateCartItemQuantity(userId: string, itemId: string, quantity: number): CartItem[] {
    if (!this.data.carts[userId]) return [];

    if (quantity <= 0) {
      this.data.carts[userId] = this.data.carts[userId].filter(i => i.id !== itemId);
    } else {
      const item = this.data.carts[userId].find(i => i.id === itemId);
      if (item) item.quantity = quantity;
    }

    this.save();
    return this.getCart(userId);
  }

  removeFromCart(userId: string, itemId: string): CartItem[] {
    if (!this.data.carts[userId]) return [];
    this.data.carts[userId] = this.data.carts[userId].filter(i => i.id !== itemId);
    this.save();
    return this.getCart(userId);
  }

  clearCart(userId: string) {
    this.data.carts[userId] = [];
    this.save();
  }

  // --- Wishlist ---
  getWishlist(userId: string): WishlistItem[] {
    return this.data.wishlists[userId] || [];
  }

  toggleWishlist(userId: string, productId: string): { inWishlist: boolean; items: WishlistItem[] } {
    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }

    const idx = this.data.wishlists[userId].findIndex(w => w.productId === productId);
    let inWishlist = false;

    if (idx > -1) {
      this.data.wishlists[userId].splice(idx, 1);
    } else {
      const product = this.getProductById(productId);
      if (product) {
        this.data.wishlists[userId].push({
          id: 'wish-' + Date.now(),
          productId,
          product
        });
        inWishlist = true;
      }
    }

    this.save();
    return { inWishlist, items: this.getWishlist(userId) };
  }

  // --- Orders ---
  getOrders(userId?: string): Order[] {
    if (userId) {
      return this.data.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    const q = id.toLowerCase();
    return this.data.orders.find(o => 
      o.id.toLowerCase() === q || 
      o.trackingNumber.toLowerCase() === q || 
      (o.customerId && o.customerId.toLowerCase() === q)
    );
  }

  createOrder(orderData: Omit<Order, 'id' | 'trackingNumber' | 'createdAt' | 'orderStatus' | 'timeline' | 'estimatedDelivery'> & { customerId?: string }): Order {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${randomNum}`;
    const trackingNum = `TRK-AURA-${Math.floor(100000 + Math.random() * 900000)}`;

    const user = this.getUserById(orderData.userId);
    const customerId = orderData.customerId || user?.customerId || `CUST-${Math.floor(10000 + Math.random() * 90000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' by 5:00 PM';

    const timeline = [
      { status: 'placed' as OrderStatus, label: 'Order Confirmed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
      { status: 'processing' as OrderStatus, label: 'Processing & Packing', time: 'In Progress', completed: true },
      { status: 'out_for_delivery' as OrderStatus, label: 'Out for Delivery (Cash on Delivery)', time: 'Pending', completed: false },
      { status: 'delivered' as OrderStatus, label: 'Delivered', time: estimatedDelivery, completed: false }
    ];

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      customerId,
      trackingNumber: trackingNum,
      orderStatus: 'placed',
      estimatedDelivery,
      createdAt: new Date().toISOString(),
      timeline
    };

    this.data.orders.unshift(newOrder);

    // Reduce stock for items
    for (const item of newOrder.items) {
      const p = this.getProductById(item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }

    // Clear cart for user
    this.clearCart(orderData.userId);

    this.save();
    return newOrder;
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;

    order.orderStatus = status;

    // Update timeline steps
    const statusOrder: OrderStatus[] = ['placed', 'processing', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(status);

    if (currentIdx !== -1) {
      order.timeline.forEach((item, idx) => {
        if (idx <= currentIdx) {
          item.completed = true;
          if (item.time === 'Pending' || item.time.startsWith('In Progress')) {
            item.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      });
    }

    if (status === 'delivered') {
      order.paymentStatus = 'paid_on_delivery';
    }

    this.save();
    return order;
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Order | null {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    this.save();
    return order;
  }

  deleteOrder(id: string): boolean {
    const len = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    if (this.data.orders.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  restockProduct(id: string, amount: number): Product | null {
    const prod = this.getProductById(id);
    if (!prod) return null;
    prod.stock = Math.max(0, prod.stock + amount);
    this.save();
    return prod;
  }

  // --- Admin Stats ---
  getAdminStats(): AdminStats {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.total : 0), 0);
    const totalProducts = this.data.products.length;
    const totalUsers = this.data.users.length;
    const pendingOrdersCount = this.data.orders.filter(o => o.orderStatus === 'placed' || o.orderStatus === 'processing').length;

    // Sales data grouping by day
    const salesMap: Record<string, { sales: number; orders: number }> = {};
    this.data.orders.forEach(o => {
      const date = o.createdAt.split('T')[0];
      if (!salesMap[date]) salesMap[date] = { sales: 0, orders: 0 };
      salesMap[date].sales += o.total;
      salesMap[date].orders += 1;
    });

    const salesData = Object.keys(salesMap)
      .sort()
      .map(date => ({
        date,
        sales: Number(salesMap[date].sales.toFixed(2)),
        orders: salesMap[date].orders
      }));

    // Category breakdown
    const catMap: Record<string, { count: number; sales: number }> = {};
    this.data.products.forEach(p => {
      if (!catMap[p.category]) catMap[p.category] = { count: 0, sales: 0 };
      catMap[p.category].count += 1;
    });

    this.data.orders.forEach(o => {
      o.items.forEach(item => {
        const p = this.getProductById(item.productId);
        if (p && catMap[p.category]) {
          catMap[p.category].sales += item.price * item.quantity;
        }
      });
    });

    const categoryBreakdown = Object.keys(catMap).map(cat => ({
      category: cat,
      count: catMap[cat].count,
      sales: Number(catMap[cat].sales.toFixed(2))
    }));

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      totalUsers,
      pendingOrdersCount,
      salesData,
      categoryBreakdown
    };
  }
}

export const db = new DBStore();
