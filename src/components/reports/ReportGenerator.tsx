import React, { useState, useCallback } from 'react';
import { Photo } from '../../types';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  X,
  Printer,
  Share
} from 'lucide-react';

interface ReportGeneratorProps {
  photos: Photo[];
  selectedPhotos: Photo[];
  batchId?: string;
  onGenerateReport?: (photos: Photo[]) => Promise<string>;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  photos,
  selectedPhotos,
  batchId,
  onGenerateReport
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Report settings
  const [reportTitle, setReportTitle] = useState(`Claim Report ${new Date().toLocaleDateString()}`);
  const [includeAllPhotos, setIncludeAllPhotos] = useState(false);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [includeLowQuality, setIncludeLowQuality] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'html' | 'json'>('pdf');

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const photosToInclude = includeAllPhotos ? photos : selectedPhotos;
      
      if (photosToInclude.length === 0) {
        throw new Error('Please select at least one photo for the report');
      }
      
      // Filter photos based on settings
      let filteredPhotos = [...photosToInclude];
      
      if (!includeDuplicates) {
        filteredPhotos = filteredPhotos.filter(photo => !photo.isDuplicate);
      }
      
      if (!includeLowQuality) {
        filteredPhotos = filteredPhotos.filter(photo => photo.qualityScore >= 70);
      }
      
      if (filteredPhotos.length === 0) {
        throw new Error('No photos match your report settings. Try adjusting your filters.');
      }
      
      let url: string;
      
      if (onGenerateReport) {
        // Use the provided callback (for demo/testing)
        url = await onGenerateReport(filteredPhotos);
      } else if (batchId) {
        // Use the report service
        const { reportUrl, error } = await reportService.generateReport(
          filteredPhotos,
          batchId,
          {
            title: reportTitle,
            includeAllPhotos,
            includeDuplicates,
            includeLowQuality,
            format: reportFormat
          }
        );
        
        if (error) {
          throw error;
        }
        
        url = reportUrl;
      } else {
        throw new Error('No batch ID provided');
      }
      
      setReportUrl(url);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Unknown error generating report');
    } finally {
      setIsGenerating(false);
    }
  }, [
    photos, 
    selectedPhotos, 
    onGenerateReport, 
    batchId, 
    includeAllPhotos, 
    includeDuplicates, 
    includeLowQuality, 
    reportTitle, 
    reportFormat
  ]);

  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Generate Report</h2>
          <p className="text-text-secondary mt-1">
            {includeAllPhotos 
              ? `Create a report with all ${photos.length} photos` 
              : `Create a report with ${selectedPhotos.length} selected photos`
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              showSettings
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-100 text-text-primary hover:bg-gray-200'
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Report Settings
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || (!includeAllPhotos && selectedPhotos.length === 0)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              isGenerating
                ? 'bg-primary/70 text-white cursor-not-allowed'
                : (!includeAllPhotos && selectedPhotos.length === 0)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Report Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reportTitle" className="block text-sm font-medium text-text-secondary mb-1">
                Report Title
              </label>
              <input
                id="reportTitle"
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="reportFormat" className="block text-sm font-medium text-text-secondary mb-1">
                Report Format
              </label>
              <select
                id="reportFormat"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value as 'pdf' | 'html' | 'json')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="pdf">PDF Document</option>
                <option value="html">HTML Report</option>
                <option value="json">JSON Data</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                id="includeAllPhotos"
                type="checkbox"
                checked={includeAllPhotos}
                onChange={(e) => setIncludeAllPhotos(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="includeAllPhotos" className="ml-2 text-text-primary">
                Include all photos (not just selected)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="includeDuplicates"
                type="checkbox"
                checked={includeDuplicates}
                onChange={(e) => setIncludeDuplicates(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="includeDuplicates" className="ml-2 text-text-primary">
                Include duplicate photos
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="includeLowQuality"
                type="checkbox"
                checked={includeLowQuality}
                onChange={(e) => setIncludeLowQuality(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="includeLowQuality" className="ml-2 text-text-primary">
                Include low quality photos
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {reportUrl && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Report Generated Successfully</h3>
              <p className="text-text-secondary mt-1">
                Your report is ready to download or share
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a
              href={reportUrl}
              download={`${reportTitle}.${reportFormat}`}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </a>
            
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Report
            </a>
            
            <button className="flex items-center px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors">
              <Share className="w-5 h-5 mr-2" />
              Share Report
            </button>
            
            <button className="flex items-center px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors">
              <Printer className="w-5 h-5 mr-2" />
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

