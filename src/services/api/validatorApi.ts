import { Validator } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Validator API service
export const validatorApi = {
  // Get all validators
  getValidators: async (params?: {
    expertise?: string;
    searchTerm?: string;
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

    const response = await fetch(`${API_BASE_URL}/validators?${queryParams}`);
    return handleResponse(response);
  },

  // Get validator by ID
  getValidatorById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/validators/${id}`);
    return handleResponse(response);
  },

  // Get validator's verification history
  getValidatorHistory: async (validatorId: string) => {
    const response = await fetch(`${API_BASE_URL}/validators/${validatorId}/history`);
    return handleResponse(response);
  },

  // Submit validation request
  submitValidationRequest: async (assetId: string, validatorId: string, details: {
    requestType: 'authenticity' | 'condition' | 'value';
    description: string;
    attachments?: string[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/validation-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetId,
        validatorId,
        ...details,
      }),
    });
    return handleResponse(response);
  },

  // Get validation request status
  getValidationRequestStatus: async (requestId: string) => {
    const response = await fetch(`${API_BASE_URL}/validation-requests/${requestId}`);
    return handleResponse(response);
  },

  // Update validation request
  updateValidationRequest: async (requestId: string, status: 'approved' | 'rejected', details?: {
    comments?: string;
    validationCertificate?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/validation-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        ...details,
      }),
    });
    return handleResponse(response);
  },

  // Get validator reviews
  getValidatorReviews: async (validatorId: string) => {
    const response = await fetch(`${API_BASE_URL}/validators/${validatorId}/reviews`);
    return handleResponse(response);
  },

  // Submit validator review
  submitValidatorReview: async (validatorId: string, review: {
    rating: number;
    comment: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/validators/${validatorId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });
    return handleResponse(response);
  },

  // Get validator expertise categories
  getExpertiseCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/validators/expertise-categories`);
    return handleResponse(response);
  },

  // Apply to become a validator
  applyAsValidator: async (application: {
    name: string;
    expertise: string[];
    credentials: string[];
    experience: string;
    documents: string[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/validators/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });
    return handleResponse(response);
  },
};