import React, { useCallback, useState } from 'react';
import { Upload, Image, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  variant?: 'dragDrop' | 'button';
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFilesSelected, 
  isProcessing, 
  variant = 'dragDrop' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select only image files');
      return;
    }

    if (imageFiles.length > 50) {
      setError('Maximum 50 images allowed per batch');
      return;
    }

    onFilesSelected(imageFiles);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (files.length > 50) {
      setError('Maximum 50 images allowed per batch');
      return;
    }

    onFilesSelected(files);
  }, [onFilesSelected]);

  if (variant === 'button') {
    return (
      <div className="text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg font-medium cursor-pointer transition-all ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/90 hover:scale-105'
          }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Select Photos'}
        </label>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
        isDragOver 
          ? 'border-accent bg-accent/10' 
          : 'border-white/30 hover:border-white/50'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full ${isDragOver ? 'bg-accent/20' : 'bg-white/10'}`}>
            <Image className="w-12 h-12 text-white/80" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {isProcessing ? 'Processing Photos...' : 'Upload Property Damage Photos'}
          </h3>
          <p className="text-white/70">
            Drag and drop your photos here, or click to select files
          </p>
          <p className="text-sm text-white/50">
            Supports: JPEG, PNG, WebP • Max 50 photos per batch
          </p>
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="drag-file-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="drag-file-upload"
          className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg font-medium cursor-pointer transition-all ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/90'
          }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Select Files'}
        </label>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};