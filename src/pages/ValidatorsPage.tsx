import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ValidatorCard } from '../components/ValidatorCard';
import { Button } from '../components/ui/Button';
import { useValidatorStore } from '../store/validatorStore';
import { AssetCategory } from '../types';
import { toast } from '@/hooks/use-toast';

const ValidatorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<AssetCategory | 'all'>('all');
  const { validators, loading, error, fetchValidators } = useValidatorStore();

  useEffect(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
      expertise: selectedExpertise === 'all' ? undefined : selectedExpertise
    };
    fetchValidators(filters);
  }, [searchTerm, selectedExpertise]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error]);
  
  const expertiseOptions: { value: AssetCategory | 'all', label: string }[] = [
    { value: 'all', label: 'All Expertise' },
    { value: 'watches', label: 'Watches' },
    { value: 'art', label: 'Art' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'jewels', label: 'Jewels' },
    { value: 'real-estate', label: 'Real Estate' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary-800 mb-3">Validator B</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Connect with trusted validators who verify the authenticity and quality of tokenized assets
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search validators"
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="input"
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value as AssetCategory | 'all')}
            >
              {expertiseOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button variant="secondary" className="bg-neutral-100 hover:bg-neutral-200">
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Validators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-white rounded-xl p-6 h-64 animate-pulse"
              />
            ))
          ) : validators.map((validator, index) => (
            <motion.div
              key={validator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <ValidatorCard validator={validator} />
            </motion.div>
          ))}
        </div>
        
        {/* Become a Validator CTA */}
        <div className="bg-primary-800 text-white rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Become a Validator</h2>
              <p className="text-neutral-300 mb-6">
                Join our network of trusted validators and earn rewards for verifying asset authenticity 
                and quality. Validators are a critical part of our ecosystem, ensuring trust and 
                transparency in every transaction.
              </p>
              <Button 
                className="bg-white text-primary-800 hover:bg-neutral-100"
                onClick={async () => {
                  try {
                    const result = await useValidatorStore.getState().submitValidatorApplication({
                      name: '',
                      expertise: [],
                      jurisdiction: '',
                      credentials: [],
                      verificationFee: {
                        amount: 0,
                        currency: 'USD'
                      }
                    });
                    toast({
                      title: 'Application Submitted',
                      description: `Your application (ID: ${result.applicationId}) has been submitted successfully.`,
                    });
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to submit validator application. Please try again.',
                      variant: 'destructive'
                    });
                  }
                }}
              >
                Apply Now
              </Button>
            </div>
            
            <div className="bg-primary-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Validator Requirements</h3>
              <ul className="space-y-3">
                {[
                  'Proven expertise in specific asset categories',
                  'Verifiable credentials or certifications',
                  'Minimum of 2 years experience in asset verification',
                  'Ability to conduct thorough due diligence',
                  'Maintain high standards of integrity and confidentiality'
                ].map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-secondary-500 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorsPage;