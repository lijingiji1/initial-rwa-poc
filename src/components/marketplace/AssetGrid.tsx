import React from 'react';
import { motion } from 'framer-motion';
import { Asset } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { Button } from '@/components/ui/Button';
import { Loader } from 'lucide-react';

interface AssetGridProps {
  assets: Asset[];
  viewMode: 'grid' | 'list';
  loading: boolean;
  onLoadMore: () => void;
  onQuickView: (asset: Asset) => void;
}

export const AssetGrid = ({
  assets,
  viewMode,
  loading,
  onLoadMore,
  onQuickView,
}: AssetGridProps) => {
  if (assets.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-neutral-500 text-lg">No assets found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={viewMode === 'grid' ? 
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
        "space-y-4"}
      >
        {assets.map((asset) => (
          <motion.div
            key={asset.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={viewMode === 'list' ? "w-full" : ""}
          >
            <AssetCard 
              asset={asset} 
              onQuickView={() => onQuickView(asset)}
            />
          </motion.div>
        ))}
      </div>

      {assets.length > 0 && (
        <div className="mt-10 text-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={loading}
            className="px-8"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Assets'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};