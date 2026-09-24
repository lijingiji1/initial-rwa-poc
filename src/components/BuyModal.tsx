import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Asset } from '@/types';
import { Button } from '@/components/ui/Button';

interface BuyModalProps {
  asset: Asset | null;
  onClose: () => void;
  onConfirmPurchase: () => void;
}

export const BuyModal = ({ asset, onClose, onConfirmPurchase }: BuyModalProps) => {
  if (!asset) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <img
              src={asset.imageUrl}
              alt={asset.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold">{asset.title}</h3>
              <p className="text-neutral-600">{asset.category}</p>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">Price</span>
              <span className="font-semibold">
                {asset.price.currency === 'USDT' 
                  ? `${asset.price.amount.toLocaleString()} USDT`
                  : new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: asset.price.currency,
                      maximumFractionDigits: 0,
                    }).format(asset.price.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Platform Fee</span>
              <span className="font-semibold">2.5%</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={onConfirmPurchase}
            >
              Confirm Purchase
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}; 