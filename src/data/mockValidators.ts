import { Validator } from '@/services/validatorService';
import { AssetCategory } from '@/types';

export const mockValidators: Validator[] = [
  {
    id: '1',
    name: 'John Anderson',
    expertise: ['watches', 'jewelry'],
    jurisdiction: 'United States',
    validationCount: 156,
    reputation: 4.8,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    verificationFee: {
      amount: 500,
      currency: 'USD'
    },
    availability: true,
    responseTime: '24-48 hours'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    expertise: ['art', 'collectibles'],
    jurisdiction: 'Singapore',
    validationCount: 243,
    reputation: 4.9,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    verificationFee: {
      amount: 750,
      currency: 'USD'
    },
    availability: true,
    responseTime: '24 hours'
  },
  {
    id: '3',
    name: 'Michael Roberts',
    expertise: ['real-estate'],
    jurisdiction: 'United Kingdom',
    validationCount: 89,
    reputation: 4.7,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    verificationFee: {
      amount: 1200,
      currency: 'USD'
    },
    availability: true,
    responseTime: '48-72 hours'
  },
  {
    id: '4',
    name: 'Emily Thompson',
    expertise: ['jewelry', 'art'],
    jurisdiction: 'Canada',
    validationCount: 167,
    reputation: 4.9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    verificationFee: {
      amount: 600,
      currency: 'USD'
    },
    availability: false,
    responseTime: '24-48 hours'
  },
  {
    id: '5',
    name: 'David Kim',
    expertise: ['watches', 'collectibles'],
    jurisdiction: 'South Korea',
    validationCount: 198,
    reputation: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    verificationFee: {
      amount: 550,
      currency: 'USD'
    },
    availability: true,
    responseTime: '24 hours'
  },
  {
    id: '6',
    name: 'Maria Garcia',
    expertise: ['art', 'collectibles', 'jewelry'],
    jurisdiction: 'Spain',
    validationCount: 134,
    reputation: 4.7,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
    verificationFee: {
      amount: 650,
      currency: 'USD'
    },
    availability: true,
    responseTime: '24-48 hours'
  }
];