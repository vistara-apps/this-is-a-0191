import { openaiService } from './openaiService';

export class AIService {
  async analyzePhoto(imageUrl: string, fileName: string): Promise<{
    tags: string[];
    damageType: 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other';
    qualityScore: number;
    locationTag?: string;
  }> {
    return openaiService.analyzePhoto(imageUrl, fileName);
  }

  detectDuplicates(photos: Array<{ url: string; name: string }>): string[] {
    return openaiService.detectDuplicates(photos);
  }
}

export const aiService = new AIService();
