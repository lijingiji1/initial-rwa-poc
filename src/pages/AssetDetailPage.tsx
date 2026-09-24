import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Wallet, Repeat, CreditCard, Check, X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useMockDataStore } from '@/store/mockDataStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { assets } = useMockDataStore();
  const asset = assets.find(a => a.id === id);

  if (!asset) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Asset Not Found</h2>
        <p className="text-neutral-600 mb-8">The asset you're looking for doesn't exist or has been removed.</p>
        <Link to="/marketplace">
          <Button>Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const { 
    title, 
    category, 
    price, 
    imageUrl, 
    isVerified, 
    validation,
    description,
    specifications,
    listingType,
    auctionEndTime
  } = asset;

  // Mock related assets (just using other assets from the mock data)
  const relatedAssets = assets
    .filter(a => a.category === category && a.id !== id)
    .slice(0, 3);

  return (
    <div className="bg-neutral-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6 mt-6">
          <Link to="/marketplace" className="flex items-center text-neutral-600 hover:text-primary-800 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Back to Marketplace
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Left Column - Asset Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-96 object-cover"
                />
                {isVerified && (
                  <div className="absolute top-4 right-4 bg-success-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Check size={14} className="mr-1" />
                    Verified
                  </div>
                )}
              </div>

              {/* Additional images would go here (using placeholder for now) */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`${title} view ${i}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Asset Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-3xl font-bold text-primary-800">{title}</h1>
                  <Badge 
                    variant={listingType === 'auction' ? 'primary' : 
                            listingType === 'fixed' ? 'success' : 
                            listingType === 'swap' ? 'secondary' : 'error'}
                    className="capitalize"
                  >
                    {listingType}
                  </Badge>
                </div>
                <p className="text-neutral-600 capitalize">{category.replace('-', ' ')}</p>
              </div>

              {/* Price and Auction Details */}
              <div className="my-6 p-4 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600">Current {listingType === 'auction' ? 'Bid' : 'Price'}</span>
                  <span className="text-2xl font-bold text-primary-800">
                    {formatCurrency(price.amount, price.currency)}
                  </span>
                </div>
                
                {listingType === 'auction' && auctionEndTime && (
                  <div className="flex items-center text-neutral-700">
                    <Clock size={16} className="mr-2" />
                    <span>
                      Ends: {formatDate(auctionEndTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* Validator Info */}
              {validation?.validatedBy && (
                <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Validator</h3>
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-2 rounded-full mr-3">
                      <Check size={16} className="text-primary-800" />
                    </div>
                    <div>
                      <p className="font-medium">{validation.validatedBy}</p>
                      <p className="text-sm text-neutral-600">
                        Validated on {validation.validatedAt ? formatDate(validation.validatedAt.toISOString()) : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {listingType === 'auction' && (
                  <>
                    <Button fullWidth>Place Bid</Button>
                    <Button variant="secondary" fullWidth>Set Auto-Bid</Button>
                  </>
                )}
                
                {listingType === 'fixed' && (
                  <>
                    <Button fullWidth icon={<Wallet size={16} />}>Buy Now</Button>
                    <Button variant="secondary" fullWidth icon={<CreditCard size={16} />}>Make Offer</Button>
                  </>
                )}
                
                {listingType === 'swap' && (
                  <>
                    <Button fullWidth icon={<Repeat size={16} />}>Swap Asset</Button>
                    <Button variant="secondary" fullWidth>View Details</Button>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-neutral-700">{description}</p>
              </div>

              {/* Asset Specifications */}
              {specifications && (
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm text-neutral-500">{key}</span>
                        <span className="text-neutral-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View on Blockchain Link */}
              <div className="mt-auto pt-4 border-t border-neutral-200">
                <a
                  href="#"
                  className="text-primary-800 hover:text-primary-600 text-sm inline-flex items-center"
                >
                  <ExternalLink size={14} className="mr-1" />
                  View on Blockchain
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Assets */}
        {relatedAssets.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-primary-800 mb-6">Related Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAssets.map(relatedAsset => (
                <Link 
                  key={relatedAsset.id} 
                  to={`/asset/${relatedAsset.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="relative h-48">
                      <img
                        src={relatedAsset.imageUrl}
                        alt={relatedAsset.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold truncate">{relatedAsset.title}</h4>
                      <p className="text-neutral-500 text-sm capitalize">{relatedAsset.category.replace('-', ' ')}</p>
                      <p className="text-primary-800 font-bold mt-2">
                        {formatCurrency(relatedAsset.price.amount, relatedAsset.price.currency)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetailPage;