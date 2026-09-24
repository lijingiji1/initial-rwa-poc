import { create } from 'zustand';
import { Asset as MarketplaceAsset, AssetCategory } from '@/types';

export type AssetType = AssetCategory;
export type AssetStatus = 'pending' | 'validated' | 'rejected' | 'action_required';
export type TransactionType = 'buy' | 'sell' | 'validate' | 'tokenize';

// Extend MarketplaceAsset with additional properties needed for the dashboard
interface Asset extends MarketplaceAsset {
  status: AssetStatus;
  value: number;
  createdAt: Date;
  validatedAt?: Date;
}

interface Transaction {
  id: string;
  type: TransactionType;
  assetId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  from: string;
  to: string;
}

interface Validation {
  id: string;
  assetId: string;
  status: AssetStatus;
  validatorId: string;
  requestedAt: Date;
  completedAt?: Date;
  notes?: string;
}

interface MockDataStore {
  assets: Asset[];
  transactions: Transaction[];
  validations: Validation[];
  loading: boolean;
  searchQuery: string;
  filterType: AssetType | 'all';
  setSearchQuery: (query: string) => void;
  setFilterType: (type: AssetType | 'all') => void;
  getFilteredAssets: () => Asset[];
  getPendingValidations: () => Validation[];
  getActionRequired: () => Asset[];
  getTotalValue: () => number;
  loadMoreAssets: () => Promise<void>;
  filterAssets: (category?: AssetType, priceRange?: [number, number], verifiedOnly?: boolean) => Asset[];
  searchAssets: (query: string) => Asset[];
}

