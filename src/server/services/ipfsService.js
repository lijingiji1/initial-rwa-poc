const { create } = require('ipfs-http-client');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class IPFSService {
  constructor() {
    this.client = null;
    this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/';
    this.apiUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
    this.initializeClient();
  }

  async initializeClient() {
    try {
      // In production, you would connect to a real IPFS node
      // For now, we'll use a mock implementation
      console.log('IPFS Service initialized (mock mode)');
    } catch (error) {
      console.error('Failed to initialize IPFS client:', error);
    }
  }

  // Upload file to IPFS
  async uploadFile(filePath, options = {}) {
    try {
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Process image if it's an image file
      let processedBuffer = fileBuffer;
      if (this.isImageFile(filePath)) {
        processedBuffer = await this.processImage(fileBuffer, options);
      }

      // In a real implementation, you would upload to IPFS here
      // For now, we'll simulate the upload
      const mockHash = this.generateMockHash();
      const mockUrl = `${this.gatewayUrl}${mockHash}`;

      return {
        hash: mockHash,
        url: mockUrl,
        size: processedBuffer.length,
        originalSize: fileBuffer.length
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  // Upload multiple files
  async uploadFiles(filePaths, options = {}) {
    try {
      const uploadPromises = filePaths.map(filePath => 
        this.uploadFile(filePath, options)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading files to IPFS:', error);
      throw new Error('Failed to upload files to IPFS');
    }
  }

  // Upload buffer directly
  async uploadBuffer(buffer, filename, options = {}) {
    try {
      // Process image if it's an image
      let processedBuffer = buffer;
      if (this.isImageFile(filename)) {
        processedBuffer = await this.processImage(buffer, options);
      }

      // In a real implementation, you would upload to IPFS here
      const mockHash = this.generateMockHash();
      const mockUrl = `${this.gatewayUrl}${mockHash}`;

      return {
        hash: mockHash,
        url: mockUrl,
        size: processedBuffer.length,
        originalSize: buffer.length
      };
    } catch (error) {
      console.error('Error uploading buffer to IPFS:', error);
      throw new Error('Failed to upload buffer to IPFS');
    }
  }

 
  // Pin file to IPFS
  async pinFile(hash) {
    try {
      // In a real implementation, you would pin the file
      console.log(`Pinning file ${hash} to IPFS (mock)`);
      return { hash, pinned: true };
    } catch (error) {
      console.error('Error pinning file:', error);
      throw new Error('Failed to pin file');
    }
  }

  // Unpin file from IPFS
  async unpinFile(hash) {
    try {
      // In a real implementation, you would unpin the file
      console.log(`Unpinning file ${hash} from IPFS (mock)`);
      return { hash, unpinned: true };
    } catch (error) {
      console.error('Error unpinning file:', error);
      throw new Error('Failed to unpin file');
    }
  }

  // Get file from IPFS
  async getFile(hash) {
    try {
      // In a real implementation, you would fetch from IPFS
      const url = `${this.gatewayUrl}${hash}`;
      return { hash, url };
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw new Error('Failed to get file from IPFS');
    }
  }

  // Process image with Sharp
  async processImage(buffer, options = {}) {
    try {
      const {
        width = 1920,
        height = 1080,
        quality = 85,
        format = 'jpeg'
      } = options;

      let sharpInstance = sharp(buffer);

      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert format and set quality
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      console.error('Error processing image:', error);
      return buffer; // Return original buffer if processing fails
    }
  }

  // Check if file is an image
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  // Generate mock hash for development
  generateMockHash() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = 'Qm';
    for (let i = 0; i < 44; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }

  // Get IPFS node info
  async getNodeInfo() {
    try {
      // In a real implementation, you would get actual node info
      return {
        id: 'mock-node-id',
        version: '0.15.0',
        addresses: ['/ip4/127.0.0.1/tcp/5001'],
        protocols: ['/ipfs/id/1.0.0'],
        agentVersion: 'go-ipfs/0.15.0'
      };
    } catch (error) {
      console.error('Error getting node info:', error);
      throw new Error('Failed to get node info');
    }
  }

  // Check if IPFS is available
  async isAvailable() {
    try {
      // In a real implementation, you would ping the IPFS node
      return true;
    } catch (error) {
      return false;
    }
  }

 
}

module.exports = new IPFSService();
