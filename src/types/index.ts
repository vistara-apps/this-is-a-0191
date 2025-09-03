export interface Photo {
  id: string;
  url: string;
  name: string;
  size: number;
  aiTags: string[];
  isDuplicate: boolean;
  qualityScore: number;
  damageType: 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other';
  locationTag?: string;
  processedAt?: Date;
}

export interface ClaimBatch {
  id: string;
  userId: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  photos: Photo[];
  reportUrl?: string;
}

export interface User {
  id: string;
  email: string;
  subscriptionPlan: 'basic' | 'pro' | 'enterprise';
  createdAt: Date;
}