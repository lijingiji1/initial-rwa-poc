import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Mail, Key, Bell, Shield, Wallet, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading, connectWallet, disconnectWallet } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [copySuccess, setCopySuccess] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name });
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const ok = await connectWallet();
      if (ok) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleCopyAddress = async () => {
    if (user?.wallet?.address) {
      try {
        await navigator.clipboard.writeText(user.wallet.address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-800 shadow-sm'
                  : 'text-neutral-600 hover:text-primary-800'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200"
        >
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex items-start space-x-6 pb-6 border-b border-neutral-200">
                <div className="relative">
                  <img
                    src={user?.avatar_url || 'https://via.placeholder.com/100'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-neutral-500">{user?.email}</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="input pl-10 bg-neutral-50"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    Contact support to change your email address.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        className="input pl-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        className="input pl-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        className="input pl-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Update Password</Button>
                  </div>
                </form>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <p className="text-neutral-600 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  'New asset listings',
                  'Price changes',
                  'Auction updates',
                  'Validation status',
                  'Security alerts',
                  'Newsletter and updates'
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{item}</p>
                      <p className="text-sm text-neutral-500">
                        Receive notifications about {item.toLowerCase()}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Connected Wallets</h3>
              <div className="space-y-4">
                {user?.wallet?.isConnected ? (
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-full">
                        <Wallet className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <p className="text-sm text-neutral-500">
                          {user?.wallet?.address
                            ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectWallet}
                        disabled={loading}
                      >
                        {loading ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAddress}
                        disabled={loading || !user?.wallet?.address}
                        className="flex items-center gap-1"
                      >
                        <Copy size={16} />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-full">
                        <Wallet className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <p className="text-sm text-neutral-500">Not connected</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConnectWallet}
                      disabled={loading}
                    >
                      {loading ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}