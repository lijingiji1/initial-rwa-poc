import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuthStore } from '@/store/authStore';
import { AnimatedLogo } from './AnimatedLogo';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Handle escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  // Handle Web3 wallet connection
  const handleWeb3Connect = async () => {
    clearError();
    const ok = await connectWallet();
    if (ok) {
      onClose();
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative w-full max-w-[456px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>

                  {/* Header */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-[180px]" aria-hidden="true">
                      <AnimatedLogo />
                    </div>
                    <h2
                      id="modal-title"
                      className="text-[28px] font-bold text-blue-700"
                    >
                      Connect Wallet
                    </h2>
                    <p className="text-base text-neutral-600">
                      Connect your wallet to access the platform
                    </p>
                  </div>

                  {/* Form Content */}
                  <div className="mt-8 space-y-5">
                    <Button
                      fullWidth
                      disabled={loading}
                      icon={<Wallet size={16} />}
                      iconPosition="left"
                      onClick={handleWeb3Connect}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      {loading ? 'Connecting...' : 'Continue with Wallet'}
                    </Button>
                    {error && (
                      <div
                        className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-center justify-between"
                        role="alert"
                      >
                        <span>{error}</span>
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            handleWeb3Connect();
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};