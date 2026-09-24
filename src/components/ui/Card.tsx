import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  interactive = false,
}: CardProps) => {
  const interactiveClass = interactive ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`card ${interactiveClass} ${className}`}
      onClick={onClick}
      whileHover={interactive ? { y: -5 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};