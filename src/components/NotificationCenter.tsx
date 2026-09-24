import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { useNotificationStore, NotificationType } from '@/store/notificationStore';
import { Button } from './ui/Button';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <Check className="text-success-500" size={16} />;
      case 'error':
        return <X className="text-error-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-secondary-500" size={16} />;
      default:
        return <Info className="text-primary-500" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-primary-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50"
            >
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                        !notification.read ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-white rounded-full shadow-sm">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          {notification.title && (
                            <p className="font-medium text-sm">{notification.title}</p>
                          )}
                          <p className="text-sm text-neutral-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};