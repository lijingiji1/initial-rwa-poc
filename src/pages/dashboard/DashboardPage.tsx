import React from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMockDataStore } from '@/store/mockDataStore';
import { formatCurrency } from '@/utils/format';

export default function DashboardPage() {
  const { 
    assets,
    getFilteredAssets,
    getPendingValidations,
    getActionRequired,
    getTotalValue,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType
  } = useMockDataStore();

  const filteredAssets = getFilteredAssets();
  const pendingValidations = getPendingValidations();
  const actionRequired = getActionRequired();
  const totalValue = getTotalValue();

  const stats = [
    {
      icon: Package,
      label: 'Total Assets',
      value: assets.length.toString(),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: DollarSign,
      label: 'Total Value',
      value: formatCurrency(totalValue),
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Clock,
      label: 'Pending Validations',
      value: pendingValidations.length.toString(),
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      icon: AlertCircle,
      label: 'Action Required',
      value: actionRequired.length.toString(),
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your assets</p>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 flex items-center gap-4 border border-gray-100"
          >
            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-200 text-gray-700"
          >
            <Filter size={18} />
            Filter
          </Button>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="all">All Types</option>
            <option value="art">Art</option>
            <option value="watches">Watches</option>
            <option value="jewelry">Jewelry</option>
            <option value="real-estate">Real Estate</option>
            <option value="collectibles">Collectibles</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden"
            >
              <div className="aspect-video relative">
                <img 
                  src={asset.imageUrl} 
                  alt={asset.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.status === 'validated' ? 'bg-green-100 text-green-700' :
                    asset.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{asset.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{asset.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(asset.value)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}