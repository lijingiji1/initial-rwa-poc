/** @format */

import { PinataSDK } from "pinata";

interface FileMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

export class PinataFileManager {
  private pinata: PinataSDK;
  private gateway: string;

  constructor() {
    if (!import.meta.env.VITE_PINATA_JWT) {
      throw new Error('PINATA_JWT environment variable is required');
    }
    if (!import.meta.env.VITE_GATEWAY_URL) {
      throw new Error('NEXT_PUBLIC_GATEWAY_URL environment variable is required');
    }

    this.pinata = new PinataSDK({
      pinataJwt: import.meta.env.VITE_PINATA_JWT,
      pinataGateway: import.meta.env.VITE_GATEWAY_URL,
    });
    this.gateway = import.meta.env.VITE_GATEWAY_URL;
  }

  async uploadFile(
    file: File,
    network: 'public' ,
    metadata?: FileMetadata
  ): Promise<string> {
    try {
      console.log(file,metadata);
      let uploadChain = network === 'public'
        ? this.pinata.upload.public.file(file):console.log("network not connected to public ");

      if (metadata?.name && uploadChain) uploadChain = uploadChain.name(metadata.name);
      if (metadata?.keyvalues && uploadChain) uploadChain = uploadChain.keyvalues(metadata.keyvalues);

      const result = await uploadChain;
      return result?.cid || '';
    } catch (error) {
      console.error(`Error uploading file to ${network} IPFS:`, error);
      throw new Error(`Failed to upload file to ${network} IPFS`);
    }
  }

  async uploadFiles(
    files: File[],
    network: 'public' | 'private',
    metadata?: FileMetadata
  ): Promise<string[]> {
    try {
      if (!files.length) {
        throw new Error('Company metadata upload requires at least one document file');
      }

      const uploadChain = Promise.all(files.map(file => {
        let fileChain = network === 'public'
          ? this.pinata.upload.public.file(file)
          : this.pinata.upload.private.file(file);

        fileChain = metadata?.name ? fileChain.name(metadata.name) : fileChain;
        fileChain = metadata?.keyvalues ? fileChain.keyvalues(metadata.keyvalues) : fileChain;

        return fileChain.then(result => result.cid);
      }));

      return uploadChain;
    } catch (error) {
      console.error(`IPFS upload failure: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        network,
        fileCount: files.length,
        fileTypes: files.map(f => f.type)
      });
      throw new Error(`IPFS upload failed: ${error instanceof Error ? error.message : 'Check console for details'}`);
    }
  }

  async uploadJSON(
    data: any,
    network: 'public' | 'private',
    metadata?: FileMetadata
  ): Promise<string> {
    try {
      let uploadChain = network === 'public'
        ? this.pinata.upload.public.json(data)
        : this.pinata.upload.private.json(data);

      if (metadata?.name) uploadChain = uploadChain.name(metadata.name);
      if (metadata?.keyvalues) uploadChain = uploadChain.keyvalues(metadata.keyvalues);

      const result = await uploadChain;
      return result.cid;
    } catch (error) {
      console.error(`Error uploading JSON to ${network} IPFS:`, error);
      throw new Error(`Failed to upload JSON to ${network} IPFS`);
    }
  }

  async listFiles(
    network: 'public' | 'private',
    filters?: { status?: 'pinned' | 'unpinned' }
  ): Promise<any[]> {
    try {
      const result = network === 'public'
        ? await this.pinata.files.public.list()
        : await this.pinata.files.private.list();
      return result.files; // Use 'files' based on SDK response structure
    } catch (error) {
      console.error(`Error listing ${network} files:`, error);
      throw new Error(`Failed to list ${network} files`);
    }
  }

  async updateFileMetadata(
    network: 'public' | 'private',
    fileId: string,
    metadata: FileMetadata
  ): Promise<void> {
    try {
      const updateData = {
        id: fileId,
        name: metadata.name,
        keyvalues: metadata.keyvalues,
      };
      if (network === 'public') {
        await this.pinata.files.public.update(updateData);
      } else {
        await this.pinata.files.private.update(updateData);
      }
    } catch (error) {
      console.error(`Error updating ${network} file metadata:`, error);
      throw new Error(`Failed to update ${network} file metadata`);
    }
  }

  async deleteFile(network: 'public' | 'private', fileId: string): Promise<void> {
    try {
      if (network === 'public') {
        await this.pinata.files.public.delete([fileId]);
      } else {
        await this.pinata.files.private.delete([fileId]);
      }
    } catch (error) {
      console.error(`Error deleting ${network} file:`, error);
      throw new Error(`Failed to delete ${network} file`);
    }
  }

  async getFileURL(cid: string, network: 'public' | 'private'): Promise<string> {
    try {
      const signedUrl = this.pinata.upload.public.createSignedURL({
        
        expires: 3600, // 1 hour
      });
      
      return signedUrl;
    } catch (error) {
      console.error(`Error generating ${network} file URL:`, error);
      throw new Error(`Failed to generate ${network} file URL`);
    }
  }
}