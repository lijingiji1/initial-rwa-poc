import { create } from 'zustand';
import { validatorService, Validator, ValidatorFilters, ValidationRequest } from '@/services/validatorService';

interface ValidatorStore {
  validators: Validator[];
  loading: boolean;
  error: string | null;
  selectedValidator: Validator | null;
  validationRequests: ValidationRequest[];
  
  // Actions
  fetchValidators: (filters?: ValidatorFilters) => Promise<void>;
  getValidatorById: (id: string) => Promise<void>;
  submitValidatorApplication: (applicationData: any) => Promise<{ applicationId: string; status: string }>;
  submitValidationRequest: (data: {
    assetId: string;
    validatorId: string;
    assetType: string;
    additionalNotes?: string;
  }) => Promise<void>;
  fetchValidationRequests: (validatorId: string) => Promise<void>;
  clearError: () => void;
}

export const useValidatorStore = create<ValidatorStore>((set, get) => ({
  validators: [],
  loading: false,
  error: null,
  selectedValidator: null,
  validationRequests: [],

  fetchValidators: async (filters?: ValidatorFilters) => {
    try {
      set({ loading: true, error: null });
      const validators = await validatorService.getValidators(filters);
      set({ validators, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch validators',
        loading: false
      });
    }
  },

  getValidatorById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const validator = await validatorService.getValidatorById(id);
      set({ selectedValidator: validator, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch validator details',
        loading: false
      });
    }
  },

  submitValidatorApplication: async (applicationData) => {
    try {
      set({ loading: true, error: null });
      const result = await validatorService.submitValidatorApplication(applicationData);
      set({ loading: false });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit validator application',
        loading: false
      });
      throw error;
    }
  },

  submitValidationRequest: async (data) => {
    try {
      set({ loading: true, error: null });
      await validatorService.submitValidationRequest(data);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit validation request',
        loading: false
      });
      throw error;
    }
  },

  fetchValidationRequests: async (validatorId: string) => {
    try {
      set({ loading: true, error: null });
      const requests = await validatorService.getValidatorHistory(validatorId);
      set({ validationRequests: requests, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch validation requests',
        loading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));