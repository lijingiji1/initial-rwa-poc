import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AssetCategory } from '@/types';
import { PriceRangeFilter } from './PriceRangeFilter';

interface MarketplaceFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: AssetCategory | undefined;
  onCategoryChange: (category: AssetCategory | undefined) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  selectedConditions: string[];
  onConditionChange: (conditions: string[]) => void;
  isMobile?: boolean;
}

const conditions = [
  { id: 'mint', label: 'Mint' },
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
];

const categories: { value: AssetCategory | undefined; label: string }[] = [
  { value: undefined, label: 'All Categories' },
  { value: 'watches', label: 'Watches' },
  { value: 'art', label: 'Art' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'jewelry', label: 'Jewels' },
  { value: 'real-estate', label: 'Real Estate' },
];

export const MarketplaceFilters = ({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  verifiedOnly,
  onVerifiedChange,
  selectedConditions,
  onConditionChange,
  isMobile = false,
}: MarketplaceFiltersProps) => {
  const toggleCondition = (conditionId: string) => {
    const newConditions = selectedConditions.includes(conditionId)
      ? selectedConditions.filter(id => id !== conditionId)
      : [...selectedConditions, conditionId];
    onConditionChange(newConditions);
  };

  const handleClearFilters = () => {
    onCategoryChange(undefined);
    onPriceRangeChange([0, 1000000]);
    onVerifiedChange(false);
    onConditionChange([]);
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          >
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.label} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category.label}`}
                        name="category"
                        checked={selectedCategory === category.value}
                        onChange={() => onCategoryChange(category.value)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category.label}`}>{category.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <PriceRangeFilter 
                priceRange={priceRange} 
                onPriceRangeChange={onPriceRangeChange} 
              />

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Condition</h3>
                <div className="space-y-2">
                  {conditions.map(condition => (
                    <div key={condition.id} className="flex items-center">
                      <button
                        onClick={() => toggleCondition(condition.id)}
                        className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedConditions.includes(condition.id) ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`}
                      >
                        {selectedConditions.includes(condition.id) && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                      <span>{condition.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Verified Only</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={verifiedOnly} 
                      onChange={(e) => onVerifiedChange(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '300px' }}
          exit={{ opacity: 0, width: 0 }}
          className="hidden md:block w-full md:w-72 shrink-0"
        >
          <div className="bg-white p-6 rounded-lg border border-neutral-200 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
                <X size={20} />
              </button>
            </div>

            <PriceRangeFilter 
              priceRange={priceRange} 
              onPriceRangeChange={onPriceRangeChange} 
            />

            {/* Condition Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Condition</h3>
              <div className="space-y-2">
                {conditions.map(condition => (
                  <div key={condition.id} className="flex items-center">
                    <button
                      onClick={() => toggleCondition(condition.id)}
                      className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedConditions.includes(condition.id) ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`}
                    >
                      {selectedConditions.includes(condition.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </button>
                    <span>{condition.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Verified Only</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={verifiedOnly} 
                    onChange={(e) => onVerifiedChange(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};