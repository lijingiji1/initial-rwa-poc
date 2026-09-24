import React from 'react';
import { AssetCategory } from '@/types';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: AssetCategory | undefined;
  onCategoryChange: (category: AssetCategory | undefined) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories: { value: AssetCategory | undefined; label: string; icon: string }[] = [
    { value: undefined, label: 'All', icon: '🌐' },
    { value: 'watches', label: 'Watches', icon: '⌚' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'collectibles', label: 'Collectibles', icon: '🏆' },
    { value: 'jewelry', label: 'Jewelry', icon: '💎' },
    { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.label}
            onClick={() => onCategoryChange(category.value)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${selectedCategory === category.value
              ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
              : 'bg-white border border-neutral-200 hover:bg-neutral-50'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};