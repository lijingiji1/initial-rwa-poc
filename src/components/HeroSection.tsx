import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

const assetSlides = [
  {
    image: 'https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg',
    title: "Rare Timepieces",
    caption: "Luxury watches authenticated and tokenized for secure trading"
  },
  {
    image: 'https://images.pexels.com/photos/20967/pexels-photo.jpg',
    title: "Fine Art",
    caption: "Exclusive artwork with verified provenance and ownership"
  },
  {
    image: 'https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg',
    title: "Premium Collectibles",
    caption: "One-of-a-kind items with transparent valuation"
  },
  {
    image: 'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg',
    title: "Vintage Collectibles",
    caption: "Authenticated historic items with blockchain certification"
  }
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Reset autoplay when manually changing slides
  useEffect(() => {
    if (!isAutoPlaying) {
      const timer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % assetSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrevSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + assetSlides.length) % assetSlides.length);
  }, []);

  const handleNextSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % assetSlides.length);
  }, []);

  const handleDotClick = useCallback((index) => {
    setIsAutoPlaying(false);
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  // Animation variants - pure professional slide effect with proper timing
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      zIndex: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
      transition: {
        x: { type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.35, ease: 'easeInOut' }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-30%' : '30%',
      opacity: 0,
      zIndex: 0,
      transition: {
        x: { type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] },
        opacity: { duration: 0.35, ease: 'easeOut' }
      }
    })
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-100 to-white py-20 md:py-32">
      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-800 leading-tight">
              Tokenize and Trade Real-World Assets On-Chain
            </h1>
            <p className="mt-4 text-lg text-neutral-600 md:pr-12">
              Buy, sell, auction, or lend luxury watches, art, and collectibles with full transparency and control, validated by trusted experts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="font-medium"
                icon={<ArrowRight />}
                iconPosition="right"
              >
                Explore Marketplace
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="font-medium"
              >
                Learn How to Tokenize
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden shadow-xl aspect-square max-w-lg mx-auto md:mx-0 rounded-lg">
              {/* Image carousel */}
              <div className="relative h-full w-full overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="sync">
                  <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <div className="relative w-full h-full bg-gradient-to-tr from-blue-50 to-white">
                      <img 
                        src={assetSlides[currentSlide].image}
                        alt={assetSlides[currentSlide].title}
                        className="w-full h-full object-contain p-4"
                      />
                      
                      {/* Caption overlay - positioned like in the reference image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-blue-100/70 to-transparent backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-1 text-blue-900">{assetSlides[currentSlide].title}</h3>
                        <p className="text-sm text-blue-800/90">{assetSlides[currentSlide].caption}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation arrows - styled like in the reference image */}
              <button 
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-500 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-20 transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              
              <button 
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-500 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-20 transition-all"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>

              {/* Indicators at bottom center - styled like in reference image */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {assetSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Background decoration elements */}
            <motion.div 
              className="absolute -bottom-8 -right-8 md:-right-12 w-32 h-32 md:w-40 md:h-40 bg-secondary-500 rounded-full z-[-1]"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            
            <motion.div 
              className="absolute -top-8 -left-8 md:-left-12 w-24 h-24 md:w-32 md:h-32 bg-primary-800/30 rounded-full z-[-1]"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 6,
                delay: 1,
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};