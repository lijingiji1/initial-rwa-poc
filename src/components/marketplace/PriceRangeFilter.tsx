import React from 'react';
import { Sliders } from 'lucide-react';

interface PriceRangeFilterProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  min?: number;
  max?: number;
}

export const PriceRangeFilter = ({
  priceRange,
  onPriceRangeChange,
  min = 0,
  max = 1000000,
}: PriceRangeFilterProps) => {
  const [localRange, setLocalRange] = React.useState<[number, number]>(priceRange);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value <= localRange[1]) {
      setLocalRange([value, localRange[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= localRange[0]) {
      setLocalRange([localRange[0], value]);
    }
  };

  const handleApply = () => {
    onPriceRangeChange(localRange);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Price Range</h3>
        <Sliders size={18} className="text-neutral-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-neutral-500 mb-1">Min</label>
          <input
            type="number"
            value={localRange[0]}
            onChange={handleMinChange}
            min={min}
            max={localRange[1]}
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-500 mb-1">Max</label>
          <input
            type="number"
            value={localRange[1]}
            onChange={handleMaxChange}
            min={localRange[0]}
            max={max}
            className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex justify-between text-sm text-neutral-500 mb-2">
        <span>{formatPrice(localRange[0])}</span>
        <span>{formatPrice(localRange[1])}</span>
      </div>

      <button
        onClick={handleApply}
        className="w-full py-2 bg-primary-100 text-primary-800 rounded-md hover:bg-primary-200 transition-colors"
      >
        Apply Filter
      </button>
    </div>
  );
};