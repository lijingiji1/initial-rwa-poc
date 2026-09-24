import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Upload, Shield, Camera, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import useIPFSUpload from "@/hooks/useIPFSUpload";
import { useNotificationStore } from '@/store/notificationStore';
import { mockValidators } from '@/data/mockData';
import { toast } from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  category: string;
  price: string;
  currency: 'USDT' | 'ETH';
  images: File[];
  documents: File[];
  validatorId: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  category: '',
  price: '',
  currency: 'USDT',
  images: [],
  documents: [],
  validatorId: '',
};

export default function TokenizePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { uploadAssetsCreation, loading: ipfsLoading } = useIPFSUpload();

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles],
      }));
    },
  });

  const {
    getRootProps: getDocumentRootProps,
    getInputProps: getDocumentInputProps,
  } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...acceptedFiles],
      }));
    },
  });

  const handleSubmit = async () => {
    try {
      setStep(3); // Ensure we're on the final step
      
      // Show loading notification
      toast.loading('Uploading your asset to IPFS...', {
        id: 'ipfs-upload'
      });

      // Upload to IPFS
      const ipfsResults = await uploadAssetsCreation(formData);
      console.log('IPFS Upload Results:', ipfsResults);

      // Show success notification
      toast.success('Asset uploaded successfully!', {
        id: 'ipfs-upload'
      });

      addNotification({
        type: 'success',
        title: 'Asset Submitted',
        message: 'Your asset has been submitted for validation.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      
      // Show error notification
      toast.error('Failed to upload asset', {
        id: 'ipfs-upload'
      });

      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your asset. Please try again.',
      });
    }
  };

  const steps = [
    { number: 1, title: 'Asset Details', icon: FileText },
    { number: 2, title: 'Upload Documents', icon: Upload },
    { number: 3, title: 'Select Validator', icon: Shield },
  ];

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tokenize hiii Your Asset</h1>

        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex flex-col items-center ${
                i < steps.length - 1 ? 'flex-1' : ''
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s.number ? 'bg-primary-600 text-white' : 'bg-neutral-200'
                }`}>
                  <s.icon size={20} />
                </div>
                <span className="text-sm mt-2">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-full mx-4 ${
                  step > s.number ? 'bg-primary-600' : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Asset Details</h2>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Asset Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Rolex Daytona 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  <option value="">Select a category</option>
                  <option value="watches">Watches</option>
                  <option value="art">Art</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="jewels">Jewels</option>
                  <option value="real-estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Provide a detailed description of your asset"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USDT' | 'ETH' })}
                    className="input"
                  >
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Upload Documents</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Asset Images
                </label>
                <div
                  {...getImageRootProps()}
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                >
                  <input {...getImageInputProps()} />
                  <Camera className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-600">
                    Drag & drop images here, or click to select files
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Supported formats: JPG, PNG. Max file size: 10MB
                  </p>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }));
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-neutral-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Supporting Documents
                </label>
                <div
                  {...getDocumentRootProps()}
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                >
                  <input {...getDocumentInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-600">
                    Upload certificates, authenticity documents, or any other relevant files
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Supported formats: PDF, JPG, PNG. Max file size: 10MB
                  </p>
                </div>
                {formData.documents.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {formData.documents.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded-lg">
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== index),
                            }));
                          }}
                          className="p-1 hover:bg-neutral-200 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Select Validator</h2>
              <p className="text-neutral-600">
                Choose a validator who specializes in your asset category. They will verify the authenticity and value of your asset.
              </p>
              
              <div className="space-y-4">
                {mockValidators
                  .filter((validator) => validator.expertise.includes(formData.category as any))
                  .map((validator) => (
                    <div
                      key={validator.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.validatorId === validator.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                      onClick={() => setFormData({ ...formData, validatorId: validator.id })}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={validator.avatar}
                          alt={validator.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium">{validator.name}</h3>
                          <p className="text-sm text-neutral-600">
                            {validator.validationCount} validations • {validator.reputation} rating
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
              className="ml-auto"
            >
              {step === 3 ? 'Submit for Validation' : 'Next'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}