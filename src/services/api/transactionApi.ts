import { Transaction, PaymentMethod } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Transaction API service
export const transactionApi = {
  // Process asset purchase
  processPurchase: async ({
    assetId,
    buyerId,
    paymentMethod,
    amount,
  }: {
    assetId: string;
    buyerId: string;
    paymentMethod: PaymentMethod;
    amount: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/transactions/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetId,
        buyerId,
        paymentMethod,
        amount,
      }),
    });
    return handleResponse(response);
  },

  // Process bid placement
  processBid: async ({
    assetId,
    bidderId,
    bidAmount,
    autoBidLimit,
  }: {
    assetId: string;
    bidderId: string;
    bidAmount: number;
    autoBidLimit?: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/transactions/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetId,
        bidderId,
        bidAmount,
        autoBidLimit,
      }),
    });
    return handleResponse(response);
  },

  // Get transaction history
  getTransactionHistory: async (params?: {
    userId?: string;
    assetId?: string;
    type?: 'purchase' | 'bid' | 'all';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/transactions/history?${queryParams}`);
    return handleResponse(response);
  },

  // Get transaction details
  getTransactionDetails: async (transactionId: string) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`);
    return handleResponse(response);
  },

  // Process refund
  processRefund: async ({
    transactionId,
    reason,
    amount,
  }: {
    transactionId: string;
    reason: string;
    amount: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason,
        amount,
      }),
    });
    return handleResponse(response);
  },

  // Get payment methods
  getPaymentMethods: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods`);
    return handleResponse(response);
  },

  // Add payment method
  addPaymentMethod: async (userId: string, paymentMethod: {
    type: 'crypto' | 'card';
    details: any;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethod),
    });
    return handleResponse(response);
  },

  // Remove payment method
  removePaymentMethod: async (userId: string, paymentMethodId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/payment-methods/${paymentMethodId}`,
      {
        method: 'DELETE',
      }
    );
    return handleResponse(response);
  },

  // Get transaction statistics
  getTransactionStats: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/transaction-stats`);
    return handleResponse(response);
  },
};