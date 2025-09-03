import OpenAI from 'openai';

// Mock AI service for demo purposes
// In production, this would use actual OpenAI API
export class AIService {
  private openai: OpenAI;

  constructor() {
    // Initialize with mock configuration
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
      baseURL: "https://openrouter.ai/api/v1",
      dangerouslyAllowBrowser: true,
    });
  }

  async analyzePhoto(imageUrl: string, fileName: string): Promise<{
    tags: string[];
    damageType: 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other';
    qualityScore: number;
    locationTag?: string;
  }> {
    // Mock implementation for demo
    // In production, this would send the image to OpenAI Vision API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const damageTypes = ['water', 'fire', 'structural', 'electrical', 'wind', 'other'] as const;
    const mockTags = [
      'interior damage', 'ceiling damage', 'wall damage', 'floor damage',
      'smoke damage', 'water stains', 'structural cracks', 'electrical damage',
      'broken window', 'roof damage', 'foundation issues', 'mold presence'
    ];

    const selectedTags = mockTags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1);

    return {
      tags: selectedTags,
      damageType: damageTypes[Math.floor(Math.random() * damageTypes.length)],
      qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100
      locationTag: ['kitchen', 'living room', 'bedroom', 'bathroom', 'basement', 'attic'][Math.floor(Math.random() * 6)]
    };
  }

  detectDuplicates(photos: Array<{ url: string; name: string }>): string[] {
    // Mock duplicate detection
    // In production, this would use image comparison algorithms
    const duplicateIds: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        // Simple name-based duplicate detection for demo
        if (photos[i].name.split('.')[0] === photos[j].name.split('.')[0]) {
          duplicateIds.push(photos[j].name);
        }
      }
    }
    
    return duplicateIds;
  }
}

export const aiService = new AIService();