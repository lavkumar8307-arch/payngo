import { Place, InterCityPlan } from '../types';

export interface LocationState {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isGPS?: boolean;
}

export const ALL_INDIAN_CITIES: LocationState[] = [
  // --- South India ---
  { id: 'hyd', name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  { id: 'wgl', name: 'Warangal, Telangana', lat: 17.9689, lng: 79.5941 },
  { id: 'blr', name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { id: 'mys', name: 'Mysuru, Karnataka', lat: 12.2958, lng: 76.6394 },
  { id: 'ixe', name: 'Mangaluru, Karnataka', lat: 12.9141, lng: 74.8560 },
  { id: 'crg', name: 'Coorg (Madikeri), Karnataka', lat: 12.4244, lng: 75.7382 },
  { id: 'hmp', name: 'Hampi, Karnataka', lat: 15.3350, lng: 76.4600 },
  { id: 'maa', name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { id: 'cbe', name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { id: 'ixm', name: 'Madurai, Tamil Nadu', lat: 9.9252, lng: 78.1198 },
  { id: 'oot', name: 'Ooty (Udhagamandalam), Tamil Nadu', lat: 11.4102, lng: 76.6950 },
  { id: 'vtz', name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { id: 'vga', name: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { id: 'tir', name: 'Tirupati, Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
  { id: 'cok', name: 'Kochi, Kerala', lat: 9.9312, lng: 76.2673 },
  { id: 'trv', name: 'Thiruvananthapuram, Kerala', lat: 8.5241, lng: 76.9366 },
  { id: 'mun', name: 'Munnar, Kerala', lat: 10.0889, lng: 77.0595 },
  { id: 'ccj', name: 'Kozhikode, Kerala', lat: 11.2588, lng: 75.7804 },
  { id: 'pud', name: 'Puducherry (UT)', lat: 11.9416, lng: 79.8083 },

  // --- West India & Goa ---
  { id: 'bom', name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { id: 'pun', name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { id: 'nag', name: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
  { id: 'nsk', name: 'Nashik, Maharashtra', lat: 19.9975, lng: 73.7898 },
  { id: 'aur', name: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra', lat: 19.8762, lng: 75.3433 },
  { id: 'goa', name: 'Panaji / North Goa', lat: 15.4989, lng: 73.8278 },
  { id: 'mrg', name: 'Margao / South Goa', lat: 15.2832, lng: 73.9862 },
  { id: 'ahd', name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { id: 'sur', name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { id: 'bdq', name: 'Vadodara, Gujarat', lat: 22.3072, lng: 73.1812 },
  { id: 'raj', name: 'Rajkot, Gujarat', lat: 22.3039, lng: 70.8022 },
  { id: 'kutch', name: 'Rann of Kutch (Bhuj), Gujarat', lat: 23.2420, lng: 69.6669 },

  // --- North India ---
  { id: 'del', name: 'New Delhi / NCR', lat: 28.6139, lng: 77.2090 },
  { id: 'ggn', name: 'Gurugram, Haryana', lat: 28.4595, lng: 77.0266 },
  { id: 'ixc', name: 'Chandigarh (Punjab & Haryana)', lat: 30.7333, lng: 76.7794 },
  { id: 'atq', name: 'Amritsar, Punjab', lat: 31.6340, lng: 74.8723 },
  { id: 'ldh', name: 'Ludhiana, Punjab', lat: 30.9010, lng: 75.8573 },
  { id: 'jai', name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { id: 'uda', name: 'Udaipur, Rajasthan', lat: 24.5854, lng: 73.7125 },
  { id: 'jdh', name: 'Jodhpur, Rajasthan', lat: 26.2389, lng: 73.0243 },
  { id: 'jsm', name: 'Jaisalmer, Rajasthan', lat: 26.9157, lng: 70.9083 },
  { id: 'lko', name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { id: 'vns', name: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { id: 'agr', name: 'Agra, Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { id: 'ayd', name: 'Ayodhya, Uttar Pradesh', lat: 26.7922, lng: 82.1998 },
  { id: 'knp', name: 'Kanpur, Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { id: 'pry', name: 'Prayagraj (Allahabad), Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
  { id: 'ded', name: 'Dehradun, Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { id: 'rsh', name: 'Rishikesh, Uttarakhand', lat: 30.0869, lng: 78.2676 },
  { id: 'hdw', name: 'Haridwar, Uttarakhand', lat: 29.9457, lng: 78.1642 },
  { id: 'nnt', name: 'Nainital, Uttarakhand', lat: 29.3919, lng: 79.4542 },
  { id: 'shim', name: 'Shimla, Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  { id: 'mnl', name: 'Manali, Himachal Pradesh', lat: 32.2432, lng: 77.1892 },
  { id: 'dhm', name: 'Dharamshala, Himachal Pradesh', lat: 32.2190, lng: 76.3234 },
  { id: 'srx', name: 'Srinagar, Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { id: 'jmu', name: 'Jammu, Jammu & Kashmir', lat: 32.7266, lng: 74.8570 },
  { id: 'leh', name: 'Leh-Ladakh (UT)', lat: 34.1526, lng: 77.5771 },

  // --- Central & East India ---
  { id: 'bho', name: 'Bhopal, Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { id: 'idr', name: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { id: 'gwl', name: 'Gwalior, Madhya Pradesh', lat: 26.2183, lng: 78.1828 },
  { id: 'jbp', name: 'Jabalpur, Madhya Pradesh', lat: 23.1815, lng: 79.9864 },
  { id: 'ujn', name: 'Ujjain, Madhya Pradesh', lat: 23.1765, lng: 75.7885 },
  { id: 'rpr', name: 'Raipur, Chhattisgarh', lat: 21.2514, lng: 81.6296 },
  { id: 'pat', name: 'Patna, Bihar', lat: 25.5941, lng: 85.1376 },
  { id: 'gya', name: 'Gaya & Bodh Gaya, Bihar', lat: 24.7914, lng: 85.0002 },
  { id: 'rnc', name: 'Ranchi, Jharkhand', lat: 23.3441, lng: 85.3096 },
  { id: 'jsr', name: 'Jamshedpur, Jharkhand', lat: 22.8046, lng: 86.2029 },
  { id: 'bbi', name: 'Bhubaneswar, Odisha', lat: 20.2961, lng: 85.8245 },
  { id: 'pri', name: 'Puri, Odisha', lat: 19.8135, lng: 85.8312 },
  { id: 'ccu', name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
  { id: 'dar', name: 'Darjeeling, West Bengal', lat: 27.0410, lng: 88.2663 },
  { id: 'ixb', name: 'Siliguri, West Bengal', lat: 26.7271, lng: 88.3953 },

  // --- Northeast India & Islands ---
  { id: 'gau', name: 'Guwahati, Assam', lat: 26.1445, lng: 91.7362 },
  { id: 'kzr', name: 'Kaziranga, Assam', lat: 26.5775, lng: 93.1711 },
  { id: 'shl', name: 'Shillong, Meghalaya', lat: 25.5788, lng: 91.8933 },
  { id: 'chk', name: 'Cherrapunji, Meghalaya', lat: 25.2702, lng: 91.7323 },
  { id: 'gtx', name: 'Gangtok, Sikkim', lat: 27.3389, lng: 88.6065 },
  { id: 'itn', name: 'Itanagar, Arunachal Pradesh', lat: 27.0844, lng: 93.6053 },
  { id: 'twg', name: 'Tawang, Arunachal Pradesh', lat: 27.5861, lng: 91.8661 },
  { id: 'imf', name: 'Imphal, Manipur', lat: 24.8170, lng: 93.9368 },
  { id: 'ajl', name: 'Aizawl, Mizoram', lat: 23.7271, lng: 92.7176 },
  { id: 'kma', name: 'Kohima, Nagaland', lat: 25.6751, lng: 94.1086 },
  { id: 'dmu', name: 'Dimapur, Nagaland', lat: 25.9094, lng: 93.7266 },
  { id: 'ixa', name: 'Agartala, Tripura', lat: 23.8315, lng: 91.2868 },
  { id: 'ixz', name: 'Port Blair, Andaman & Nicobar (UT)', lat: 11.6234, lng: 92.7265 },
  { id: 'hvl', name: 'Havelock Island (Swaraj Dweep), Andaman', lat: 11.9761, lng: 92.9876 }
];

export const INDIA_NATIONAL: LocationState = {
  id: 'india',
  name: 'India',
  lat: 20.5937,
  lng: 78.9629,
};

export const POPULAR_LOCATIONS: LocationState[] = [
  INDIA_NATIONAL,
  { id: 'gps', name: '📍 Use My Live GPS Location', lat: 0, lng: 0, isGPS: true },
  ...ALL_INDIAN_CITIES
];

// Universal place dataset template for dynamic generation anywhere in India
export function getPlacesForLocation(locationName: string, lat: number, lng: number, category: string = 'all'): Place[] {
  const baseName = locationName.split(',')[0].trim();

  // If Pan-India or India is selected, return rich curated nationwide data across India
  if (baseName.toLowerCase().includes('india')) {
    let panIndiaPlaces: Place[] = [
      {
        id: 'ind-1',
        name: 'Taj Mahal Monument & Royal Gardens',
        category: 'activity',
        rating: 4.9,
        reviewsCount: 18450,
        priceLevel: '₹₹',
        avgPrice: 500,
        newcomerScore: 99,
        address: 'Dharmapuri, Agra, Uttar Pradesh, India',
        lat: 27.1751,
        lng: 78.0421,
        distanceKm: 2.5,
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop',
        tags: ['UNESCO World Heritage', 'World Wonder', 'Iconic India', 'Must Visit'],
        description: 'Iconic 17th-century white marble mausoleum built by Shah Jahan, framed by Mughal reflection pools.',
        popularItem: 'Taj Mahal Sunrise Entry Ticket & Audio Guide (₹500)'
      },
      {
        id: 'ind-2',
        name: 'Sri Harmandir Sahib (Golden Temple)',
        category: 'activity',
        rating: 4.95,
        reviewsCount: 24100,
        priceLevel: '₹',
        avgPrice: 0,
        newcomerScore: 98,
        address: 'Golden Temple Road, Amritsar, Punjab, India',
        lat: 31.6200,
        lng: 74.8765,
        distanceKm: 3.8,
        imageUrl: '/destinations/golden_temple.jpg',
        tags: ['Spiritual Sanctuary', 'Free Community Langar', 'Sacred Amrit Sarovar'],
        description: 'Golden spiritual sanctuary surrounded by sacred holy waters operating a 24/7 free community kitchen.',
        popularItem: '24/7 Sacred Langar Meal & Sarovar Blessing Walk (Free)'
      },
      {
        id: 'ind-3',
        name: 'Bukhara Heritage Restaurant',
        category: 'food',
        rating: 4.8,
        reviewsCount: 8900,
        priceLevel: '₹₹₹₹',
        avgPrice: 3200,
        newcomerScore: 96,
        address: 'Diplomatic Enclave, New Delhi, India',
        lat: 28.5971,
        lng: 77.1741,
        distanceKm: 4.2,
        imageUrl: '/destinations/bukhara_dal.jpg',
        tags: ['North Indian', 'Legendary Dal Bukhara', 'Celebrity Favorite'],
        description: 'World-renowned Indian culinary landmark legendary for slow-cooked Dal Bukhara and tandoori delicacies.',
        popularItem: 'Legendary Slow-Cooked Dal Bukhara & Tandoori Naan (₹3,200)'
      },
      {
        id: 'ind-4',
        name: 'The Taj Mahal Palace Waterfront Hotel',
        category: 'hotel',
        rating: 4.9,
        reviewsCount: 15200,
        priceLevel: '₹₹₹₹',
        avgPrice: 16500,
        newcomerScore: 97,
        address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra, India',
        lat: 18.9217,
        lng: 72.8330,
        distanceKm: 5.1,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        tags: ['1903 Heritage Landmark', 'Gateway of India View', 'Iconic Luxury'],
        description: 'India\'s landmark luxury hotel opened in 1903, directly facing the Gateway of India and Arabian Sea.',
        popularItem: 'Sea View Heritage Suite + Royal Afternoon Tea (₹16,500)'
      },
      {
        id: 'ind-5',
        name: 'Alleppey Emerald Houseboat Experience',
        category: 'activity',
        rating: 4.85,
        reviewsCount: 11300,
        priceLevel: '₹₹₹',
        avgPrice: 4500,
        newcomerScore: 98,
        address: 'Punnamada Lake, Alappuzha, Kerala, India',
        lat: 9.4981,
        lng: 76.3388,
        distanceKm: 6.7,
        imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop',
        tags: ['Kerala Backwaters', 'Luxury Houseboat', 'Fresh Pearl Spot Fish'],
        description: 'Glide through palm-fringed tropical backwater canals aboard a private thatched wooden Kettuvallam houseboat.',
        popularItem: 'Day Backwater Cruise + Traditional Kerala Feast (₹4,500)'
      },
      {
        id: 'ind-6',
        name: 'Hawa Mahal & Amber Fort Citadel',
        category: 'activity',
        rating: 4.75,
        reviewsCount: 13400,
        priceLevel: '₹₹',
        avgPrice: 650,
        newcomerScore: 95,
        address: 'Pink City, Jaipur, Rajasthan, India',
        lat: 26.9239,
        lng: 75.8267,
        distanceKm: 7.2,
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop',
        tags: ['Royal Rajput Architecture', 'Pink City', '953 Lattice Windows'],
        description: 'Explore the 1799 Palace of Winds and hill fortress Amber Palace with sweeping panoramic views.',
        popularItem: 'Royal Jaipur Citadel & Jharokha Pass (₹650)'
      }
    ];

    if (category !== 'all') {
      panIndiaPlaces = panIndiaPlaces.filter((p) => p.category === category);
    }
    return panIndiaPlaces;
  }

  const lower = locationName.toLowerCase();

  // 1. Arunachal Pradesh Real Curated Places & Authentic Photos
  if (lower.includes('arunachal') || lower.includes('tawang') || lower.includes('itanagar') || lower.includes('ziro') || lower.includes('aalo') || lower.includes('bomdila')) {
    let arunachalPlaces: Place[] = [
      {
        id: 'aru-1',
        name: 'Tawang Monastery (Galden Namgey Lhatse)',
        category: 'activity',
        rating: 4.95,
        reviewsCount: 3820,
        priceLevel: '₹',
        avgPrice: 200,
        newcomerScore: 99,
        address: 'Cona, Tawang, Arunachal Pradesh 790104',
        lat: 27.5861,
        lng: 91.8594,
        distanceKm: 1.8,
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop',
        tags: ['Largest in India', '17th Century', 'Snow Peaks', 'Spiritual Heritage'],
        description: 'Founded in 1680, this majestic 400-year-old Buddhist monastery perches dramatically at 10,000 feet amidst snow-capped Himalayan peaks.',
        popularItem: 'Monastery Morning Chanting Tour & Butter Lamp Blessing (₹200)'
      },
      {
        id: 'aru-2',
        name: 'Sela Pass & Frozen Sela Lake',
        category: 'activity',
        rating: 4.9,
        reviewsCount: 4210,
        priceLevel: '₹',
        avgPrice: 350,
        newcomerScore: 98,
        address: 'NH 13, Tawang District, Arunachal Pradesh',
        lat: 27.5056,
        lng: 92.1039,
        distanceKm: 14.5,
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop',
        tags: ['13,700 ft Altitude', 'Himalayan Snow Pass', 'Sacred Alpine Lake'],
        description: 'Breathtaking high-altitude mountain gateway framed by fluttering Tibetan prayer flags and crystal alpine waters.',
        popularItem: 'High-Altitude Sela Pass Permit & Guided Photography Walk (₹350)'
      },
      {
        id: 'aru-3',
        name: 'Hotel Donyi Polo & Himalayan Pine Chalets',
        category: 'hotel',
        rating: 4.85,
        reviewsCount: 2150,
        priceLevel: '₹₹₹',
        avgPrice: 4200,
        newcomerScore: 96,
        address: 'Sector B, Itanagar / Tawang Ridge, Arunachal Pradesh',
        lat: 27.0988,
        lng: 93.6166,
        distanceKm: 2.4,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        tags: ['Mountain Pine Lodge', 'Himalayan Valley View', 'Fireplace & Heating'],
        description: 'Rustic wooden mountain chalets offering panoramic views of the Himalayan pine valleys, herbal saunas, and bonfire nights.',
        popularItem: 'Pine Valley Wood Chalet + Traditional Breakfast (₹4,200)'
      },
      {
        id: 'aru-4',
        name: 'Dragon Monpa Traditional Kitchen & Cafe',
        category: 'food',
        rating: 4.8,
        reviewsCount: 1940,
        priceLevel: '₹',
        avgPrice: 320,
        newcomerScore: 97,
        address: 'Old Market, Tawang, Arunachal Pradesh',
        lat: 27.5872,
        lng: 91.8640,
        distanceKm: 0.9,
        imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop',
        tags: ['Steaming Momos', 'Authentic Thukpa', 'Butter Tea (Po Cha)', 'Monpa Cuisine'],
        description: 'Beloved authentic local haven serving handmade steaming beef/chicken momos, Monpa thukpa, and organic herbal butter tea.',
        popularItem: 'Steaming Tibetan Momos + Monpa Herbal Thukpa Platter (₹280)'
      },
      {
        id: 'aru-5',
        name: 'Ziro Valley Pine & Apatani Heritage Trail',
        category: 'activity',
        rating: 4.9,
        reviewsCount: 3100,
        priceLevel: '₹₹',
        avgPrice: 600,
        newcomerScore: 98,
        address: 'Lower Subansiri, Ziro, Arunachal Pradesh',
        lat: 27.5445,
        lng: 93.8242,
        distanceKm: 22.0,
        imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&auto=format&fit=crop',
        tags: ['UNESCO Tentative List', 'Apatani Tribal Villages', 'Emerald Rice Fields'],
        description: 'Lush green plateau renowned for unique Apatani tribal culture, bamboo architecture, and serene pine-clad hills.',
        popularItem: 'Apatani Village Cultural Walk & Organic Kiwi Tasting (₹600)'
      }
    ];

    if (category !== 'all') {
      arunachalPlaces = arunachalPlaces.filter((p) => p.category === category);
    }
    return arunachalPlaces;
  }

  // 2. Assam Real Curated Places & Authentic Photos
  if (lower.includes('assam') || lower.includes('guwahati') || lower.includes('kaziranga') || lower.includes('jorhat') || lower.includes('dibrugarh')) {
    let assamPlaces: Place[] = [
      {
        id: 'ass-1',
        name: 'Kaziranga National Park Rhino Safari',
        category: 'activity',
        rating: 4.95,
        reviewsCount: 16800,
        priceLevel: '₹₹',
        avgPrice: 1200,
        newcomerScore: 99,
        address: 'Kanchanjuri, Kaziranga, Assam 785609',
        lat: 26.5775,
        lng: 93.1711,
        distanceKm: 8.5,
        imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&auto=format&fit=crop',
        tags: ['UNESCO World Heritage', 'One-Horned Rhinoceros', 'Jungle Jeep Safari'],
        description: 'World-famous sanctuary home to two-thirds of the planet\'s great one-horned rhinoceroses and wild elephant herds.',
        popularItem: 'Central Range Kaziranga Safari & Nature Guide Pass (₹1,200)'
      },
      {
        id: 'ass-2',
        name: 'Maa Kamakhya Devi Temple (Nilachal Hill)',
        category: 'activity',
        rating: 4.9,
        reviewsCount: 22400,
        priceLevel: '₹',
        avgPrice: 100,
        newcomerScore: 98,
        address: 'Kamakhya, Guwahati, Assam 781010',
        lat: 26.1663,
        lng: 91.7058,
        distanceKm: 4.2,
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop',
        tags: ['Ancient 51 Shaktipeeth', 'Nilachal Hill Shrine', 'Panoramic River Views'],
        description: 'Ancient, revered hillside temple complex overlooking the mighty Brahmaputra river with profound tantric history.',
        popularItem: 'Special Darshan Entry & Nilachal Sunset View Pass (₹100)'
      },
      {
        id: 'ass-3',
        name: 'Vivanta Guwahati Waterfront Resort',
        category: 'hotel',
        rating: 4.88,
        reviewsCount: 5400,
        priceLevel: '₹₹₹₹',
        avgPrice: 7500,
        newcomerScore: 97,
        address: 'GS Road, Khanapara, Guwahati, Assam',
        lat: 26.1158,
        lng: 91.8020,
        distanceKm: 5.1,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
        tags: ['5-Star Luxury', 'Assamese Tea Lounge', 'Spa & Infinity Pool'],
        description: 'Premier luxury hotel inspired by traditional Assamese bell-metal design, offering tea plantations tours and fine dining.',
        popularItem: 'Deluxe City View Room + Authentic Assamese Breakfast (₹7,500)'
      },
      {
        id: 'ass-4',
        name: 'Paradise Restaurant (Traditional Assamese Thali)',
        category: 'food',
        rating: 4.8,
        reviewsCount: 7100,
        priceLevel: '₹₹',
        avgPrice: 550,
        newcomerScore: 96,
        address: 'Silpukhuri, Guwahati, Assam 781003',
        lat: 26.1852,
        lng: 91.7635,
        distanceKm: 2.1,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
        tags: ['Authentic Assamese Thali', 'Khar & Maasor Tenga', 'Pitha Sweets'],
        description: 'Guwahati\'s culinary institution serving authentic Assamese thalis on traditional bell-metal (Kanh) platters.',
        popularItem: 'Complete Traditional Parampara Thali with Duck Roast & Fish Tenga (₹550)'
      }
    ];

    if (category !== 'all') {
      assamPlaces = assamPlaces.filter((p) => p.category === category);
    }
    return assamPlaces;
  }

  // 3. Himachal Pradesh & Northern Hill Stations Real Curated Places
  if (lower.includes('himachal') || lower.includes('manali') || lower.includes('shimla') || lower.includes('dharamshala') || lower.includes('spiti')) {
    let hpPlaces: Place[] = [
      {
        id: 'hp-1',
        name: 'Solang Valley & Rohtang Snow Adventure',
        category: 'activity',
        rating: 4.9,
        reviewsCount: 19800,
        priceLevel: '₹₹',
        avgPrice: 1500,
        newcomerScore: 98,
        address: 'Solang, Manali, Himachal Pradesh 175131',
        lat: 32.3166,
        lng: 77.1575,
        distanceKm: 12.0,
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop',
        tags: ['Snow Adventure', 'Paragliding & Skiing', 'Himalayan Glaciers'],
        description: 'Premier adventure hub offering snow skiing, paragliding, and sweeping views of Pir Panjal peaks.',
        popularItem: 'Rohtang Pass Snow Tour & Winter Gear Rental (₹1,500)'
      },
      {
        id: 'hp-2',
        name: 'The Oberoi Cecil Heritage Lodge',
        category: 'hotel',
        rating: 4.95,
        reviewsCount: 6200,
        priceLevel: '₹₹₹₹',
        avgPrice: 14500,
        newcomerScore: 98,
        address: 'Chaura Maidan, Shimla, Himachal Pradesh',
        lat: 31.1040,
        lng: 77.1528,
        distanceKm: 2.5,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
        tags: ['Grand Heritage Hotel', 'Colonial Cedar Suites', 'Heated Indoor Pool'],
        description: 'Historic luxury resort built in 1884 with period wooden fireplaces, antique lounges, and panoramic valley views.',
        popularItem: 'Premier Valley View Suite + English High Tea (₹14,500)'
      },
      {
        id: 'hp-3',
        name: 'Cafe 1947 & Riverside Trout Grill',
        category: 'food',
        rating: 4.8,
        reviewsCount: 9400,
        priceLevel: '₹₹',
        avgPrice: 650,
        newcomerScore: 96,
        address: 'Old Manali, Himachal Pradesh 175131',
        lat: 32.2568,
        lng: 77.1868,
        distanceKm: 3.1,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
        tags: ['Riverside Seating', 'Fresh Himalayan Trout', 'Live Acoustic Music'],
        description: 'Iconic Old Manali cafe sitting right beside the rushing Manalsu river, famous for fresh trout and mountain ambiance.',
        popularItem: 'Pan-Grilled Fresh Himalayan River Trout + Herb Rice (₹650)'
      }
    ];

    if (category !== 'all') {
      hpPlaces = hpPlaces.filter((p) => p.category === category);
    }
    return hpPlaces;
  }

  // 4. Fallback Regional Engine (Adapts automatically to Mountain vs Coastal vs Plain)
  const isMountainOrNE =
    lower.includes('sikkim') ||
    lower.includes('meghalaya') ||
    lower.includes('nagaland') ||
    lower.includes('manipur') ||
    lower.includes('mizoram') ||
    lower.includes('tripura') ||
    lower.includes('uttarakhand') ||
    lower.includes('ladakh') ||
    lower.includes('kashmir');

  const placeTemplates: Omit<Place, 'id' | 'distanceKm'>[] = isMountainOrNE
    ? [
        {
          name: `${baseName} Himalayan Viewpoint & Monastic Trail`,
          category: 'activity',
          rating: 4.9,
          reviewsCount: 4200,
          priceLevel: '₹',
          avgPrice: 250,
          newcomerScore: 98,
          address: `Scenic Ridge, ${locationName}`,
          lat: lat + 0.005,
          lng: lng + 0.004,
          imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop',
          tags: ['Himalayan Panorama', 'Sacred Monastery', 'Pristine Nature'],
          description: `Serene alpine sanctuary and heritage monastery in ${baseName} with panoramic mountain vistas.`,
          popularItem: `Monastery Heritage Tour & Sunset View Pass (₹250)`
        },
        {
          name: `${baseName} Pine Ridge Mountain Resort`,
          category: 'hotel',
          rating: 4.88,
          reviewsCount: 3100,
          priceLevel: '₹₹₹',
          avgPrice: 4800,
          newcomerScore: 96,
          address: `Hillside Estate, ${locationName}`,
          lat: lat - 0.006,
          lng: lng + 0.005,
          imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop',
          tags: ['Pine Chalets', 'Valley Views', 'Bonfire & Heating'],
          description: `Charming alpine lodge nestled in pine forests offering warm hospitality and snow peak views.`,
          popularItem: 'Deluxe Pine Chalet + Breakfast (₹4,800)'
        },
        {
          name: `${baseName} Traditional Himalayan Kitchen`,
          category: 'food',
          rating: 4.8,
          reviewsCount: 2600,
          priceLevel: '₹',
          avgPrice: 300,
          newcomerScore: 97,
          address: `Town Center, ${locationName}`,
          lat: lat + 0.003,
          lng: lng - 0.004,
          imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=600&auto=format&fit=crop',
          tags: ['Steaming Momos', 'Herbal Thukpa', 'Mountain Tea'],
          description: `Cozy local cafe celebrated for handmade steaming dumplings, hearty noodle soups, and regional flavors.`,
          popularItem: 'Signature Steaming Dumplings & Herbal Thukpa (₹260)'
        }
      ]
    : [
        {
          name: `${baseName} Heritage Landmark & Cultural Walk`,
          category: 'activity',
          rating: 4.85,
          reviewsCount: 5210,
          priceLevel: '₹',
          avgPrice: 350,
          newcomerScore: 97,
          address: `Historic Quarter, ${locationName}`,
          lat: lat + 0.004,
          lng: lng - 0.005,
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop',
          tags: ['Architectural Heritage', 'Guided Walk', 'Must Visit'],
          description: `Iconic cultural landmark and architectural marvel preserving the rich history of ${baseName}.`,
          popularItem: 'Guided Heritage & Photography Tour (₹350)'
        },
        {
          name: `The Grand ${baseName} Heritage Hotel`,
          category: 'hotel',
          rating: 4.9,
          reviewsCount: 4100,
          priceLevel: '₹₹₹₹',
          avgPrice: 7500,
          newcomerScore: 96,
          address: `Palace Road, ${locationName}`,
          lat: lat - 0.007,
          lng: lng + 0.006,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop',
          tags: ['Luxury Heritage Stay', 'Fine Dining', 'City Center'],
          description: `Premier hotel offering royal comforts, landscaped gardens, and authentic hospitality in ${baseName}.`,
          popularItem: 'Royal Heritage Room + Breakfast (₹7,500)'
        },
        {
          name: `${baseName} Authentic Regional Kitchen & Sweets`,
          category: 'food',
          rating: 4.8,
          reviewsCount: 3800,
          priceLevel: '₹₹',
          avgPrice: 420,
          newcomerScore: 96,
          address: `Bazaar Road, ${locationName}`,
          lat: lat + 0.002,
          lng: lng + 0.003,
          imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop',
          tags: ['Regional Thali', 'Signature Sweets', 'Legendary Taste'],
          description: `Renowned gastronomic landmark celebrated for traditional slow-cooked thalis and regional delicacies.`,
          popularItem: 'Special Regional Feast Thali (₹380)'
        }
      ];

  let results: Place[] = placeTemplates.map((t, idx) => {
    const dist = parseFloat((Math.sqrt(Math.pow(t.lat - lat, 2) + Math.pow(t.lng - lng, 2)) * 111).toFixed(1));
    return {
      ...t,
      id: `loc-${idx}-${baseName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      distanceKm: dist < 0.3 ? 1.2 : dist,
    };
  });

  if (category !== 'all') {
    results = results.filter((p) => p.category === category);
  }

  return results.sort((a, b) => b.newcomerScore - a.newcomerScore);
}

export const MOCK_INTERCITY_PLANS: InterCityPlan[] = [
  {
    id: 'plan-fastest',
    title: 'Hyderabad to Warangal Heritage Express',
    tier: 'Fastest',
    origin: 'Secunderabad / Ghatkesar',
    destination: 'Warangal (Thousand Pillar Temple)',
    totalCostINR: 1450,
    totalCostUSD: 17.40,
    lastUpdated: '10 mins ago',
    recommendedStay: 'Haritha Kakatiya Resort (Day trip)',
    segments: [
      {
        mode: 'Train',
        provider: 'Vande Bharat Express (Chair Car)',
        departure: '06:00 AM (Secunderabad)',
        arrival: '07:35 AM (Kazipet / Warangal)',
        duration: '1h 35m',
        durationMin: 95,
        costINR: 620,
        type: 'outbound',
        bookingStatus: 'available'
      },
      {
        mode: 'Cab',
        provider: 'Uber Intercity / Local Pre-paid Cab',
        departure: '08:00 AM (Warangal Stn)',
        arrival: '01:30 PM (Temple & Fort Tour)',
        duration: '3h 30m',
        durationMin: 210,
        costINR: 550,
        type: 'outbound',
        bookingStatus: 'available'
      },
      {
        mode: 'Train',
        provider: 'Satavahana Superfast (Return)',
        departure: '06:15 PM (Warangal)',
        arrival: '08:45 PM (Secunderabad)',
        duration: '2h 30m',
        durationMin: 150,
        costINR: 280,
        type: 'return',
        bookingStatus: 'available'
      }
    ]
  },
  {
    id: 'plan-cheapest',
    title: 'Ghatkesar to Bhongir Fort Trek Trail',
    tier: 'Cheapest',
    origin: 'Ghatkesar Hub',
    destination: 'Bhongir Monolithic Fort (28 km)',
    totalCostINR: 320,
    totalCostUSD: 3.85,
    lastUpdated: '5 mins ago',
    recommendedStay: 'Day Trekking - Return Same Evening',
    segments: [
      {
        mode: 'Train',
        provider: 'South Central Passenger / MEMU',
        departure: '07:15 AM (Ghatkesar Stn)',
        arrival: '07:50 AM (Bhongir Stn)',
        duration: '35m',
        durationMin: 35,
        costINR: 40,
        type: 'outbound',
        bookingStatus: 'available'
      },
      {
        mode: 'Cab',
        provider: 'Local E-Rickshaw / Shared Auto to Base',
        departure: '08:00 AM (Station)',
        arrival: '08:15 AM (Fort Entrance Gate)',
        duration: '15m',
        durationMin: 15,
        costINR: 60,
        type: 'outbound',
        bookingStatus: 'available'
      },
      {
        mode: 'Bus',
        provider: 'TSRTC Express Bus (Return)',
        departure: '03:30 PM (Bhongir Bus Stand)',
        arrival: '04:15 PM (Ghatkesar Junction)',
        duration: '45m',
        durationMin: 45,
        costINR: 60,
        type: 'return',
        bookingStatus: 'available'
      }
    ]
  },
  {
    id: 'plan-comfort',
    title: 'Hyderabad to Nagarjuna Sagar Lakeside',
    tier: 'Most Comfortable',
    origin: 'Hyderabad City',
    destination: 'Nagarjuna Sagar & Island Museum',
    totalCostINR: 2400,
    totalCostUSD: 28.80,
    lastUpdated: '15 mins ago',
    recommendedStay: 'Vijay Vihar AP Tourism Resort',
    segments: [
      {
        mode: 'Cab',
        provider: 'Private AC Sedan (Door-to-Door Outbound)',
        departure: '06:30 AM (Pickup)',
        arrival: '09:45 AM (Dam View Point)',
        duration: '3h 15m',
        durationMin: 195,
        costINR: 1400,
        type: 'outbound',
        bookingStatus: 'available'
      },
      {
        mode: 'Bus',
        provider: 'AP Tourism Luxury AC Coach (Return)',
        departure: '05:00 PM (Dam Jetty)',
        arrival: '08:30 PM (Hyderabad MGBS)',
        duration: '3h 30m',
        durationMin: 210,
        costINR: 600,
        type: 'return',
        bookingStatus: 'available'
      }
    ]
  }
];
