import axios from 'axios';
import { AssetCategory } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000s/api';

export interface Validator {
  id: string;
  name: string;
  expertise: AssetCategory[];
  jurisdiction: string;
  validationCount: number;
  reputation: number;
  avatar: string;
  verificationFee: {
    amount: number;
    currency: string;
  };
  availability: boolean;
  responseTime: string;
}

export interface ValidationRequest {
  id: string;
  assetId: string;
  validatorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestedAt: string;
  completedAt?: string;
  comments?: string;
}

const validatorApi = {
  // Get all validators
  getAllValidators: async (): Promise<Validator[]> => {
    const response = await axios.get(`${API_BASE_URL}/validators`);
    return response.data;
  },

  // Get validators by category
  getValidatorsByCategory: async (category: AssetCategory): Promise<Validator[]> => {
    const response = await axios.get(`${API_BASE_URL}/validators`, {
      params: { category }
    });
    return response.data;
  },

  // Get validator details
  getValidatorDetails: async (validatorId: string): Promise<Validator> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}`);
    return response.data;
  },

  // Submit validation request
  submitValidationRequest: async (assetId: string, validatorId: string): Promise<ValidationRequest> => {
    const response = await axios.post(`${API_BASE_URL}/validation-requests`, {
      assetId,
      validatorId
    });
    return response.data;
  },

  // Get validation request status
  getValidationRequestStatus: async (requestId: string): Promise<ValidationRequest> => {
    const response = await axios.get(`${API_BASE_URL}/validation-requests/${requestId}`);
    return response.data;
  },

  // Get validator's validation history
  getValidatorHistory: async (validatorId: string): Promise<ValidationRequest[]> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}/history`);
    return response.data;
  },

  // Update validation request
  updateValidationRequest: async (
    requestId: string,
    updateData: Partial<ValidationRequest>
  ): Promise<ValidationRequest> => {
    const response = await axios.patch(
      `${API_BASE_URL}/validation-requests/${requestId}`,
      updateData
    );
    return response.data;
  },

  // Get validator availability
  getValidatorAvailability: async (validatorId: string): Promise<{
    available: boolean;
    nextAvailableSlot?: string;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}/availability`);
    return response.data;
  },

  // Get validator fees
  getValidatorFees: async (validatorId: string, assetCategory: AssetCategory): Promise<{
    amount: number;
    currency: string;
    estimatedTime: string;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}/fees`, {
      params: { category: assetCategory }
    });
    return response.data;
  }
};

export default validatorApi;