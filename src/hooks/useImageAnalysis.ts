import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';

interface ImageAnalysisResult {
  tags: string[];
  damageType: 'water' | 'fire' | 'structural' | 'electrical' | 'wind' | 'other';
  qualityScore: number;
  locationTag?: string;
}

interface UseImageAnalysisResult {
  isAnalyzing: boolean;
  error: Error | null;
  analyzeImage: (imageUrl: string, fileName: string) => Promise<ImageAnalysisResult | null>;
  resetAnalysis: () => void;
}

export const useImageAnalysis = (): UseImageAnalysisResult => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeImage = useCallback(async (
    imageUrl: string, 
    fileName: string
  ): Promise<ImageAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await aiService.analyzePhoto(imageUrl, fileName);
      return result;
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error instanceof Error ? error : new Error('Unknown error during analysis'));
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    error,
    analyzeImage,
    resetAnalysis
  };
};

export default useImageAnalysis;

