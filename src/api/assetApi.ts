import axios from 'axios';
import { FormData } from '@/pages/tokenize/TokenizePage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export interface IPFSResponse {
  hash: string;
  url: string;
}

export interface AssetCreationResponse {
  id: string;
  tokenId: string;
  ipfsHash: string;
  status: 'pending' | 'validated' | 'rejected';
  createdAt: string;
}

export interface ValidationResponse {
  validationId: string;
  status: 'pending' | 'completed' | 'rejected';
  validatorId: string;
  comments?: string;
  timestamp: string;
}

const assetApi = {
  // Upload files to IPFS
  uploadToIPFS: async (files: File[]): Promise<IPFSResponse[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(`${API_BASE_URL}/ipfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Create a new asset with metadata
  createAsset: async (assetData: FormData): Promise<AssetCreationResponse> => {
    // First upload images and documents to IPFS
    const [imageResults, documentResults] = await Promise.all([
      assetApi.uploadToIPFS(assetData.images),
      assetApi.uploadToIPFS(assetData.documents)
    ]);

    // Prepare metadata for asset creation
    const metadata = {
      ...assetData,
      images: imageResults.map(r => r.url),
      documents: documentResults.map(r => r.url),
      ipfsHashes: {
        images: imageResults.map(r => r.hash),
        documents: documentResults.map(r => r.hash)
      }
    };

    const response = await axios.post(`${API_BASE_URL}/assets`, metadata);
    return response.data;
  },

  // Get asset details
  getAsset: async (assetId: string) => {
    const response = await axios.get(`${API_BASE_URL}/assets/${assetId}`);
    return response.data;
  },

  // Get validation status
  getValidationStatus: async (assetId: string): Promise<ValidationResponse> => {
    const response = await axios.get(`${API_BASE_URL}/assets/${assetId}/validation`);
    return response.data;
  },

  // Update asset metadata
  updateAsset: async (assetId: string, updateData: Partial<FormData>) => {
    const response = await axios.patch(`${API_BASE_URL}/assets/${assetId}`, updateData);
    return response.data;
  },

  // Request validation from a specific validator
  requestValidation: async (assetId: string, validatorId: string) => {
    const response = await axios.post(`${API_BASE_URL}/assets/${assetId}/validation-requests`, {
      validatorId
    });
    return response.data;
  },

  // Get list of validators for an asset category
  getValidators: async (category: string) => {
    const response = await axios.get(`${API_BASE_URL}/validators`, {
      params: { category }
    });
    return response.data;
  }
};

export default assetApi;