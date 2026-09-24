import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8 mt-16">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800">Community</h1>
          <p className="text-neutral-600 mt-2">
            Connect with other asset owners and enthusiasts
          </p>
        </div>

        {/* Featured Community Section */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary-800">Join Our Growing Community</h2>
            <p className="mt-3 text-neutral-600 max-w-2xl mx-auto">
              Connect with thousands of asset owners, validators, and enthusiasts from around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-primary-50 p-6 rounded-lg text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">10,000+</h3>
              <p className="text-neutral-600">Active Members</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-secondary-50 p-6 rounded-lg text-center"
            >
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Daily Discussions</h3>
              <p className="text-neutral-600">On asset tokenization</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-neutral-100 p-6 rounded-lg text-center"
            >
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Global Network</h3>
              <p className="text-neutral-600">Across 50+ countries</p>
            </motion.div>
          </div>

          <div className="text-center">
            <Button size="lg">Join Discord Community</Button>
          </div>
        </section>


        {/* Community Forum Preview */}
        <section>
          <h2 className="text-2xl font-bold text-primary-800 mb-6">Latest Discussions</h2>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-neutral-200 p-4 flex justify-between items-center">
              <h3 className="font-medium">Community Forum</h3>
              <Button variant="secondary" size="sm">View All</Button>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {[
                {
                  title: 'Best practices for watch authentication',
                  author: 'WatchCollector',
                  replies: 24,
                  time: '2 hours ago'
                },
                {
                  title: 'How to evaluate real estate for tokenization',
                  author: 'PropertyPro',
                  replies: 18,
                  time: '1 day ago'
                },
                {
                  title: 'Validator requirements discussion',
                  author: 'ValidatorExpert',
                  replies: 32,
                  time: '3 days ago'
                }
              ].map((topic, index) => (
                <div key={index} className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                  <div className="font-medium text-primary-700">{topic.title}</div>
                  <div className="flex justify-between mt-2 text-sm text-neutral-500">
                    <span>By {topic.author}</span>
                    <div>
                      <span className="mr-4">{topic.replies} replies</span>
                      <span>{topic.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}