// Sample mock data
const mockAssets: Asset[] = [
  // Real Estate Assets
  {
    id: 're1',
    title: 'Luxury Downtown Penthouse',
    description: 'Stunning 3-bedroom penthouse with panoramic city views, private elevator, and rooftop terrace',
    category: 'real-estate',
    status: 'validated',
    value: 3500000,
    imageUrl: '/assets/real-estate/penthouse-1.jpg.svg',
    createdAt: new Date('2024-01-05'),
    validatedAt: new Date('2024-01-12'),
    owner: {
      id: 'user789',
      name: 'Emma Thompson',
      rating: 4.8
    },
    tokenization: {
      type: 'fractional',
      totalTokens: 1000,
      availableTokens: 850,
      pricePerToken: 3500
    },
    updatedAt: new Date('2024-01-05'),
    views: 450,
    likes: 120,
    price: { amount: 3500000, currency: 'USDT' },
    isVerified: true,
    listingType: 'fixed'
  },
  {
    id: 're2',
    title: 'Historic Vineyard Estate',
    description: 'Magnificent 50-acre wine estate with main villa, guest house, and productive vineyard',
    category: 'real-estate',
    status: 'pending',
    value: 8500000,
    imageUrl: '/assets/real-estate/vineyard-1.jpg',
    createdAt: new Date('2024-02-10'),
    owner: {
      id: 'user456',
      name: 'Robert Wilson',
      rating: 4.6
    },
    tokenization: {
      type: 'fractional',
      totalTokens: 2000,
      availableTokens: 2000,
      pricePerToken: 4250
    },
    updatedAt: new Date('2024-02-10'),
    views: 280,
    likes: 95,
    price: { amount: 8500000, currency: 'USDT' },
    isVerified: false,
    listingType: 'auction',
    auctionEndTime: '2024-04-10T00:00:00Z'
  },

  // Jewelry Assets
  {
    id: 'j1',
    title: 'Art Deco Diamond Ring',
    description: 'Exquisite 1920s platinum ring featuring a 3.5ct center diamond with sapphire accents',
    category: 'jewelry',
    status: 'validated',
    value: 85000,
    imageUrl: '/assets/jewelry/diamond-ring-1.jpg',
    createdAt: new Date('2024-01-18'),
    validatedAt: new Date('2024-01-25'),
    owner: {
      id: 'user234',
      name: 'Isabella Chen',
      rating: 4.9
    },
    tokenization: {
      type: 'whole',
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 85000
    },
    updatedAt: new Date('2024-01-18'),
    views: 320,
    likes: 78,
    price: { amount: 85000, currency: 'USDT' },
    isVerified: true,
    listingType: 'fixed'
  },
  {
    id: 'j2',
    title: 'Emerald and Pearl Tiara',
    description: 'Royal collection piece featuring natural Colombian emeralds and South Sea pearls',
    category: 'jewelry',
    status: 'action_required',
    value: 125000,
    imageUrl: '/assets/jewelry/tiara-1.jpg',
    createdAt: new Date('2024-02-15'),
    owner: {
      id: 'user567',
      name: 'Victoria Adams',
      rating: 4.7
    },
    tokenization: {
      type: 'fractional',
      totalTokens: 100,
      availableTokens: 100,
      pricePerToken: 1250
    },
    updatedAt: new Date('2024-02-15'),
    views: 180,
    likes: 45,
    price: { amount: 125000, currency: 'USDT' },
    isVerified: false,
    listingType: 'auction',
    auctionEndTime: '2024-03-15T00:00:00Z'
  },
  {
    id: '1',
    title: 'Vintage Rolex Daytona',
    description: 'Rare 1960s Rolex Daytona in excellent condition',
    category: 'watches',
    status: 'validated',
    value: 180000,
    imageUrl: '/assets/watches/rolex-daytona.jpg',
    createdAt: new Date('2024-01-15'),
    validatedAt: new Date('2024-01-20'),
    owner: {
      id: 'user123',
      name: 'John Doe',
      rating: 4.5
    },
    tokenization: {
      type: 'whole',
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 180000
    },
    updatedAt: new Date('2024-01-15'),
    views: 250,
    likes: 45,
    price: { amount: 180000, currency: 'USDT' },
    isVerified: true,
    listingType: 'fixed'
  },
  {
    id: '2',
    title: 'Contemporary Abstract Painting',
    description: 'Original artwork by emerging artist Sarah Chen',
    category: 'art',
    status: 'pending',
    value: 15000,
    imageUrl: '/assets/art/abstract-1.jpg',
    createdAt: new Date('2024-02-01'),
    owner: {
      id: 'user123',
      name: 'John Doe',
      rating: 4.5
    },
    tokenization: {
      type: 'fractional',
      totalTokens: 100,
      availableTokens: 100,
      pricePerToken: 150
    },
    updatedAt: new Date('2024-02-01'),
    views: 75,
    likes: 20,
    price: { amount: 15000, currency: 'USDT' },
    isVerified: false,
    listingType: 'auction',
    auctionEndTime: '2024-03-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Sapphire and Diamond Necklace',
    description: 'Vintage 18k gold necklace with natural sapphires',
    category: 'jewelry',
    status: 'action_required',
    value: 45000,
    imageUrl: '/assets/jewelry/sapphire-necklace.jpg',
    createdAt: new Date('2024-01-25'),
    owner: {
      id: 'user123',
      name: 'John Doe',
      rating: 4.5
    },
    tokenization: {
      type: 'whole',
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 45000
    },
    updatedAt: new Date('2024-01-25'),
    views: 120,
    likes: 35,
    price: { amount: 45000, currency: 'USDT' },
    isVerified: false,
    listingType: 'fixed'
  },
  {
    id: '4',
    title: 'Luxury Beachfront Villa',
    description: 'Modern 5-bedroom villa with private beach access',
    category: 'real-estate',
    status: 'validated',
    value: 2500000,
    imageUrl: '/assets/real-estate/villa-1.jpg.svg',
    createdAt: new Date('2024-01-10'),
    validatedAt: new Date('2024-01-18'),
    owner: {
      id: 'user123',
      name: 'John Doe',
      rating: 4.5
    },
    tokenization: {
      type: 'fractional',
      totalTokens: 1000,
      availableTokens: 1000,
      pricePerToken: 2500
    },
    updatedAt: new Date('2024-01-10'),
    views: 300,
    likes: 85,
    price: { amount: 2500000, currency: 'USDT' },
    isVerified: true,
    listingType: 'fixed'
  },
  {
    id: '5',
    title: 'Rare Baseball Card Collection',
    description: 'Complete set of 1952 Topps cards',
    category: 'collectibles',
    status: 'action_required',
    value: 75000,
    imageUrl: '/assets/collectibles/baseball-cards.png',
    createdAt: new Date('2024-02-05'),
    owner: {
      id: 'user123',
      name: 'John Doe',
      rating: 4.5
    },
    tokenization: {
      type: 'whole',
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 75000
    },
    updatedAt: new Date('2024-02-05'),
    views: 90,
    likes: 25,
    price: { amount: 75000, currency: 'USDT' },
    isVerified: false,
    listingType: 'fixed'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'buy',
    assetId: '1',
    amount: 180000,
    status: 'completed',
    date: new Date('2024-01-15'),
    from: 'seller456',
    to: 'user123'
  },
  {
    id: 't2',
    type: 'tokenize',
    assetId: '2',
    amount: 15000,
    status: 'pending',
    date: new Date('2024-02-01'),
    from: 'user123',
    to: 'system'
  },
  {
    id: 't3',
    type: 'validate',
    assetId: '3',
    amount: 45000,
    status: 'pending',
    date: new Date('2024-01-25'),
    from: 'user123',
    to: 'validator789'
  }
];

