import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AssetCard } from './AssetCard';
import { Button } from './ui/Button';
import { mockAssets } from '../data/mockData';

export const FeaturedAssets = () => {
  const featuredAssets = mockAssets.slice(0, 4);

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-800">Featured Assets</h2>
            <p className="mt-2 text-neutral-600">
              Discover unique real-world assets from trusted validators
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 md:mt-0"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <AssetCard asset={asset} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};