import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { aiService } from '../services/aiService';
import { Photo, ClaimBatch } from '../types';

interface UsePhotoUploadResult {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  currentBatch: ClaimBatch | null;
  uploadPhotos: (files: File[]) => Promise<ClaimBatch | null>;
  resetUpload: () => void;
}

export const usePhotoUpload = (): UsePhotoUploadResult => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [currentBatch, setCurrentBatch] = useState<ClaimBatch | null>(null);

  const uploadPhotos = useCallback(async (files: File[]): Promise<ClaimBatch | null> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return null;
    }

    if (files.length === 0) {
      setError(new Error('No files selected'));
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create a new batch in the database
      const { batch: newBatch, error: batchError } = await supabaseService.createClaimBatch({
        userId: user.id,
        uploadedAt: new Date(),
        status: 'uploading',
        photos: []
      });

      if (batchError) {
        throw batchError;
      }

      if (!newBatch) {
        throw new Error('Failed to create batch');
      }

      // Process each file
      const processedPhotos: Photo[] = [];
      let completedUploads = 0;

      // Upload files in parallel with progress tracking
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Upload file to storage
          const { url, error: uploadError } = await storageService.uploadPhoto(file, user.id);

          if (uploadError) {
            throw uploadError;
          }

          // Analyze the photo with AI
          const analysis = await aiService.analyzePhoto(url, file.name);

          // Create a photo object
          const photo: Photo = {
            id: `photo_${Date.now()}_${index}`,
            url,
            name: file.name,
            size: file.size,
            aiTags: analysis.tags,
            isDuplicate: false,
            qualityScore: analysis.qualityScore,
            damageType: analysis.damageType,
            locationTag: analysis.locationTag,
            processedAt: new Date()
          };

          // Save the photo to the database
          const { photo: savedPhoto, error: photoError } = await supabaseService.createPhoto(photo, newBatch.id);

          if (photoError) {
            throw photoError;
          }

          // Update progress
          completedUploads++;
          setProgress((completedUploads / files.length) * 100);

          return photo;
        } catch (error) {
          console.error(`Error processing photo ${file.name}:`, error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const photos = await Promise.all(uploadPromises);
      processedPhotos.push(...photos);

      // Detect duplicates
      const duplicateNames = aiService.detectDuplicates(
        processedPhotos.map(p => ({ url: p.url, name: p.name }))
      );

      // Update duplicate flags
      for (const photo of processedPhotos) {
        if (duplicateNames.includes(photo.name)) {
          photo.isDuplicate = true;
          // Update in database
          await supabaseService.updatePhoto(photo.id, { isDuplicate: true });
        }
      }

      // Update batch status
      const { batch: updatedBatch, error: updateError } = await supabaseService.updateClaimBatch(newBatch.id, {
        status: 'completed',
        processedAt: new Date()
      });

      if (updateError) {
        throw updateError;
      }

      if (!updatedBatch) {
        throw new Error('Failed to update batch');
      }

      // Create the final batch object
      const finalBatch: ClaimBatch = {
        id: updatedBatch.id,
        userId: updatedBatch.user_id,
        uploadedAt: new Date(updatedBatch.uploaded_at),
        processedAt: updatedBatch.processed_at ? new Date(updatedBatch.processed_at) : undefined,
        status: updatedBatch.status,
        reportUrl: updatedBatch.report_url,
        photos: processedPhotos
      };

      setCurrentBatch(finalBatch);
      return finalBatch;
    } catch (error) {
      console.error('Error uploading photos:', error);
      setError(error instanceof Error ? error : new Error('Unknown error during upload'));
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [user]);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setCurrentBatch(null);
  }, []);

  return {
    isUploading,
    progress,
    error,
    currentBatch,
    uploadPhotos,
    resetUpload
  };
};

export default usePhotoUpload;

