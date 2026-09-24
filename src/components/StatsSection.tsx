import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, UserCheck, Clock } from 'lucide-react';

const stats = [
  {
    title: 'Assets Tokenized',
    value: '5,000+',
    icon: TrendingUp,
    description: 'Real-world assets securely tokenized on blockchain',
  },
  {
    title: 'Total Value Locked',
    value: '$250M+',
    icon: Shield,
    description: 'Combined value of all assets in the marketplace',
  },
  {
    title: 'Trusted Validators',
    value: '120+',
    icon: UserCheck,
    description: 'Expert validators ensuring asset authenticity',
  },
  {
    title: 'Average Validation Time',
    value: '48 Hours',
    icon: Clock,
    description: 'Fast and thorough validation process',
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-800">
            Trusted Platform for Real-World Assets
          </h2>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Our decentralized marketplace provides a secure environment for tokenizing and trading valuable assets with complete transparency.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-neutral-50 rounded-xl p-6 shadow-sm border border-neutral-100"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold text-primary-800">{stat.value}</h3>
              </div>
              <h4 className="font-medium text-neutral-800 mb-2">{stat.title}</h4>
              <p className="text-sm text-neutral-600">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};