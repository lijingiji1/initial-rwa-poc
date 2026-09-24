import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package, Layers, Shield, Home, Settings, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AnimatedLogo } from '../AnimatedLogo';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, loading, error, isAuthenticated } = useAuthStore();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Asset Explorer', path: '/explorer', icon: Package },
    { name: 'Asset Creation', path: '/asset-creation', icon: Layers },
    { name: 'Validator Hub', path: '/validators', icon: Shield },
    { name: 'My Assets', path: '/my-assets', icon: Package },
    { name: 'Profile', path: '/profile', icon: User },
    // { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItemVariants = {
    hover: { scale: 1.05, x: 5, transition: { duration: 0.2 } },
    active: { scale: 1, x: 0 },
  };

  const handleLogout = async () => {
    try {
      setLogoutError(null);
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setLogoutError(error || 'Failed to log out. Please try again.');
    }
  };

  useEffect(() => {
    console.log('Current path:', location.pathname);
    console.log('Sidebar collapsed state:', isCollapsed);
  }, [location.pathname, isCollapsed]);

  return (
    <motion.div
      className="h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-sm flex flex-col"
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 min-w-0">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <AnimatedLogo />
            </motion.div>
          ) : (
            <motion.div
              key="icon-only"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <AnimatedLogo iconOnly />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              variants={navItemVariants}
              whileHover="hover"
              animate={location.pathname === item.path ? 'active' : ''}
              className="group"
            >
              <Link
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center' : 'space-x-4'
                } ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <item.icon size={22} className="shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      {isAuthenticated && (
        <div className="p-3 border-t border-gray-200">
          {logoutError && (
            <div className="mb-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md">
              {logoutError}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={loading}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isCollapsed ? 'justify-center' : 'space-x-4'
            } ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
            } group`}
          >
            <LogOut size={22} className="shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {loading ? 'Logging out...' : 'Logout'}
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {loading ? 'Logging out...' : 'Logout'}
              </div>
            )}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};