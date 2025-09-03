import React, { useState, useEffect } from 'react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { UploadZone } from '../components/upload/UploadZone';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { Photo, ClaimBatch } from '../types';
import { 
  Camera, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  FileText
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentBatches, setRecentBatches] = useState<ClaimBatch[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalBatches: 0,
    processedToday: 0,
    avgQuality: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch recent batches
        const { batches, error: batchesError } = await supabaseService.getClaimBatches(user.id);
        
        if (batchesError) {
          throw batchesError;
        }
        
        // Transform data to match our types
        const transformedBatches: ClaimBatch[] = batches.map(batch => ({
          id: batch.id,
          userId: batch.user_id,
          uploadedAt: new Date(batch.uploaded_at),
          processedAt: batch.processed_at ? new Date(batch.processed_at) : undefined,
          status: batch.status,
          reportUrl: batch.report_url,
          photos: batch.photos.map(photo => ({
            id: photo.id,
            url: photo.url,
            name: photo.name,
            size: photo.size,
            aiTags: photo.ai_tags,
            isDuplicate: photo.is_duplicate,
            qualityScore: photo.quality_score,
            damageType: photo.damage_type,
            locationTag: photo.location_tag,
            processedAt: photo.processed_at ? new Date(photo.processed_at) : undefined
          }))
        }));
        
        setRecentBatches(transformedBatches.slice(0, 5));
        
        // Extract recent photos from all batches
        const allPhotos = transformedBatches.flatMap(batch => batch.photos);
        setRecentPhotos(allPhotos.slice(0, 12));
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const processedToday = transformedBatches.filter(
          batch => batch.processedAt && batch.processedAt >= today
        ).length;
        
        const totalQuality = allPhotos.reduce((sum, photo) => sum + photo.qualityScore, 0);
        const avgQuality = allPhotos.length > 0 ? Math.round(totalQuality / allPhotos.length) : 0;
        
        setStats({
          totalPhotos: allPhotos.length,
          totalBatches: transformedBatches.length,
          processedToday,
          avgQuality
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleFilesSelected = async (files: File[]) => {
    // This would be implemented to handle file uploads
    console.log('Files selected:', files);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Welcome to ClaimSnapAI
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Upload property damage photos and let our AI automatically categorize, 
          tag, and generate compliance-ready reports in minutes.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Photos"
          value={stats.totalPhotos}
          icon={Camera}
          color="primary"
        />
        <StatsCard
          title="Claim Batches"
          value={stats.totalBatches}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Average Quality"
          value={`${stats.avgQuality}%`}
          icon={TrendingUp}
          color={stats.avgQuality >= 80 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Processed Today"
          value={stats.processedToday}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Upload Section */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Upload New Photos
        </h2>
        <UploadZone 
          onFilesSelected={handleFilesSelected}
          isProcessing={false}
          variant="dragDrop"
        />
      </div>

      {/* Recent Photos */}
      {recentPhotos.length > 0 && (
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Recent Photos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentPhotos.slice(0, 8).map(photo => (
              <div key={photo.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={photo.url} 
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {recentPhotos.length > 8 && (
            <div className="text-center mt-6">
              <button className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">
                View All Photos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Batches */}
      {recentBatches.length > 0 && (
        <div className="bg-surface rounded-lg shadow-card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Recent Claim Batches
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Batch ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Photos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Report</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map(batch => (
                  <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-text-primary">{batch.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {batch.uploadedAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{batch.photos.length}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : batch.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {batch.reportUrl ? (
                        <a 
                          href={batch.reportUrl} 
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Report
                        </a>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
            <button className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">
              View All Batches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

