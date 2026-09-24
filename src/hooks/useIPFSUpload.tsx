/** @format */

import { useState } from 'react';
import { PinataFileManager } from '@/lib/ipfs';
import toast from 'react-hot-toast';



interface AssetsCreationMetadata {
    title: string;
    description: string;
    category: string;
    price: string;
    currency: 'USDT' | 'ETH';
    images: File[];
    documents: File[];
    validatorId: string;
}

const useIPFSUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pinataManager = new PinataFileManager();

 

  const uploadAssetsCreation = async (
    metadata: AssetsCreationMetadata
  ): Promise<{ [key: string]: string }> => {
    setLoading(true);
    setError(null);
    const fileUrls: { [key: string]: string } = {};

    try {
      console.log('Starting IPFS upload process with metadata:', metadata);

      // Upload images to IPFS
      console.log('Uploading images to IPFS...');
      const imageUploads = await Promise.all(
        metadata.images.map(async (file) => {
          const cid = await pinataManager.uploadFile(file, 'public', {
            name: `${metadata.title}-image-${file.name}`,
            keyvalues: {
              type: 'asset_image',
              asset_title: metadata.title,
            },
          });
          console.log(`Image uploaded successfully - File: ${file.name}, CID: ${cid}`);
          return cid;
        })
      );
      console.log('All images uploaded. CIDs:', imageUploads);

      // Upload documents to IPFS
      console.log('Uploading documents to IPFS...');
      const documentUploads = await Promise.all(
        metadata.documents.map(async (file) => {
          const cid = await pinataManager.uploadFile(file, 'public', {
            name: `${metadata.title}-document-${file.name}`,
            keyvalues: {
              type: 'asset_document',
              asset_title: metadata.title,
            },
          });
          console.log(`Document uploaded successfully - File: ${file.name}, CID: ${cid}`);
          return cid;
        })
      );
      console.log('All documents uploaded. CIDs:', documentUploads);

      // Prepare metadata object for IPFS
      const ipfsMetadata = {
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        price: metadata.price,
        currency: metadata.currency,
        validatorId: metadata.validatorId,
        images: imageUploads,
        documents: documentUploads,
        timestamp: new Date().toISOString(),
      };
      console.log('Prepared metadata for IPFS:', ipfsMetadata);

      // Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataCID = await pinataManager.uploadJSON(ipfsMetadata, 'public', {
        name: `${metadata.title}-metadata`,
        keyvalues: {
          type: 'asset_metadata',
          category: metadata.category,
        },
      });
      console.log('Metadata uploaded successfully. CID:', metadataCID);

      fileUrls['metadata'] = metadataCID;
      fileUrls['images'] = JSON.stringify(imageUploads);
      fileUrls['documents'] = JSON.stringify(documentUploads);

      console.log('Final file URLs:', fileUrls);
      return fileUrls;
    } catch (err: any) {
      console.error('Error during IPFS upload:', err);
      const errorMessage =
        err.message || 'An error occurred while uploading to IPFS';
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  


  return { uploadAssetsCreation, loading, error };
};

export default useIPFSUpload;