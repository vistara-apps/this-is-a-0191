import React, { useState, useCallback, useRef } from 'react';
import { Upload, Image, FileText, X, Clock } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  variant: 'dragDrop' | 'button';
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isProcessing,
  variant,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10, // 10MB
  maxFiles = 50
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFiles = useCallback((files: File[]): File[] => {
    setError(null);
    
    if (files.length === 0) {
      return [];
    }
    
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return [];
    }
    
    const validFiles = Array.from(files).filter(file => {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        setError(`File type not supported: ${file.name}. Please upload only images.`);
        return false;
      }
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is ${maxFileSize}MB.`);
        return false;
      }
      
      return true;
    });
    
    return validFiles;
  }, [acceptedFileTypes, maxFileSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isProcessing) return;
    
    const { files } = e.dataTransfer;
    const validFiles = validateFiles(Array.from(files));
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [isProcessing, onFilesSelected, validateFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    
    const { files } = e.target;
    if (!files) return;
    
    const validFiles = validateFiles(Array.from(files));
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isProcessing, onFilesSelected, validateFiles]);

  const handleButtonClick = useCallback(() => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  }, [isProcessing]);

  if (variant === 'button') {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        <button
          onClick={handleButtonClick}
          disabled={isProcessing}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            isProcessing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isProcessing ? (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload Photos
            </>
          )}
        </button>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : isProcessing
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium text-text-primary">
              {isProcessing ? 'Processing Photos...' : 'Upload Property Damage Photos'}
            </h3>
            <p className="mt-2 text-text-secondary">
              {isProcessing
                ? 'Please wait while we analyze your photos'
                : 'Drag and drop photos here, or click to browse'}
            </p>
          </div>
          
          {!isProcessing && (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Image className="w-4 h-4" />
                <span>JPG, PNG, WebP</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <FileText className="w-4 h-4" />
                <span>Up to {maxFileSize}MB per file</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Upload className="w-4 h-4" />
                <span>Up to {maxFiles} files</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <X className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
};

