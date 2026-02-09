/**
 * Mock Data for Figma Static Pages
 * This file contains static data for all pages to be used when accessed via /figma routes
 * All images use files from the Naruto folder in public
 */

// Helper function to get Naruto image path
const getNarutoImage = (index) => {
  const images = [
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _1.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _2.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _3.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _4.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _5.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _7.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _8.jpg',
    '/Naruto/_No matter what you decide to do from here on out... I will love you forever.___ Itachi Uchiha_ Naruto__An amazing and atmospheric collab with _zenlessace _9.jpg',
    '/Naruto/_Try Again _ Naruto Uzumaki_ 🔥✨_._._._✨ Images made in Midjourney ✨ _🔍 Follow _artozuki for more 🔍_._._.__naruto _narutouzumaki _narutoedits (.jpg',
    '/Naruto/_We all hide battles behind our eyes... Some just learn to fight in silence__._._iOS crops the image so pinch in to see the full image..._._._Follow for mo_2.jpg',
    '/Naruto/_We all hide battles behind our eyes... Some just learn to fight in silence__._._iOS crops the image so pinch in to see the full image..._._._Follow for mo_8.jpg',
    '/Naruto/🌑 「痛みを感じろ_痛みを知れ_ 痛みを受け入れろ_」(Feel the pain.Know the pain.Accept the pain.)__.__⚡ He was not just a man_ he wa_1.jpg',
    '/Naruto/🌑 「痛みを感じろ_痛みを知れ_ 痛みを受け入れろ_」(Feel the pain.Know the pain.Accept the pain.)__.__⚡ He was not just a man_ he wa_3.jpg',
    '/Naruto/🌑 「痛みを感じろ_痛みを知れ_ 痛みを受け入れろ_」(Feel the pain.Know the pain.Accept the pain.)__.__⚡ He was not just a man_ he wa_4.jpg',
    '/Naruto/🍃 忍の魂は決して折れない _ ナルトのように___(🍃 The soul of a ninja never breaks _ like Naruto.)__.__🔥 夢を追い続ける勇_1.jpg',
    '/Naruto/🍃 忍の魂は決して折れない _ ナルトのように___(🍃 The soul of a ninja never breaks _ like Naruto.)__.__🔥 夢を追い続ける勇_2.jpg',
    '/Naruto/🍃 忍の魂は決して折れない _ ナルトのように___(🍃 The soul of a ninja never breaks _ like Naruto.)__.__🔥 夢を追い続ける勇_3.jpg',
    '/Naruto/🍃 忍の魂は決して折れない _ ナルトのように___(🍃 The soul of a ninja never breaks _ like Naruto.)__.__🔥 夢を追い続ける勇_4.jpg',
    '/Naruto/Every eye here carries fear_ power_ and fate..._._._Follow for more 👉 __ai.calmcraft_._._📢 Please respect my work – do not repost my posts or reels (.jpg',
    '/Naruto/Every eye here carries fear_ power_ and fate..._._._Follow for more 👉 __ai.calmcraft_._._📢 Please respect my work – do not repost my posts or reels_2.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_3.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_4.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_5.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_6.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_7.jpg',
    '/Naruto/NARUTO_ THE UCHIHA LEGACY 🔥___Those who cannot acknowledge themselves will eventually fail._ __– ITACHI UCHIHA__The Uchiha clan_s bloodline runs deepe_8.jpg',
    '/Naruto/One mastered hate. One mastered hope. Who do you relate to the most_ ⚡ Drop a 🔥 for Sasuke or 🌀 for Naruto__.._.._Even Naruto and Sasuke would agre_1.jpg',
    '/Naruto/One mastered hate. One mastered hope. Who do you relate to the most_ ⚡ Drop a 🔥 for Sasuke or 🌀 for Naruto__.._.._Even Naruto and Sasuke would agre_2.jpg',
    '/Naruto/One mastered hate. One mastered hope. Who do you relate to the most_ ⚡ Drop a 🔥 for Sasuke or 🌀 for Naruto__.._.._Even Naruto and Sasuke would agre_3.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _3.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _5.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _6.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _7.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _8.jpg',
    '/Naruto/SPOTLIGHT _ NARUTO VOL.1 🍃🔥___The will of fire burns on... even in the darkest night.____ HIRUZEN SARUTOBI__Where to even start_ maybe from the real _9.jpg',
    '/Naruto/wallpaperflare.com_wallpaper (10).jpg',
    '/Naruto/wallpaperflare.com_wallpaper (3).jpg',
    '/Naruto/wallpaperflare.com_wallpaper (6).jpg',
    '/Naruto/wallpaperflare.com_wallpaper (9).jpg',
  ];
  return images[index % images.length];
};

