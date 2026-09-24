import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedLogo } from '../AnimatedLogo';
import { Wallet, Twitter, Instagram, Github, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '../AuthModal'; // Assuming AuthModal is implemented

export const Footer = () => {
  const { isAuthenticated } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Tokenize', path: '/tokenize' },
    { name: 'Validators', path: '/validators' },
    { name: 'Explorer', path: '/explorer' }
  ];

 
 const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <footer className="bg-primary-800 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <Link to="/" className="flex items-center">
              <AnimatedLogo />
            </Link>
            <p className="mt-4 text-neutral-300 text-sm">
              The premier decentralized marketplace for tokenizing and trading real-world assets with full transparency and control.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`text-white hover:text-white transition-colors text-sm ${
                      !isAuthenticated &&
                      [ '/tokenize', '/validators'].includes(item.path)
                        ? 'text-white'
                        : ''
                    }`}
                    onClick={(e) => {
                      if (
                        !isAuthenticated &&
                        ['/tokenize', '/validators','/explorer'].includes(item.path)
                      ) {
                        e.preventDefault();
                        handleOpenAuthModal();
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Newsletter</h3>
            <p className="text-neutral-300 text-sm mb-3">
              Subscribe to receive updates about new features and assets.
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email for newsletter"
                className="px-3 py-2 rounded-l-lg text-neutral-800 text-sm flex-1"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="bg-secondary-500 rounded-r-lg px-3 hover:bg-secondary-600 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} RWA-B Marketplace. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            {[
              { Icon: Twitter, url: '', label: 'Twitter' },
              { Icon: Instagram, url: '', label: 'Instagram' },
              { Icon: Github, url: '', label: 'GitHub' },
            ].map(({ Icon, url, label }, i) => (
              <a
                key={i}
                href={url}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} />
    </footer>
  );
};