import { supabaseService } from './supabaseService';

interface UploadResult {
  url: string;
  path: string;
  error: Error | null;
}

class StorageService {
  private readonly BUCKET_NAME = 'claim-photos';
  
  async uploadPhoto(file: File, userId: string): Promise<UploadResult> {
    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { url, error } = await supabaseService.uploadPhoto(file, userId);
      
      if (error) {
        throw error;
      }
      
      return {
        url,
        path: filePath,
        error: null
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error : new Error('Unknown error during upload')
      };
    }
  }
  
  async uploadMultiplePhotos(files: File[], userId: string): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadPhoto(file, userId));
    return Promise.all(uploadPromises);
  }
  
  async deletePhoto(filePath: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabaseService.deletePhoto(filePath);
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return {
        error: error instanceof Error ? error : new Error('Unknown error during deletion')
      };
    }
  }
  
  getPublicUrl(filePath: string): string {
    // This would typically call the Supabase getPublicUrl method
    // For now, we'll just return the path as we're using the URLs directly from the upload
    return filePath;
  }
  
  // Helper method to check if a file is an image
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }
  
  // Helper method to validate file size
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

export const storageService = new StorageService();