const mockValidations: Validation[] = [
  {
    id: 'v1',
    assetId: '2',
    status: 'pending',
    validatorId: 'validator789',
    requestedAt: new Date('2024-02-01'),
    notes: 'Awaiting authentication documents'
  },
  {
    id: 'v2',
    assetId: '3',
    status: 'action_required',
    validatorId: 'validator456',
    requestedAt: new Date('2024-01-25'),
    notes: 'Additional certification required'
  },
  {
    id: 'v3',
    assetId: '5',
    status: 'action_required',
    validatorId: 'validator123',
    requestedAt: new Date('2024-02-05'),
    notes: 'Condition report needed'
  }
];

export const useMockDataStore = create<MockDataStore>((set, get) => ({
  assets: mockAssets,
  transactions: mockTransactions,
  validations: mockValidations,
  loading: false,
  searchQuery: '',
  filterType: 'all',

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterType: (type: AssetType | 'all') => set({ filterType: type }),

  getFilteredAssets: () => {
    const { assets, searchQuery, filterType } = get();
    return assets.filter(asset => {
      const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || asset.category === filterType;
      return matchesSearch && matchesType;
    });
  },

  getPendingValidations: () => {
    const { validations } = get();
    return validations.filter(v => v.status === 'pending');
  },

  getActionRequired: () => {
    const { assets } = get();
    return assets.filter(a => a.status === 'action_required');
  },

  getTotalValue: () => {
    const { assets } = get();
    return assets.reduce((total, asset) => total + asset.value, 0);
  },

  loadMoreAssets: async () => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      set({ loading: false });
  },

  filterAssets: (category?: AssetType, priceRange?: [number, number], verifiedOnly?: boolean) => {
    const { assets } = get();
    return assets.filter(asset => {
      const matchesCategory = !category || asset.category === category;
      const matchesPriceRange = !priceRange || (asset.price.amount >= priceRange[0] && asset.price.amount <= priceRange[1]);
      const matchesVerification = !verifiedOnly || asset.isVerified;
      return matchesCategory && matchesPriceRange && matchesVerification;
    });
  },

  searchAssets: (query: string) => {
    const { assets } = get();
    return assets.filter(asset => 
      asset.title.toLowerCase().includes(query.toLowerCase()) ||
      asset.description.toLowerCase().includes(query.toLowerCase())
    );
  },
}));