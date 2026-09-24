import  { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useMockDataStore } from '@/store/mockDataStore';
import { Button } from '@/components/ui/Button';
import { AssetCategory, Asset } from '@/types';
import { CategoryFilter } from '@/components/marketplace/CategoryFilter';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { QuickViewModal } from '@/components/marketplace/QuickViewModal';
import { AssetGrid } from '@/components/marketplace/AssetGrid';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'ending-soon', label: 'Auction Ending Soon' },
];

export default function MarketplacePage() {
  const { assets, loading, loadMoreAssets, filterAssets } = useMockDataStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'newest' | 'price-low-high' | 'price-high-low' | 'ending-soon'>('newest');
  const [quickViewAsset, setQuickViewAsset] = useState<Asset | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(assets);

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

  return (
    <div className="min-h-screen bg-neutral-50 mt-8">
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800">Marketplace</h1>
          <p className="text-neutral-600 mt-2">
            Explore our collection of tokenized real-world assets
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-800' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-800' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                <List size={20} />
              </button>
            </div>
            <div className="flex-1 md:flex-none ml-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full md:w-auto px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Button
            onClick={() => setIsMobileFilterOpen(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={18} />
            Show All Filters
          </Button>
        </div>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filters */}
          <MarketplaceFilters
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
                    priceRange={priceRange} 
            onPriceRangeChange={setPriceRange}
            verifiedOnly={verifiedOnly}
            onVerifiedChange={setVerifiedOnly}
            selectedConditions={selectedConditions}
            onConditionChange={setSelectedConditions}
          />

          {/* Asset Grid */}
          <div className="flex-1">
            <AssetGrid
              assets={filteredAssets}
              viewMode={viewMode}
              loading={loading}
              onLoadMore={loadMoreAssets}
              onQuickView={setQuickViewAsset}
            />
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        asset={quickViewAsset}
        onClose={() => setQuickViewAsset(null)}
      />
    </div>
  );
}