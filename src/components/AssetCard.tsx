import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Asset } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface AssetCardProps {
  asset: Asset;
  onQuickView?: (asset: Asset) => void;
  onBuyClick?: (asset: Asset) => void;
}

export const AssetCard = ({ asset, onQuickView, onBuyClick }: AssetCardProps) => {
  const { title, category, price, imageUrl, isVerified, listingType, auctionEndTime } = asset;

  const getActionButton = () => {
    switch (listingType) {
      case 'auction':
        return <Button size="sm" fullWidth onClick={() => onQuickView?.(asset)}>Place Bid</Button>;
      case 'fixed':
        return <Button size="sm" fullWidth onClick={() => onBuyClick?.(asset)}>Buy Now</Button>;
      case 'swap':
        return <Button size="sm" variant="secondary" fullWidth onClick={() => onQuickView?.(asset)}>Swap Asset</Button>;
      default:
        return <Button size="sm" fullWidth onClick={() => onQuickView?.(asset)}>View Details</Button>;
    }
  };

  return (
    <Card interactive className="h-full flex flex-col">
      <div className="flex flex-col h-full">
        <div 
          className="relative overflow-hidden h-48 md:h-64 cursor-pointer"
          onClick={() => onQuickView?.(asset)}
        >
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {isVerified && (
            <div className="validator-badge shadow-md">
              <Check size={16} />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
            <Badge 
              variant={listingType === 'auction' ? 'primary' : 
                      listingType === 'fixed' ? 'success' : 
                      listingType === 'swap' ? 'secondary' : 'error'}
            >
              {listingType === 'auction' ? 'Auction' : 
               listingType === 'fixed' ? 'Buy Now' : 
               listingType === 'swap' ? 'Swap' : 'View Details'}
            </Badge>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-4 flex-1">
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            <p className="text-neutral-500 capitalize text-sm">{category.replace('-', ' ')}</p>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-primary-800">
                {formatCurrency(price.amount, price.currency)}
              </span>
              {listingType === 'auction' && auctionEndTime && (
                <span className="text-xs text-neutral-500">
                  Ends: {new Date(auctionEndTime).toLocaleDateString()}
                </span>
              )}
            </div>
            {getActionButton()}
          </div>
        </div>
      </div>
    </Card>
  );
};