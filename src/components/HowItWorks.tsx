import React from 'react';
import { motion } from 'framer-motion';
import { Package, Search, ShieldCheck, Repeat } from 'lucide-react';

const steps = [
  {
    title: 'Tokenize Your Asset',
    description: 'Upload documentation and images of your real-world asset to start the tokenization process.',
    icon: Package,
    color: 'bg-blue-500',
  },
  {
    title: 'Get Validated',
    description: 'Our trusted validators verify your asset\'s authenticity and create a digital representation.',
    icon: ShieldCheck,
    color: 'bg-green-500',
  },
  {
    title: 'List on Marketplace',
    description: 'Choose your preferred method: fixed price, auction, swap, or lending terms.',
    icon: Search,
    color: 'bg-purple-500',
  },
  {
    title: 'Trade Securely',
    description: 'Buy, sell, or trade your tokenized assets with full transparency and control.',
    icon: Repeat,
    color: 'bg-secondary-500',
  },
];

export const HowItWorks = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-800">How It Works</h2>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Our platform simplifies the process of tokenizing and trading real-world assets
            with security and transparency at every step.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={step.title} 
              className="flex flex-col items-center text-center"
              variants={item}
            >
              <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 relative`}>
                <step.icon size={28} />
                <div className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                  <span className="text-primary-800 font-bold">{index + 1}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-primary-800 mb-3">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting lines between steps (desktop only) */}
        <div className="hidden lg:block relative h-1 w-3/4 mx-auto" style={{ marginTop: "-128px", zIndex: -1 }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-200"></div>
        </div>
      </div>
    </section>
  );
};