// Mock data for Home page (ListPage)
export const mockListData = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: [
    'Luxury Apartment in Downtown',
    'Modern Studio with City View',
    'Spacious 3-Bedroom Apartment',
    'Cozy 2-Bedroom Near Park',
    'Premium Penthouse Suite',
    'Family-Friendly Apartment',
    'Stylish Loft in Historic District',
    'Bright 1-Bedroom with Balcony',
    'Elegant Apartment with Garden',
    'Contemporary 2-Bedroom Unit',
    'Charming Apartment in Quiet Area',
    'Luxury Apartment with Pool Access'
  ][i],
  images: [getNarutoImage(i), getNarutoImage(i + 1), getNarutoImage(i + 2)],
  bedroom: [1, 2, 3, 2, 3, 2, 1, 1, 2, 2, 1, 3][i],
  bathroom: [1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2][i],
  price: [800, 1200, 1800, 1000, 2500, 1400, 950, 750, 1100, 1300, 850, 2000][i],
  address: [
    '123 Main Street, Downtown',
    '456 Oak Avenue, Midtown',
    '789 Park Boulevard, Uptown',
    '321 Elm Street, Riverside',
    '654 Pine Road, Hilltop',
    '987 Maple Drive, Garden District',
    '147 Cedar Lane, Historic Quarter',
    '258 Birch Court, Waterfront',
    '369 Willow Way, Suburbs',
    '741 Spruce Street, Downtown',
    '852 Cherry Avenue, Quiet Zone',
    '963 Ash Boulevard, Luxury District'
  ][i],
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
  property_type: ['apartment', 'studio', 'apartment', 'apartment', 'penthouse', 'apartment', 'loft', 'apartment', 'apartment', 'apartment', 'apartment', 'apartment'][i],
  status: 'active',
  created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock data for EstateInfo page
export const mockEstateInfo = {
  post: {
    id: 1,
    title: 'Luxury Apartment in Downtown',
    description: 'This beautiful apartment features modern amenities and stunning city views. Located in the heart of downtown, it offers easy access to shopping, dining, and entertainment. The unit includes a fully equipped kitchen, spacious living area, and comfortable bedrooms. Perfect for professionals or small families seeking a convenient urban lifestyle.',
    price: 1800,
    images: [
      getNarutoImage(0),
      getNarutoImage(1),
      getNarutoImage(2),
      getNarutoImage(3),
      getNarutoImage(4),
    ],
    bedroom: 3,
    bathroom: 2,
    size: 120,
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    address: '123 Main Street, Downtown, New York, NY 10001',
    school: '250m away',
    bus: '100m away',
    restaurant: '50m away',
    property_type: 'apartment',
    status: 'active',
    user: {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      avatar: getNarutoImage(5),
      phone: '+1 (555) 123-4567',
    },
    duration_prices: [
      { duration_type: 'month', price: 1800 },
      { duration_type: '3months', price: 1700 },
      { duration_type: '6months', price: 1600 },
      { duration_type: 'year', price: 1500 },
    ],
    created_at: '2024-01-15T10:30:00Z',
  },
  reviews: [
    {
      id: 1,
      user: { name: 'Sarah Johnson', avatar: getNarutoImage(6) },
      rating: 5,
      comment: 'Excellent apartment with great amenities!',
      created_at: '2024-01-20T14:30:00Z',
    },
    {
      id: 2,
      user: { name: 'Michael Brown', avatar: getNarutoImage(7) },
      rating: 4,
      comment: 'Nice place, good location and responsive landlord.',
      created_at: '2024-01-18T09:15:00Z',
    },
  ],
};

// Mock data for Profile page
export const mockProfileData = {
  user: {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: getNarutoImage(8),
    phone: '+1 (555) 123-4567',
    role: 'user',
    status: 'active',
    identity_status: 'approved',
    created_at: '2023-06-15T10:00:00Z',
  },
  reputation: {
    reputation: 450,
    total_reviews: 12,
    average_rating: 4.5,
  },
  posts: mockListData.slice(0, 5),
};

