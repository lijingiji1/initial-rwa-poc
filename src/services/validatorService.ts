import axios from 'axios';
import { AssetCategory } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

export interface ValidatorFilters {
  expertise?: AssetCategory;
  jurisdiction?: string;
  availability?: boolean;
  searchTerm?: string;
}

export const validatorService = {
  // Get all validators with optional filters
  getValidators: async (filters?: ValidatorFilters): Promise<Validator[]> => {
    const response = await axios.get(`${API_BASE_URL}/validators`, {
      params: filters
    });
    return response.data;
  },

  // Get validator details by ID
  getValidatorById: async (validatorId: string): Promise<Validator> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}`);
    return response.data;
  },

  // Submit validator application
  submitValidatorApplication: async (applicationData: {
    name: string;
    expertise: AssetCategory[];
    jurisdiction: string;
    credentials: {
      type: string;
      documentUrl: string;
    }[];
    verificationFee: {
      amount: number;
      currency: string;
    };
  }): Promise<{ applicationId: string; status: string }> => {
    const response = await axios.post(`${API_BASE_URL}/validators/apply`, applicationData);
    return response.data;
  },

  // Get validator application status
  getApplicationStatus: async (applicationId: string): Promise<{
    status: string;
    feedback?: string;
    nextSteps?: string[];
  }> => {
    const response = await axios.get(`${API_BASE_URL}/validators/applications/${applicationId}`);
    return response.data;
  },

  // Submit validation request
  submitValidationRequest: async (data: {
    assetId: string;
    validatorId: string;
    assetType: AssetCategory;
    additionalNotes?: string;
  }): Promise<ValidationRequest> => {
    const response = await axios.post(`${API_BASE_URL}/validation-requests`, data);
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

  // Update validator profile
  updateValidatorProfile: async (validatorId: string, updateData: Partial<Validator>): Promise<Validator> => {
    const response = await axios.patch(`${API_BASE_URL}/validators/${validatorId}`, updateData);
    return response.data;
  },

  // Get validator availability schedule
  getValidatorAvailability: async (validatorId: string): Promise<{
    available: boolean;
    nextAvailableSlot?: string;
    schedule?: {
      date: string;
      slots: {
        time: string;
        available: boolean;
      }[];
    }[];
  }> => {
    const response = await axios.get(`${API_BASE_URL}/validators/${validatorId}/availability`);
    return response.data;
  },

  // Get validation fee estimate
  getValidationFeeEstimate: async (data: {
    validatorId: string;
    assetCategory: AssetCategory;
    assetValue?: number;
  }): Promise<{
    fee: {
      amount: number;
      currency: string;
    };
    estimatedTime: string;
    additionalRequirements?: string[];
  }> => {
    const response = await axios.post(`${API_BASE_URL}/validators/${data.validatorId}/fee-estimate`, data);
    return response.data;
  }
};