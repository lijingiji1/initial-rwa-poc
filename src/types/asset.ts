export type AssetCategory = 'real-estate' | 'art' | 'watches' | 'jewelry' | 'collectibles' | 'vehicles' | 'other';

export type AssetStatus = 'draft' | 'pending' | 'listed' | 'sold' | 'delisted';

export type TokenizationType = 'fractional' | 'full';

export type SaleType = 'fixed' | 'auction';

export interface AssetDocument {
  id: string;
  type: 'title_deed' | 'certificate' | 'valuation_report' | 'other';
  url: string;
  name: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface AssetToken {
  id: string;
  assetId: string;
  totalSupply: number;
  availableSupply: number;
  pricePerToken: number;
  minPurchase: number;
  contractAddress?: string;
  tokenStandard: 'ERC20' | 'ERC721';
}

export interface AssetValuation {
  id: string;
  value: number;
  currency: string;
  date: Date;
  appraiser?: string;
  report?: string;
}

export interface AssetLocation {
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  
  // Media
  images: string[];
  videos?: string[];
  
  // Tokenization
  token: AssetToken;
  tokenizationType: TokenizationType;
  
  // Sale
  saleType: SaleType;
  listingPrice: number;
  currency: string;
  listingDate?: Date;
  expiryDate?: Date;
  
  // Verification
  documents: AssetDocument[];
  valuation: AssetValuation;
  verified: boolean;
  
  // Location (if applicable)
  location?: AssetLocation;
  
  // Ownership
  ownerId: string;
  ownershipHistory: {
    userId: string;
    tokens: number;
    date: Date;
    type: 'mint' | 'transfer' | 'burn';
  }[];
  
  // Stats
  views: number;
  likes: number;
  watchlist: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetListing {
  id: string;
  assetId: string;
  sellerId: string;
  
  // Pricing
  pricePerToken: number;
  totalTokens: number;
  minPurchase: number;
  currency: string;
  
  // Auction specific
  startPrice?: number;
  reservePrice?: number;
  currentBid?: number;
  highestBidderId?: string;
  
  // Status
  status: 'active' | 'ended' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  
  // Stats
  totalViews: number;
  uniqueViews: number;
  watchlistCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetTransaction {
  id: string;
  assetId: string;
  listingId: string;
  
  // Participants
  buyerId: string;
  sellerId: string;
  
  // Transaction details
  type: 'purchase' | 'bid' | 'transfer';
  tokens: number;
  pricePerToken: number;
  totalAmount: number;
  currency: string;
  
  // Payment
  paymentMethod: 'crypto' | 'fiat';
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  
  // Status
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  
  createdAt: Date;
  completedAt?: Date;
}

export interface AssetBid {
  id: string;
  assetId: string;
  listingId: string;
  bidderId: string;
  
  amount: number;
  currency: string;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetFilter {
  category?: AssetCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
  tokenizationType?: TokenizationType[];
  saleType?: SaleType[];
  status?: AssetStatus[];
  location?: {
    country?: string;
    city?: string;
  };
  verified?: boolean;
}