// Mock data for Admin Dashboard
export const mockAdminDashboard = {
  total_users: 1250,
  total_apartments: 3420,
  total_rental_requests: 890,
  active_contracts: 567,
  pending_verifications: 23,
  total_reviews: 1840,
};

// Mock data for User Management
export const mockUsers = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'William Garcia', 'Jessica Lee', 'James White', 'Amanda Harris', 'Christopher Clark', 'Michelle Lewis', 'Daniel Walker'][i],
  email: `user${i + 1}@example.com`,
  role: i === 0 ? 'admin' : 'user',
  status: ['active', 'active', 'disabled', 'active', 'active', 'active', 'active', 'active', 'disabled', 'active', 'active', 'active', 'active', 'active', 'active'][i],
  avatar: getNarutoImage(i + 10),
  phone: `+1 (555) ${100 + i}-${1000 + i}`,
  identity_status: ['approved', 'approved', 'pending', 'approved', 'approved', 'approved', 'rejected', 'approved', 'approved', 'approved', 'approved', 'pending', 'approved', 'approved', 'approved'][i],
  created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock data for Apartment Management
export const mockAdminPosts = mockListData.map((post, i) => ({
  ...post,
  user: {
    id: i + 1,
    name: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson'][i % 6],
    email: `user${i + 1}@example.com`,
  },
  status: ['active', 'active', 'pending', 'active', 'rejected', 'active', 'active', 'pending', 'active', 'active', 'active', 'active'][i],
  views: Math.floor(Math.random() * 1000) + 50,
  created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock data for Booking Requests
export const mockBookingRequests = {
  myRequests: [
    {
      id: 1,
      post: mockListData[0],
      status: 'pending',
      duration_type: 'month',
      start_date: '2024-02-01',
      end_date: '2024-03-01',
      created_at: '2024-01-20T10:00:00Z',
    },
    {
      id: 2,
      post: mockListData[1],
      status: 'approved',
      duration_type: '3months',
      start_date: '2024-02-15',
      end_date: '2024-05-15',
      created_at: '2024-01-18T14:30:00Z',
    },
  ],
  receivedRequests: [
    {
      id: 3,
      post: mockListData[2],
      user: { id: 2, name: 'Sarah Johnson', avatar: getNarutoImage(15) },
      status: 'pending',
      duration_type: 'month',
      start_date: '2024-02-10',
      end_date: '2024-03-10',
      created_at: '2024-01-22T09:15:00Z',
    },
    {
      id: 4,
      post: mockListData[3],
      user: { id: 3, name: 'Michael Brown', avatar: getNarutoImage(16) },
      status: 'approved',
      duration_type: '6months',
      start_date: '2024-02-20',
      end_date: '2024-08-20',
      created_at: '2024-01-19T16:45:00Z',
    },
  ],
};

// Mock data for Notifications
export const mockNotifications = [
  {
    id: 1,
    type: 'booking_approved',
    title: 'Booking Request Approved',
    message: 'Your booking request for "Luxury Apartment in Downtown" has been approved.',
    read: false,
    created_at: '2024-01-22T10:30:00Z',
  },
  {
    id: 2,
    type: 'new_message',
    title: 'New Message',
    message: 'You have a new message from Sarah Johnson.',
    read: false,
    created_at: '2024-01-21T14:20:00Z',
  },
  {
    id: 3,
    type: 'review_received',
    title: 'New Review',
    message: 'You received a 5-star review from Michael Brown.',
    read: true,
    created_at: '2024-01-20T09:15:00Z',
  },
  {
    id: 4,
    type: 'booking_request',
    title: 'New Booking Request',
    message: 'You have a new booking request for your apartment.',
    read: false,
    created_at: '2024-01-19T16:45:00Z',
  },
];

// Mock data for Support Tickets
export const mockSupportTickets = [
  {
    id: 1,
    subject: 'Payment Issue',
    status: 'open',
    priority: 'high',
    created_at: '2024-01-22T10:00:00Z',
    updated_at: '2024-01-22T14:30:00Z',
    messages: [
      {
        id: 1,
        user_id: 1,
        message: 'I am having trouble processing my payment. Can you help?',
        created_at: '2024-01-22T10:00:00Z',
      },
      {
        id: 2,
        user_id: null, // Admin response
        message: 'We have received your request and are looking into it.',
        created_at: '2024-01-22T14:30:00Z',
      },
    ],
  },
  {
    id: 2,
    subject: 'Account Verification',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-21T11:00:00Z',
    messages: [
      {
        id: 3,
        user_id: 1,
        message: 'My account verification is taking too long.',
        created_at: '2024-01-20T09:00:00Z',
      },
    ],
  },
];

// Mock data for Admin Support Tickets
export const mockAdminSupportTickets = [
  ...mockSupportTickets,
  {
    id: 3,
    subject: 'Technical Issue',
    status: 'open',
    priority: 'high',
    user: { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com' },
    created_at: '2024-01-21T15:00:00Z',
    updated_at: '2024-01-21T15:00:00Z',
  },
  {
    id: 4,
    subject: 'Refund Request',
    status: 'pending',
    priority: 'medium',
    user: { id: 3, name: 'Michael Brown', email: 'michael@example.com' },
    created_at: '2024-01-19T12:00:00Z',
    updated_at: '2024-01-19T12:00:00Z',
  },
];

// Mock data for Rental Requests Management
export const mockRentalRequests = mockBookingRequests.receivedRequests.map((req, i) => ({
  ...req,
  id: i + 1,
  post: mockListData[i],
  user: mockUsers[i + 1],
}));

// Mock data for Contract Management
export const mockContracts = [
  {
    id: 1,
    post: mockListData[0],
    tenant: mockUsers[1],
    landlord: mockUsers[0],
    status: 'active',
    start_date: '2024-02-01',
    end_date: '2024-03-01',
    monthly_rent: 1800,
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    post: mockListData[1],
    tenant: mockUsers[2],
    landlord: mockUsers[0],
    status: 'pending',
    start_date: '2024-02-15',
    end_date: '2024-05-15',
    monthly_rent: 1200,
    created_at: '2024-01-18T14:30:00Z',
  },
];

// Mock data for Reviews Management
export const mockReviews = [
  {
    id: 1,
    post: mockListData[0],
    user: mockUsers[1],
    rating: 5,
    comment: 'Excellent apartment with great amenities!',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: 2,
    post: mockListData[1],
    user: mockUsers[2],
    rating: 4,
    comment: 'Nice place, good location.',
    created_at: '2024-01-18T09:15:00Z',
  },
  {
    id: 3,
    post: mockListData[2],
    user: mockUsers[3],
    rating: 5,
    comment: 'Amazing experience! Highly recommended.',
    created_at: '2024-01-15T16:20:00Z',
  },
];

// Mock data for Identity Verifications
export const mockIdentityVerifications = [
  {
    id: 1,
    user: mockUsers[1],
    status: 'pending',
    documents: [
      { type: 'id_front', url: getNarutoImage(20) },
      { type: 'id_back', url: getNarutoImage(21) },
    ],
    submitted_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    user: mockUsers[2],
    status: 'approved',
    documents: [
      { type: 'id_front', url: getNarutoImage(22) },
      { type: 'id_back', url: getNarutoImage(23) },
    ],
    submitted_at: '2024-01-18T14:30:00Z',
    reviewed_at: '2024-01-19T09:00:00Z',
  },
];

// Mock data for Ratings page
export const mockRatings = {
  received: mockReviews,
  given: [
    {
      id: 1,
      post: mockListData[0],
      rating: 5,
      comment: 'Great apartment, loved staying here!',
      created_at: '2024-01-15T10:00:00Z',
    },
  ],
};

// Mock data for Payment page
export const mockPaymentData = {
  contract: mockContracts[0],
  amount: 1800,
  due_date: '2024-02-01',
  payment_methods: ['credit_card', 'bank_transfer', 'paypal'],
};

// Mock data for Admin Reports
export const mockAdminReports = {
  users: {
    total: 1250,
    active: 1180,
    disabled: 70,
    growth: 12.5,
  },
  apartments: {
    total: 3420,
    active: 3100,
    pending: 200,
    rejected: 120,
    growth: 8.3,
  },
  revenue: {
    total: 1250000,
    monthly: 125000,
    growth: 15.2,
  },
  bookings: {
    total: 890,
    approved: 750,
    pending: 100,
    rejected: 40,
  },
};

// Helper function to check if we're on a /figma route
export const isFigmaRoute = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/figma');
  }
  return false;
};
