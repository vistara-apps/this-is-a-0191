import React, { useState } from 'react';
import { Download, FileText, Share, CheckCircle } from 'lucide-react';
import { Photo } from '../../types';

interface ReportGeneratorProps {
  photos: Photo[];
  selectedPhotos: Photo[];
  onGenerateReport: (photos: Photo[]) => Promise<string>;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  photos,
  selectedPhotos,
  onGenerateReport
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const photosToInclude = selectedPhotos.length > 0 ? selectedPhotos : photos;
      const url = await onGenerateReport(photosToInclude);
      setReportUrl(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportStats = () => {
    const reportPhotos = selectedPhotos.length > 0 ? selectedPhotos : photos;
    const damageTypes = [...new Set(reportPhotos.map(p => p.damageType))];
    const flaggedCount = reportPhotos.filter(p => p.isDuplicate || p.qualityScore < 70).length;
    
    return {
      totalPhotos: reportPhotos.length,
      damageTypes: damageTypes.length,
      flaggedPhotos: flaggedCount,
      averageQuality: Math.round(reportPhotos.reduce((acc, p) => acc + p.qualityScore, 0) / reportPhotos.length)
    };
  };

  const stats = getReportStats();

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Generate Claim Report</h3>
            <p className="text-text-secondary">
              Create a standardized report for insurance claim processing
            </p>
          </div>
          <FileText className="w-8 h-8 text-primary" />
        </div>

        {/* Report Preview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalPhotos}</div>
            <div className="text-sm text-text-secondary">Photos Included</div>
          </div>
          <div className="bg-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.damageTypes}</div>
            <div className="text-sm text-text-secondary">Damage Types</div>
          </div>
          <div className="bg-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.flaggedPhotos}</div>
            <div className="text-sm text-text-secondary">Flagged Items</div>
          </div>
          <div className="bg-bg rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.averageQuality}%</div>
            <div className="text-sm text-text-secondary">Avg Quality</div>
          </div>
        </div>

        {/* Report Contents */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-text-primary mb-3">Report Will Include:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-text-secondary">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Photo categorization by damage type
            </div>
            <div className="flex items-center text-text-secondary">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              AI-generated tags and location information
            </div>
            <div className="flex items-center text-text-secondary">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Quality assessment and duplicate flagging
            </div>
            <div className="flex items-center text-text-secondary">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Summary statistics and recommendations
            </div>
            <div className="flex items-center text-text-secondary">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Insurance-compliant formatting
            </div>
          </div>
        </div>

        {/* Selection Info */}
        {selectedPhotos.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> You have {selectedPhotos.length} photos selected. 
              The report will only include these selected photos.
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || photos.length === 0}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
              isGenerating || photos.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {/* Report Generated */}
        {reportUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Report Generated Successfully!</span>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <button className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};