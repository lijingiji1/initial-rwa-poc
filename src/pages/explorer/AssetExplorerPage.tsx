import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader, ChevronDown, Check, X, DollarSign, Clock, AlertCircle, Grid, List } from 'lucide-react';
import { useAssetStore } from '@/store/assetStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Asset, AssetCategory, FilterPanelProps, AssetStatus, TokenizationType, ListingType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/Badge';
import { AssetCard } from '@/components/AssetCard';

// Mock data for assets
const mockAssets: Asset[] = [
  {
    id: '1',
    title: 'Luxury Watch Collection',
    description: 'Rare collection of vintage Rolex watches',
    category: 'watches' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d',
    images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d'],
    price: { amount: 250000, currency: 'USD' },
    tokenization: {
      type: 'fractional' as TokenizationType,
      totalTokens: 1000,
      availableTokens: 500,
      pricePerToken: 250
    },
    listingType: 'auction' as ListingType,
    isVerified: true,
    owner: { id: '0x1234...5678', name: 'John Doe', rating: 4.8 },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    auctionEndTime: '2023-12-31T23:59:59Z',
    views: 1500,
    likes: 120,
    value: 250000,
    tokenId: '1'
  },
  {
    id: '2',
    title: 'Modern Art Painting',
    description: 'Contemporary abstract painting by renowned artist',
    category: 'art' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    images: ['https://images.unsplash.com/photo-1579546929518-9e396f3cc809'],
    price: { amount: 150000, currency: 'USD' },
    tokenization: {
      type: 'whole' as TokenizationType,
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 150000
    },
    listingType: 'fixed' as ListingType,
    isVerified: true,
    owner: { id: '0x2345...6789', name: 'Jane Smith', rating: 4.9 },
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-02-20'),
    views: 2000,
    likes: 180,
    value: 150000,
    tokenId: '2'
  },
  {
    id: '3',
    title: 'Rare Coin Collection',
    description: 'Collection of rare ancient coins',
    category: 'collectibles' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e'],
    price: { amount: 75000, currency: 'USD' },
    tokenization: {
      type: 'fractional' as TokenizationType,
      totalTokens: 1000,
      availableTokens: 750,
      pricePerToken: 75
    },
    listingType: 'fixed' as ListingType,
    isVerified: true,
    owner: { id: '0x3456...7890', name: 'Mike Johnson', rating: 4.7 },
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    views: 1200,
    likes: 90,
    value: 75000,
    tokenId: '3'
  },
  {
    id: '4',
    title: 'Diamond Necklace',
    description: 'Exclusive diamond necklace with rare stones',
    category: 'jewelry' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a'],
    price: { amount: 500000, currency: 'USD' },
    tokenization: {
      type: 'whole' as TokenizationType,
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 500000
    },
    listingType: 'auction' as ListingType,
    isVerified: true,
    owner: { id: '0x4567...8901', name: 'Sarah Wilson', rating: 4.9 },
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-05'),
    auctionEndTime: '2023-12-15T23:59:59Z',
    views: 3000,
    likes: 250,
    value: 500000,
    tokenId: '4'
  },
  {
    id: '5',
    title: 'Luxury Penthouse',
    description: 'Premium penthouse in downtown area',
    category: 'real-estate' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224',
    images: ['https://images.unsplash.com/photo-1613545325278-f24b0cae1224'],
    price: { amount: 2000000, currency: 'USD' },
    tokenization: {
      type: 'fractional' as TokenizationType,
      totalTokens: 10000,
      availableTokens: 5000,
      pricePerToken: 200
    },
    listingType: 'fixed' as ListingType,
    isVerified: true,
    owner: { id: '0x5678...9012', name: 'David Brown', rating: 4.8 },
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2023-05-12'),
    views: 5000,
    likes: 400,
    value: 2000000,
    tokenId: '5'
  },
  {
    id: '6',
    title: 'Vintage Car Collection',
    description: 'Collection of classic cars from the 1960s',
    category: 'vehicles' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70'],
    price: { amount: 3000000, currency: 'USD' },
    tokenization: {
      type: 'fractional' as TokenizationType,
      totalTokens: 10000,
      availableTokens: 3000,
      pricePerToken: 300
    },
    listingType: 'auction' as ListingType,
    isVerified: true,
    owner: { id: '0x6789...0123', name: 'Robert Taylor', rating: 4.9 },
    createdAt: new Date('2023-06-18'),
    updatedAt: new Date('2023-06-18'),
    auctionEndTime: '2023-12-20T23:59:59Z',
    views: 4000,
    likes: 350,
    value: 3000000,
    tokenId: '6'
  },
  {
    id: '7',
    title: 'Rare Stamp Collection',
    description: 'Collection of rare postage stamps',
    category: 'collectibles' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e'],
    price: { amount: 100000, currency: 'USD' },
    tokenization: {
      type: 'whole' as TokenizationType,
      totalTokens: 1,
      availableTokens: 1,
      pricePerToken: 100000
    },
    listingType: 'fixed' as ListingType,
    isVerified: false,
    owner: { id: '0x7890...1234', name: 'Emily Davis', rating: 4.6 },
    createdAt: new Date('2023-07-22'),
    updatedAt: new Date('2023-07-22'),
    views: 800,
    likes: 60,
    value: 100000,
    tokenId: '7'
  },
  {
    id: '8',
    title: 'Luxury Yacht',
    description: 'Premium yacht with modern amenities',
    category: 'vehicles' as AssetCategory,
    status: 'listed' as AssetStatus,
    imageUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7'],
    price: { amount: 5000000, currency: 'USD' },
    tokenization: {
      type: 'fractional' as TokenizationType,
      totalTokens: 10000,
      availableTokens: 2000,
      pricePerToken: 500
    },
    listingType: 'auction' as ListingType,
    isVerified: true,
    owner: { id: '0x8901...2345', name: 'William Clark', rating: 4.9 },
    createdAt: new Date('2023-08-30'),
    updatedAt: new Date('2023-08-30'),
    auctionEndTime: '2023-12-25T23:59:59Z',
    views: 6000,
    likes: 500,
    value: 5000000,
    tokenId: '8'
  }
];

