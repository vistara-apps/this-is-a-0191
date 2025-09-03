import React, { useState, useCallback } from 'react';
import { PageLayout } from './components/layout/PageLayout';
import { UploadZone } from './components/upload/UploadZone';
import { PhotoGrid } from './components/photos/PhotoGrid';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { StatsCard } from './components/dashboard/StatsCard';
import { aiService } from './services/aiService';
import { Photo, ClaimBatch } from './types';
import { 
  Camera, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  TrendingUp
} from 'lucide-react';

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<ClaimBatch | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Create new batch
    const batch: ClaimBatch = {
      id: `batch_${Date.now()}`,
      userId: 'user_1',
      uploadedAt: new Date(),
      status: 'processing',
      photos: []
    };

    const newPhotos: Photo[] = [];
    const photoPromises = files.map(async (file, index) => {
      const url = URL.createObjectURL(file);
      
      // Simulate processing delay and update progress
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress((index + 1) / files.length * 100);
      
      const analysis = await aiService.analyzePhoto(url, file.name);
      
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

      return photo;
    });

    const processedPhotos = await Promise.all(photoPromises);
    
    // Detect duplicates
    const duplicateNames = aiService.detectDuplicates(
      processedPhotos.map(p => ({ url: p.url, name: p.name }))
    );
    
    processedPhotos.forEach(photo => {
      if (duplicateNames.includes(photo.name)) {
        photo.isDuplicate = true;
      }
    });

    batch.photos = processedPhotos;
    batch.status = 'completed';
    batch.processedAt = new Date();

    setPhotos(processedPhotos);
    setCurrentBatch(batch);
    setIsProcessing(false);
    setProcessingProgress(0);
  }, []);

  const handlePhotoSelect = useCallback((photo: Photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      } else {
        return [...prev, photo];
      }
    });
  }, []);

  const handleGenerateReport = useCallback(async (reportPhotos: Photo[]): Promise<string> => {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportUrl = `report_${Date.now()}.pdf`;
    
    if (currentBatch) {
      currentBatch.reportUrl = reportUrl;
    }
    
    return reportUrl;
  }, [currentBatch]);

  // Calculate stats
  const stats = {
    totalPhotos: photos.length,
    flaggedPhotos: photos.filter(p => p.isDuplicate || p.qualityScore < 70).length,
    avgQuality: photos.length > 0 ? Math.round(photos.reduce((acc, p) => acc + p.qualityScore, 0) / photos.length) : 0,
    damageTypes: new Set(photos.map(p => p.damageType)).size
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            AI-Powered Claims Processing
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Upload property damage photos and let our AI automatically categorize, 
            tag, and generate compliance-ready reports in minutes.
          </p>
        </div>

        {/* Stats Dashboard */}
        {photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Photos"
              value={stats.totalPhotos}
              icon={Camera}
              color="primary"
            />
            <StatsCard
              title="Damage Types"
              value={stats.damageTypes}
              icon={BarChart3}
              color="success"
            />
            <StatsCard
              title="Average Quality"
              value={`${stats.avgQuality}%`}
              icon={TrendingUp}
              color={stats.avgQuality >= 80 ? 'success' : 'warning'}
            />
            <StatsCard
              title="Flagged Items"
              value={stats.flaggedPhotos}
              subtitle={stats.flaggedPhotos > 0 ? 'Need attention' : 'All clear'}
              icon={AlertTriangle}
              color={stats.flaggedPhotos > 0 ? 'warning' : 'success'}
            />
          </div>
        )}

        {/* Upload Section */}
        {photos.length === 0 && (
          <UploadZone 
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
            variant="dragDrop"
          />
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="bg-surface rounded-lg shadow-card p-6">
            <div className="flex items-center space-x-4">
              <Clock className="w-6 h-6 text-primary" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-primary font-medium">Processing Photos...</span>
                  <span className="text-text-secondary">{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && !isProcessing && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Processed Photos
                </h2>
                <p className="text-white/70">
                  {selectedPhotos.length > 0 
                    ? `${selectedPhotos.length} photos selected for report` 
                    : 'Click photos to select them for the report'
                  }
                </p>
              </div>
              <UploadZone 
                onFilesSelected={handleFilesSelected}
                isProcessing={isProcessing}
                variant="button"
              />
            </div>

            <PhotoGrid 
              photos={photos}
              onPhotoSelect={handlePhotoSelect}
              selectedPhotos={selectedPhotos}
              showFilters={true}
            />
          </div>
        )}

        {/* Report Generation */}
        {photos.length > 0 && !isProcessing && (
          <ReportGenerator
            photos={photos}
            selectedPhotos={selectedPhotos}
            onGenerateReport={handleGenerateReport}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default App;