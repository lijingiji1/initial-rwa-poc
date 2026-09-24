import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  iconOnly?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ iconOnly = false }) => {
  // Animation variants for individual letters
  const letterVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  // Animation variants for the "venue" text
  const venueVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Animation variants for the underline
  const underlineVariants = {
    hidden: { width: '0%' },
    visible: {
      width: '100%',
      transition: {
        delay: 0.8,
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
  };

  // Split "RWA" into individual letters for animation
  const rwaLetters = 'RWA-b'.split('');

  return (
    <div className="flex items-center">
      <div className="relative flex items-baseline">
        {/* RWA Letters with Orange Gradient */}
        {rwaLetters.map((letter, index) => (
          <motion.span
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={letterVariants}
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
          >
            {letter}
          </motion.span>
        ))}
        {/* Underline Animation */}
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-orange-500"
          initial="hidden"
          animate="visible"
          variants={underlineVariants}
        />
      </div>

      {!iconOnly && (
        <motion.span
          initial="hidden"
          animate="visible"
          variants={venueVariants}
          className="ml-1 text-2xl font-light text-gray-600"
        >
          
        </motion.span>
      )}
    </div>
  );
};