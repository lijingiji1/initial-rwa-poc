import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Award, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';

// Mock asset type (replace with your real Asset type if available)
type Asset = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: { amount: number; currency: string };
  purchaseDate: string;
  verified?: boolean;
};

const mockAssets: Asset[] = [
  {
    id: '1',
    title: 'Luxury Downtown Penthouse',
    description: 'Stunning 3-bedroom penthouse with panoramic city views, private elevator, and rooftop terrace',
    category: 'real-estate',
    imageUrl: 'https://images.pexels.com/photos/32870/pexels-photo.jpg',
    price: { amount: 3500000, currency: 'USDT' },
    purchaseDate: '2024-05-01',
    verified: true,
  },
  {
    id: '2',
    title: 'Art Deco Diamond Ring',
    description: 'Exquisite 1920s platinum ring featuring a 3.5ct center diamond with sapphire accents',
    category: 'jewelry',
    imageUrl: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg',
    price: { amount: 85000, currency: 'USDT' },
    purchaseDate: '2024-01-18',
    verified: true,
  },
  {
    id: '3',
    title: 'Vintage Rolex Daytona',
    description: 'Classic Rolex Daytona watch, stainless steel, excellent condition.',
    category: 'watches',
    imageUrl: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg',
    price: { amount: 180000, currency: 'USDT' },
    purchaseDate: '2024-03-10',
    verified: false,
  },
  {
    id: '4',
    title: 'Contemporary Abstract Art',
    description: 'Original abstract painting by a renowned artist.',
    category: 'art',
    imageUrl: 'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg',
    price: { amount: 15000, currency: 'USDT' },
    purchaseDate: '2024-02-22',
    verified: true,
  },
];

export default function MyAssetsPage() {
  // Replace mockAssets with your store if you have one
  const [assets] = useState<Asset[]>(mockAssets);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('recent');
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  useEffect(() => {
    let result = [...assets];
    if (searchQuery) {
      result = result.filter(asset =>
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(asset => asset.category === selectedCategory);
    }
    switch (sortBy) {
      case 'recent':
        result = result.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        break;
      case 'price-high':
        result = result.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'price-low':
        result = result.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'name':
        result = result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    setFilteredAssets(result);
  }, [assets, searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Extract unique categories for filter dropdown
  const categories = [undefined, ...Array.from(new Set(assets.map(asset => asset.category)))];

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return 'All Categories';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary-800">My Assets</h1>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search my assets..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </Button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white p-6 rounded-lg border border-neutral-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value || undefined)}
                    className="input w-full p-2 rounded-lg border border-neutral-200"
                  >
                    {categories.map(category => (
                      <option key={category || 'all'} value={category || ''}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="input w-full p-2 rounded-lg border border-neutral-200"
                  >
                    <option value="recent">Recently Purchased</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredAssets.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="text-neutral-400 mb-2">
              <Award size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-neutral-800 mb-2">No assets found</h3>
            <p className="text-neutral-500">
              {assets.length === 0
                ? "You haven't purchased any assets yet."
                : "No assets match your current filter criteria."}
            </p>
            {assets.length === 0 && (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => window.location.href = '/assets'}
              >
                Explore Assets
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredAssets.map(asset => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer">
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    {asset.verified && (
                      <div className="absolute top-2 right-2 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Award size={14} className="mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    {/* FIXED: Complete restructure of the layout to ensure price stays on same line */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-primary-900 truncate max-w-[65%]" title={asset.title}>
                          {asset.title}
                        </h3>
                        <div className="text-lg font-bold text-primary-800 whitespace-nowrap">
                          {formatCurrency(asset.price.amount)} <span className="text-xs">{asset.price.currency}</span>
                        </div>
                      </div>
                      <p className="text-neutral-500 capitalize text-sm mt-1">{asset.category}</p>
                    </div>
                    <div className="mt-auto pt-2 flex items-center text-xs text-neutral-500">
                      <Clock size={14} className="mr-1" />
                      <span>Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}