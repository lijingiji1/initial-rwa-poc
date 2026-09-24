export type AssetCategory = 'real-estate' | 'art' | 'watches' | 'jewelry' | 'collectibles' | 'vehicles' | 'other';
export type AssetStatus = 'pending' | 'validated' | 'rejected' | 'action_required';
export type ListingType = 'fixed' | 'auction' | 'swap';
export type TokenizationType = 'fractional' | 'whole';

export type UserRole = 'buyer' | 'seller' | 'validator' | 'admin';
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export type AssetType = 'watches' | 'art' | 'collectibles' | 'jewelry' | 'real-estate';

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  imageUrl: string;
  images?: string[];
  videos?: string[];
  documents?: AssetDocument[];
  price: {
    amount: number;
    currency: string;
  };
  tokenization: {
    type: TokenizationType;
    totalTokens: number;
    availableTokens: number;
    pricePerToken: number;
  };
  listingType: ListingType;
  isVerified: boolean;
  location?: AssetLocation;
  specifications?: Record<string, string>;
  owner: {
    id: string;
    name: string;
    rating?: number;
  };
  validation?: AssetValidation;
  createdAt: Date;
  updatedAt: Date;
  auctionEndTime?: string;
  views: number;
  likes: number;
  value: number;
  tokenId: string;
}

export interface AssetDocument {
  id: string;
  type: 'title_deed' | 'certificate' | 'valuation_report' | 'other';
  url: string;
  name: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface AssetLocation {
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AssetValidation {
  status: AssetStatus;
  validatedBy?: string;
  validatedAt?: Date;
  comments?: string;
  documents?: AssetDocument[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: UserRole[];
  kyc: {
    status: KYCStatus;
    documents: {
      idVerification?: AssetDocument;
      addressProof?: AssetDocument;
      additionalDocs?: AssetDocument[];
    };
    verifiedAt?: Date;
  };
  wallet: {
    address: string;
    balance: number;
    currency: string;
  };
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
    };
  };
  stats: {
    assetsListed: number;
    assetsSold: number;
    assetsBought: number;
    totalValue: number;
    rating: number;
    reviews: number;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    twoFactorEnabled: boolean;
    categories: AssetCategory[];
  };
  bankAccount?: {
    verified: boolean;
    last4: string;
    type: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'bid' | 'tokenize';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  asset: {
    id: string;
    title: string;
    imageUrl: string;
  };
  amount: {
    value: number;
    currency: string;
  };
  tokens?: {
    amount: number;
    price: number;
  };
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  paymentMethod: 'crypto' | 'fiat';
  timestamp: Date;
  hash?: string;
}

export interface Bid {
  id: string;
  assetId: string;
  bidder: {
    id: string;
    name: string;
    rating?: number;
  };
  amount: {
    value: number;
    currency: string;
  };
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string; // User or Asset ID being reviewed
  type: 'user' | 'asset';
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
  reported: boolean;
}

export interface Filter {
  category?: AssetCategory;
  priceRange?: [number, number];
  verifiedOnly: boolean;
  sort: 'newest' | 'price-low-high' | 'price-high-low' | 'ending-soon';
}

export interface AssetFilter {
  category?: AssetCategory;
  priceRange?: [number, number];
  location?: string;
  listingType?: ListingType;
  tokenizationType?: TokenizationType;
  status?: AssetStatus;
  verified?: boolean;
}

export interface SortOption {
  field: 'price' | 'createdAt' | 'popularity' | 'endTime';
  direction: 'asc' | 'desc';
}

export interface FilterPanelProps {
  isOpen: boolean;
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (verified: boolean) => void;
  onReset: () => void;
  categories: Array<{
    value: string | undefined;
    label: string;
  }>;
}