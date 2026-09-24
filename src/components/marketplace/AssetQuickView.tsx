import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Asset } from '@/types';
import { Button } from '@/components/ui/Button';

interface AssetQuickViewProps {
  asset: Asset | null;
  onClose: () => void;
}

export const AssetQuickView = ({ asset, onClose }: AssetQuickViewProps) => {
  if (!asset) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
          >
            <X size={20} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8">
              <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="w-full h-full object-cover"
                />
                {asset.isVerified && (
                  <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md">
                    <Check size={16} className="text-green-500" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="aspect-square rounded-md overflow-hidden">
                  <img
                    src={asset.imageUrl}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Placeholder thumbnails */}
                <div className="aspect-square rounded-md bg-neutral-100"></div>
                <div className="aspect-square rounded-md bg-neutral-100"></div>
                <div className="aspect-square rounded-md bg-neutral-100"></div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2">{asset.title}</h2>
              <p className="text-neutral-500 capitalize mb-4">{asset.category.replace('-', ' ')}</p>
              
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary-800">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: asset.price.currency,
                    maximumFractionDigits: 0,
                  }).format(asset.price.amount)}
                </p>
                {asset.listingType === 'auction' && asset.auctionEndTime && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Auction ends: {new Date(asset.auctionEndTime).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-neutral-600">{asset.description || 'No description available.'}</p>
              </div>
              
              {asset.specifications && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(asset.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs text-neutral-500">{key}</span>
                        <span className="text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                {asset.listingType === 'auction' ? (
                  <Button fullWidth>Place Bid</Button>
                ) : asset.listingType === 'fixed' ? (
                  <Button fullWidth>Buy Now</Button>
                ) : asset.listingType === 'swap' ? (
                  <Button variant="secondary" fullWidth>Swap Asset</Button>
                ) : (
                  <Button variant="secondary" fullWidth>View Terms</Button>
                )}
                <Button variant="outline" fullWidth onClick={() => window.location.href = `/asset/${asset.id}`}>
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};