// Buy Modal Component
const BuyModal = ({ 
  asset, 
  isOpen, 
  onClose, 
  onConfirmPurchase 
}: { 
  asset: Asset | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirmPurchase: () => Promise<void>; 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('crypto');
  
  const handlePurchase = async () => {
    if (!asset) return;
    
    try {
      setIsProcessing(true);
      await onConfirmPurchase();
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase  Asset</DialogTitle>
          <DialogDescription>
            Complete your purchase for this premium asset.
          </DialogDescription>
        </DialogHeader>
        
        {asset && (
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden">
                <img 
                  src={asset.imageUrl} 
                  alt={asset.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-lg">{asset.title}</h3>
                <p className="text-neutral-500 text-sm">{asset.category}</p>
                <div className="flex items-center mt-1 text-primary-700 font-medium">
                  <DollarSign size={16} className="mr-1" />
                  <span>{asset.price.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Select Payment Method</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1"
                    onClick={() => setPaymentMethod('crypto')}
                  >
                    Cryptocurrency
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1"
                    disabled={true}
                    onClick={() => setPaymentMethod('fiat')}
                  >
                    Credit Card (Coming Soon)
                  </Button>
                </div>
              </div>
              
              {paymentMethod === 'crypto' ? (
                <div className="rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                  <p className="text-sm text-neutral-700">
                    You'll be prompted to connect your wallet and approve the transaction.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input type="text" placeholder="Card Number" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="text" placeholder="MM/YY" />
                    <Input type="text" placeholder="CVC" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Filter Panel Component
const FilterPanel = ({
  isOpen,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  verifiedOnly,
  setVerifiedOnly,
  onReset,
  categories,
}: FilterPanelProps) => {
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);
  
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);
  
  const handleApplyPriceRange = () => {
    if (tempPriceRange[0] >= 0 && tempPriceRange[1] >= tempPriceRange[0]) {
      setPriceRange(tempPriceRange);
    }
  };

  const handlePriceRangeChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    const newRange = [...tempPriceRange] as [number, number];
    newRange[index] = numValue;
    setTempPriceRange(newRange);
  };
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Filters</h3>
            <Button variant="secondary" size="sm" onClick={onReset} className="text-neutral-500">
              Reset All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.label} value={category.value || "all"}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input
                    type="number"
                    min="0"
                    value={tempPriceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    className="pl-8"
                    placeholder="Min"
                  />
                </div>
                <span className="text-neutral-500">to</span>
                <div className="relative flex-1">
                  <DollarSign size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input
                    type="number"
                    min="0"
                    value={tempPriceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    className="pl-8"
                    placeholder="Max"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleApplyPriceRange}
                  className="whitespace-nowrap"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Verification
              </label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="verified-only"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                />
                <label 
                  htmlFor="verified-only" 
                  className="text-sm text-neutral-700 cursor-pointer flex items-center"
                >
                  Show verified assets only
                  <Check size={16} className={`ml-1 text-primary-500 ${verifiedOnly ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Page Component
const AssetExplorerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'newest' | 'price-low-high' | 'price-high-low' | 'ending-soon'>('newest');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(mockAssets);

  // Use mock data directly
  const assets = mockAssets;
  
  // Set up categories
  const categories = [
    { value: undefined, label: 'All Categories' },
    { value: 'watches', label: 'Watches' },
    { value: 'art', label: 'Art' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'real-estate', label: 'Real Estate' },
  ];

  
  
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'ending-soon', label: 'Auction Ending Soon' },
];


// Filter assets based on category, price range and verification status
const filterAssets = (category: string | undefined, priceRange: [number, number], verifiedOnly: boolean) => {
  return assets.filter(asset => {
    // Category filter
    if (category && asset.category !== category) return false;
    
    // Price range filter
    if (asset.price.amount < priceRange[0] || asset.price.amount > priceRange[1]) return false;
    
    // Verification filter
    if (verifiedOnly && !asset.isVerified) return false;
    
    return true;
  });
};

useEffect(() => {
  // Start with all assets
  let result = [...assets];
  
  // Apply category and price range filters first
  result = filterAssets(selectedCategory, priceRange, verifiedOnly);
  
  // Then apply search filter if there's a search query
  if (searchQuery.trim()) {
    result = result.filter(asset => 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Finally apply sorting
  result = sortAssets(result, sortOption);
  
  setFilteredAssets(result);
}, [assets, searchQuery, selectedCategory, priceRange, verifiedOnly, sortOption]);

const sortAssets = (assetsToSort: Asset[], sortBy: string) => {
  switch (sortBy) {
    case 'price-low-high':
      return [...assetsToSort].sort((a, b) => a.price.amount - b.price.amount);
    case 'price-high-low':
      return [...assetsToSort].sort((a, b) => b.price.amount - a.price.amount);
    case 'ending-soon':
      return [...assetsToSort].sort((a, b) => {
        if (!a.auctionEndTime) return 1;
        if (!b.auctionEndTime) return -1;
        return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
      });
    case 'newest':
    default:
      return assetsToSort;
  }
};



  // Debounced search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Show loading indicator briefly when searching
    if (value.trim() !== searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 300);
    }
  };

  const handleBuyClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsBuyModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedAsset) return;
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsBuyModalOpen(false);
    toast({
      title: "Purchase Successful!",
      description: `You are now the proud owner of ${selectedAsset.title}`,
      variant: "default",
    });
  };
  
  const resetFilters = () => {
    setSelectedCategory(undefined);
    setPriceRange([0, 1000000]);
    setVerifiedOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
          <h1 className="text-3xl font-bold text-primary-800">Asset Explorer</h1>
            <p className="text-neutral-500 mt-1">Discover and invest in premium tokenized assets</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-neutral-200">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`rounded-md transition-colors ${
                      isLoading ? 'bg-primary-100 text-primary-800' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Grid size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`rounded-md transition-colors ${
                      isLoading ? 'bg-primary-100 text-primary-800' : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <List size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List View</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name, description, or token ID..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader size={18} className="animate-spin text-neutral-400" />
              </div>
            )}
          </div>
          
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Filter size={18} />
            Filters
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        <FilterPanel
          isOpen={isFilterOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          onReset={resetFilters}
          categories={categories}
        />

        {/* Results summary */}
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">
            Showing <span className="font-medium">{filteredAssets.length}</span> results
            {(searchQuery || selectedCategory || verifiedOnly || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={resetFilters}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                <X size={14} className="mr-1" />
                Clear filters
              </Button>
            )}
          </p>
          
          <div className="text-sm text-neutral-500 flex items-center">
            <Clock size={14} className="mr-1" />
            Auto-refreshing
          </div>
                </div>

        {/* Results Section */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200">
                  <Skeleton className="h-48" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Assets</h3>
              <p className="text-neutral-500">{error}</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Assets Found</h3>
              <p className="text-neutral-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onBuyClick={handleBuyClick}
                />
              ))}
              </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      <BuyModal
        asset={selectedAsset}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onConfirmPurchase={handleConfirmPurchase}
      />
    </div>
  );
};

export default AssetExplorerPage;