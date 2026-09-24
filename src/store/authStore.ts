import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

const PHAROS_DEVNET_CHAIN_ID = 50002;
const PHAROS_DEVNET_HEX_CHAIN_ID = ethers.utils.hexValue(PHAROS_DEVNET_CHAIN_ID);
const PHAROS_NETWORK_CONFIG = {
  chainId: PHAROS_DEVNET_HEX_CHAIN_ID,
  chainName: 'Pharos Devnet',
  rpcUrls: ['https://devnet.dplabs-internal.com'],
  nativeCurrency: { name: 'Pharos', symbol: 'PHAROS', decimals: 18 },
  blockExplorerUrls: ['https://pharosscan.xyz'],
};

let accountsChangedHandler: ((accounts: string[]) => Promise<void>) | null = null;
let chainChangedHandler: ((chainId: string) => Promise<void>) | null = null;
let activeEthereumProvider: any = null;

/** Prefer MetaMask / a single provider when multiple wallets inject (reduces extension messaging errors). */
const getEip1193Provider = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const win = window as any;
  const e = win.ethereum;
  if (!e) {
    return null;
  }
  if (Array.isArray(e.providers) && e.providers.length > 0) {
    const withRequest = (p: any) => typeof p?.request === 'function';
    return (
      e.providers.find((p: any) => p.isMetaMask && withRequest(p)) ||
      e.providers.find((p: any) => p.isOkxWallet && withRequest(p)) ||
      e.providers.find((p: any) => p.isRabby && withRequest(p)) ||
      e.providers.find(withRequest) ||
      e.providers[0]
    );
  }
  return e;
};

const getEthereum = () => getEip1193Provider();

const getNormalizedError = (error: unknown): { code?: number; message: string } => {
  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { code?: number; message?: string };
    return {
      code: maybeError.code,
      message: maybeError.message ?? 'Unknown wallet error',
    };
  }

  return { message: 'Unknown wallet error' };
};

const requestWithTimeout = async <T>(
  ethereum: any,
  method: string,
  params?: any[],
  timeoutMs = 25000
): Promise<T> => {
  if (!ethereum || typeof ethereum.request !== 'function') {
    throw new Error('Wallet provider is not available. Please refresh the page and try again.');
  }

  const requestPromise = ethereum.request(
    params ? { method, params } : { method }
  ) as Promise<T>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    const timerId = window.setTimeout(() => {
      window.clearTimeout(timerId);
      reject(new Error(`Wallet request timed out: ${method}`));
    }, timeoutMs);
  });

  return Promise.race([requestPromise, timeoutPromise]);
};

const ensurePharosNetwork = async (ethereum: any): Promise<void> => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  let network: ethers.providers.Network;
  try {
    network = await provider.getNetwork();
  } catch {
    network = { chainId: 0, name: 'unknown' } as ethers.providers.Network;
  }

  if (Number(network.chainId) === PHAROS_DEVNET_CHAIN_ID) {
    return;
  }

  try {
    await requestWithTimeout<void>(
      ethereum,
      'wallet_switchEthereumChain',
      [{ chainId: PHAROS_DEVNET_HEX_CHAIN_ID }],
      20000
    );
  } catch (switchError) {
    const { code } = getNormalizedError(switchError);
    if (code !== 4902) {
      throw switchError;
    }

    await requestWithTimeout<void>(
      ethereum,
      'wallet_addEthereumChain',
      [PHAROS_NETWORK_CONFIG],
      20000
    );

    await requestWithTimeout<void>(
      ethereum,
      'wallet_switchEthereumChain',
      [{ chainId: PHAROS_DEVNET_HEX_CHAIN_ID }],
      20000
    );
  }
};

interface KYCData {
  status: 'pending' | 'verified' | 'rejected';
  idVerified: boolean;
  addressVerified: boolean;
  documents: {
    governmentId?: string;
    proofOfAddress?: string;
    additionalDocs?: string[];
  };
  verificationDate?: Date;
}

