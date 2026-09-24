import axios from 'axios';
import { create } from 'ipfs-http-client';

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const INFURA_PROJECT_SECRET = process.env.REACT_APP_INFURA_PROJECT_SECRET;
const INFURA_IPFS_ENDPOINT = 'https://ipfs.infura.io:5001';

// Initialize IPFS client with Infura
const auth = 'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export interface IPFSUploadResult {
  cid: string;
  path: string;
  size: number;
  url: string;
}

const ipfsService = {
  // Upload a single file to IPFS
  uploadFile: async (file: File): Promise<IPFSUploadResult> => {
    try {
      const data = await file.arrayBuffer();
      const result = await client.add(Buffer.from(data));

      return {
        cid: result.cid.toString(),
        path: result.path,
        size: result.size,
        url: `https://ipfs.io/ipfs/${result.path}`
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  },

  // Upload multiple files to IPFS
  uploadFiles: async (files: File[]): Promise<IPFSUploadResult[]> => {
    try {
      const uploadPromises = files.map(file => ipfsService.uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('IPFS bulk upload error:', error);
      throw new Error('Failed to upload files to IPFS');
    }
  },

  // Upload metadata JSON to IPFS
  uploadMetadata: async (metadata: any): Promise<IPFSUploadResult> => {
    try {
      const data = JSON.stringify(metadata);
      const result = await client.add(data);

      return {
        cid: result.cid.toString(),
        path: result.path,
        size: result.size,
        url: `https://ipfs.io/ipfs/${result.path}`
      };
    } catch (error) {
      console.error('IPFS metadata upload error:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  },

  // Get content from IPFS
  getFromIPFS: async (cid: string): Promise<any> => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${cid}`);
      return response.data;
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw new Error('Failed to fetch content from IPFS');
    }
  }
};

export default ipfsService;