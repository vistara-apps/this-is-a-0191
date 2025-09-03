import OpenAI from 'openai';

interface PhotoAnalysisResult {
  tags: string[];
  damageType: 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other';
  qualityScore: number;
  locationTag?: string;
}

class OpenAIService {
  private openai: OpenAI;
  private isConfigured: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from the backend
      });
      this.isConfigured = true;
    } else {
      this.openai = new OpenAI({
        apiKey: 'dummy-key',
        dangerouslyAllowBrowser: true,
      });
      this.isConfigured = false;
      console.warn('OpenAI API key not configured. Using mock implementation.');
    }
  }

  async analyzePhoto(imageUrl: string, fileName: string): Promise<PhotoAnalysisResult> {
    if (!this.isConfigured) {
      return this.mockAnalyzePhoto();
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert insurance adjuster specializing in property damage assessment. 
            Analyze the provided image and identify the type of damage, location, and any relevant details.
            Focus on identifying the following damage types: water, fire, structural, electrical, wind, or other.
            Also assess the image quality for insurance documentation purposes on a scale of 0-100.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this property damage photo and provide the following information in JSON format:" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure the response has the expected format
      return {
        tags: result.tags || [],
        damageType: this.validateDamageType(result.damageType),
        qualityScore: result.qualityScore || 75,
        locationTag: result.locationTag || this.detectLocationFromFileName(fileName)
      };
    } catch (error) {
      console.error('Error analyzing photo with OpenAI:', error);
      // Fallback to mock implementation if API call fails
      return this.mockAnalyzePhoto();
    }
  }

  private validateDamageType(damageType: string): 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other' {
    const validTypes = ['water', 'fire', 'structural', 'electrical', 'wind', 'other'];
    const normalizedType = damageType?.toLowerCase() || '';
    
    // Check if the type is valid or find a close match
    if (validTypes.includes(normalizedType)) {
      return normalizedType as any;
    }
    
    // Try to map to a valid type
    if (normalizedType.includes('water') || normalizedType.includes('flood') || normalizedType.includes('leak')) {
      return 'water';
    } else if (normalizedType.includes('fire') || normalizedType.includes('burn') || normalizedType.includes('smoke')) {
      return 'fire';
    } else if (normalizedType.includes('structural') || normalizedType.includes('foundation') || normalizedType.includes('wall')) {
      return 'structural';
    } else if (normalizedType.includes('electrical') || normalizedType.includes('wiring') || normalizedType.includes('circuit')) {
      return 'electrical';
    } else if (normalizedType.includes('wind') || normalizedType.includes('storm') || normalizedType.includes('hurricane')) {
      return 'wind';
    }
    
    return 'other';
  }

  private detectLocationFromFileName(fileName: string): string | undefined {
    const locationKeywords = {
      'kitchen': ['kitchen', 'sink', 'stove', 'refrigerator', 'fridge', 'oven', 'counter'],
      'bathroom': ['bathroom', 'bath', 'shower', 'toilet', 'sink'],
      'bedroom': ['bedroom', 'bed', 'master'],
      'living room': ['living', 'family room', 'lounge'],
      'basement': ['basement', 'cellar'],
      'attic': ['attic', 'loft'],
      'garage': ['garage', 'carport'],
      'roof': ['roof', 'ceiling'],
      'exterior': ['exterior', 'outside', 'outdoor', 'yard', 'garden']
    };
    
    const lowerFileName = fileName.toLowerCase();
    
    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(keyword => lowerFileName.includes(keyword))) {
        return location;
      }
    }
    
    return undefined;
  }

  private mockAnalyzePhoto(): PhotoAnalysisResult {
    // Mock implementation for testing or when API key is not available
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
    // In a real implementation, this would use image comparison algorithms
    // For now, we'll use a simple name-based approach
    const duplicateIds: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      for (let j = i + 1; j < photos.length; j++) {
        // Simple name-based duplicate detection
        if (photos[i].name.split('.')[0] === photos[j].name.split('.')[0]) {
          duplicateIds.push(photos[j].name);
        }
      }
    }
    
    return duplicateIds;
  }
}

export const openaiService = new OpenAIService();