interface WalletData {
  address: string;
  isConnected: boolean;
  provider?: string;
  chainId?: number;
  balance?: string;
}

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: {
    assetCategories: string[];
    notifications: boolean;
    language: string;
  };
  kyc?: KYCData;
  wallet?: WalletData;
  roles: {
    isBuyer: boolean;
    isSeller: boolean;
  };
  stats: {
    buyerRating?: number;
    sellerRating?: number;
    totalPurchases: number;
    totalSales: number;
  };
  bankAccount?: {
    isVerified: boolean;
    last4: string;
    type: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  submitKYC: (documents: KYCData['documents']) => Promise<void>;
  updateKYCStatus: (status: KYCData['status']) => Promise<void>;
  toggleRole: (role: 'buyer' | 'seller', enabled: boolean) => Promise<void>;
  connectBankAccount: (accountDetails: any) => Promise<void>;
  clearError: () => void; // Added clearError to the interface
}

const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    roles: {
      isBuyer: true,
      isSeller: false,
    },
    stats: {
      totalPurchases: 0,
      totalSales: 0,
    },
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const user = mockUsers.find(
            (u) => u.email === email && u.password === password
          );
          if (!user) {
            throw new Error('Invalid email or password');
          }
          const { password: _, ...userData } = user;
          set({
            isAuthenticated: true,
            user: userData as User,
            loading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newUser = {
            id: crypto.randomUUID(),
            email,
            name,
            roles: {
              isBuyer: true,
              isSeller: false,
            },
            stats: {
              totalPurchases: 0,
              totalSales: 0,
            },
          };
          set({
            isAuthenticated: true,
            user: newUser,
            loading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      logout: async () => {
        try {
          console.log('Starting logout process...');
          set({ loading: true, error: null });
          const currentUser = get().user;
          if (currentUser?.wallet?.isConnected) {
            console.log('Wallet connected, disconnecting...');
            await get().disconnectWallet();
          } else {
            console.log('No wallet connected, clearing state...');
            set({
              isAuthenticated: false,
              user: null,
              error: null,
              loading: false,
            });
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();
            console.log('State cleared, redirecting to /');
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Logout error:', error);
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ loading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      connectWallet: async () => {
        if (get().loading) {
          return false;
        }
        try {
          set({ loading: true, error: null });

          const ethereum = getEthereum();
          if (!ethereum) {
            throw new Error('Please install MetaMask or another Web3 wallet.');
          }
          if (typeof ethereum.request !== 'function') {
            throw new Error('Wallet provider is not available. Please refresh the page and try again.');
          }

          activeEthereumProvider = ethereum;
          const accounts = await requestWithTimeout<string[]>(
            ethereum,
            'eth_requestAccounts',
            undefined,
            25000
          );
          if (!accounts?.length) {
            throw new Error('No account returned from the wallet.');
          }
          const address = accounts[0];

          const provider = new ethers.providers.Web3Provider(ethereum);
          let network = await provider.getNetwork();
          if (Number(network.chainId) !== PHAROS_DEVNET_CHAIN_ID) {
            try {
              await ensurePharosNetwork(ethereum);
              network = await provider.getNetwork();
            } catch {
              // Do not block wallet login when network switching fails in extension/proxy environments.
            }
          }
          const balance = await provider.getBalance(address);
          const formattedBalance = ethers.utils.formatEther(balance);

          const currentUser = get().user;
          const nextUser: User = currentUser
            ? {
                ...currentUser,
                wallet: {
                  address,
                  isConnected: true,
                  provider: 'metamask',
                  chainId: Number(network.chainId),
                  balance: formattedBalance,
                },
              }
            : {
                id: crypto.randomUUID(),
                wallet: {
                  address,
                  isConnected: true,
                  provider: 'metamask',
                  chainId: Number(network.chainId),
                  balance: formattedBalance,
                },
                roles: { isBuyer: true, isSeller: false },
                stats: { totalPurchases: 0, totalSales: 0 },
              };

          if (accountsChangedHandler && activeEthereumProvider) {
            activeEthereumProvider.removeListener('accountsChanged', accountsChangedHandler);
          }
          if (chainChangedHandler && activeEthereumProvider) {
            activeEthereumProvider.removeListener('chainChanged', chainChangedHandler);
          }

          accountsChangedHandler = async (updatedAccounts: string[]) => {
            if (updatedAccounts.length === 0) {
              await get().disconnectWallet();
              return;
            }

            const nextAddress = updatedAccounts[0];
            const e = getEthereum() || activeEthereumProvider;
            const nextProvider = new ethers.providers.Web3Provider(e);
            const nextBalance = await nextProvider.getBalance(nextAddress);
            const nextNetwork = await nextProvider.getNetwork();

            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    wallet: {
                      address: nextAddress,
                      isConnected: true,
                      provider: 'metamask',
                      chainId: Number(nextNetwork.chainId),
                      balance: ethers.utils.formatEther(nextBalance),
                    },
                  }
                : state.user,
            }));
          };

          chainChangedHandler = async (chainIdHex: string) => {
            const parsedChainId = Number.parseInt(chainIdHex, 16);
            if (parsedChainId !== PHAROS_DEVNET_CHAIN_ID) {
              set({
                error: 'Please switch to Pharos Devnet manually.',
              });
              return;
            }

            const connectedAddress = get().user?.wallet?.address;
            if (!connectedAddress) {
              return;
            }

            const e = getEthereum() || activeEthereumProvider;
            const nextProvider = new ethers.providers.Web3Provider(e);
            const nextBalance = await nextProvider.getBalance(connectedAddress);
            set((state) => ({
              error: null,
              user: state.user
                ? {
                    ...state.user,
                    wallet: {
                      ...state.user.wallet!,
                      chainId: parsedChainId,
                      balance: ethers.utils.formatEther(nextBalance),
                    },
                  }
                : state.user,
            }));
          };

          ethereum.on('accountsChanged', accountsChangedHandler);
          ethereum.on('chainChanged', chainChangedHandler);

          const isOnExpectedNetwork = Number(network.chainId) === PHAROS_DEVNET_CHAIN_ID;
          set({
            isAuthenticated: true,
            user: nextUser,
            loading: false,
            error: isOnExpectedNetwork ? null : 'Wallet connected. Please switch to Pharos Devnet to continue transactions.',
          });
          return true;
        } catch (error) {
          const normalized = getNormalizedError(error);
          let errorMessage = 'Failed to connect wallet. Please try again.';
          if (normalized.code === 4001 || normalized.message.toLowerCase().includes('rejected')) {
            errorMessage = 'Wallet connection was rejected.';
          } else if (normalized.message.includes('MetaMask')) {
            errorMessage = 'Please install MetaMask.';
          } else if (normalized.message.toLowerCase().includes('receiving end does not exist')) {
            errorMessage = 'Wallet extension is not responding. Reopen MetaMask and refresh this page.';
          } else if (normalized.message.toLowerCase().includes('timed out')) {
            errorMessage = 'Wallet request timed out. Open your wallet popup and try again.';
          } else if (normalized.message.toLowerCase().includes('switch')) {
            errorMessage = 'Please switch to Pharos Devnet manually.';
          }
          set({ error: errorMessage, loading: false });
          return false;
        }
      },
      
      disconnectWallet: async () => {
        try {
          set({ loading: true, error: null });
          if (activeEthereumProvider) {
            if (accountsChangedHandler) {
              activeEthereumProvider.removeListener('accountsChanged', accountsChangedHandler);
            }
            if (chainChangedHandler) {
              activeEthereumProvider.removeListener('chainChanged', chainChangedHandler);
            }
          }
          accountsChangedHandler = null;
          chainChangedHandler = null;
          activeEthereumProvider = null;
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
          window.location.href = '/';
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      submitKYC: async (documents: KYCData['documents']) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  kyc: {
                    status: 'pending',
                    idVerified: false,
                    addressVerified: false,
                    documents,
                    verificationDate: new Date(),
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      updateKYCStatus: async (status: KYCData['status']) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user && state.user.kyc
              ? {
                  ...state.user,
                  kyc: {
                    ...state.user.kyc,
                    status,
                    idVerified: status === 'verified',
                    addressVerified: status === 'verified',
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      toggleRole: async (role: 'buyer' | 'seller', enabled: boolean) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  roles: {
                    ...state.user.roles,
                    [role === 'buyer' ? 'isBuyer' : 'isSeller']: enabled,
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      connectBankAccount: async (accountDetails: any) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  bankAccount: {
                    isVerified: true,
                    last4: accountDetails.last4,
                    type: accountDetails.type,
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      clearError: () => set({ error: null }), // Implementation of clearError
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.error = null;
        }
      },
    }
  )
);