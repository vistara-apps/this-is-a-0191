import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { ClaimBatch } from '../types';
import { 
  FileText, 
  AlertTriangle, 
  Search, 
  Download, 
  Share, 
  Printer,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ClaimBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<'uploadedAt' | 'processedAt'>('processedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { batches, error: batchesError } = await supabaseService.getClaimBatches(user.id);
        
        if (batchesError) {
          throw batchesError;
        }
        
        // Transform data to match our types and filter for batches with reports
        const transformedBatches: ClaimBatch[] = batches
          .filter(batch => batch.report_url)
          .map(batch => ({
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
        
        setReports(transformedBatches);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [user]);

  const handleSort = (field: 'uploadedAt' | 'processedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getDateFilteredReports = () => {
    if (dateFilter === 'all') return reports;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateFilter === 'today') {
      return reports.filter(report => {
        const processedDate = report.processedAt;
        if (!processedDate) return false;
        return processedDate >= today;
      });
    }
    
    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reports.filter(report => {
        const processedDate = report.processedAt;
        if (!processedDate) return false;
        return processedDate >= weekAgo;
      });
    }
    
    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return reports.filter(report => {
        const processedDate = report.processedAt;
        if (!processedDate) return false;
        return processedDate >= monthAgo;
      });
    }
    
    return reports;
  };

  const filteredReports = getDateFilteredReports()
    .filter(report => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          report.id.toLowerCase().includes(searchLower) ||
          report.photos.some(photo => 
            photo.name.toLowerCase().includes(searchLower) ||
            photo.damageType.toLowerCase().includes(searchLower) ||
            (photo.locationTag && photo.locationTag.toLowerCase().includes(searchLower))
          )
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'uploadedAt') {
        return sortDirection === 'asc'
          ? a.uploadedAt.getTime() - b.uploadedAt.getTime()
          : b.uploadedAt.getTime() - a.uploadedAt.getTime();
      } else if (sortField === 'processedAt') {
        const aTime = a.processedAt ? a.processedAt.getTime() : 0;
        const bTime = b.processedAt ? b.processedAt.getTime() : 0;
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Reports</h3>
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
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-white/80 mt-2">
          View and manage all your generated claim reports
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-text-secondary" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
          
          <div>
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Generate New Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Reports Found</h3>
            <p className="text-text-secondary mb-6">
              You haven't generated any reports yet. Process a claim batch to generate a report.
            </p>
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Go to Claims
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Matching Reports</h3>
            <p className="text-text-secondary">
              No reports match your current search and filters.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-100 text-text-primary rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-text-primary">
                {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <span>Sort by:</span>
                <button 
                  onClick={() => handleSort('processedAt')}
                  className={`flex items-center px-2 py-1 rounded ${
                    sortField === 'processedAt' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                  }`}
                >
                  Date Generated
                  {sortField === 'processedAt' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
                <button 
                  onClick={() => handleSort('uploadedAt')}
                  className={`flex items-center px-2 py-1 rounded ${
                    sortField === 'uploadedAt' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
                  }`}
                >
                  Date Uploaded
                  {sortField === 'uploadedAt' && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-4 h-4 ml-1" /> : 
                      <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {/* Report preview (would be a thumbnail of the actual report) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Photo thumbnails overlay */}
                    <div className="absolute inset-0 flex">
                      {report.photos.slice(0, 4).map((photo, index) => (
                        <div 
                          key={photo.id} 
                          className="flex-1 border border-white"
                          style={{ opacity: 0.9 }}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Photo count badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {report.photos.length} photos
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-text-primary truncate">
                      Claim Report {report.id.slice(0, 8)}
                    </h4>
                    <p className="text-sm text-text-secondary mt-1">
                      Generated: {report.processedAt?.toLocaleDateString()}
                    </p>
                    
                    {/* Damage types */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Array.from(new Set(report.photos.map(p => p.damageType))).map(type => (
                        <span 
                          key={type}
                          className="px-2 py-0.5 bg-gray-100 text-text-secondary rounded-full text-xs"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <a 
                        href={report.reportUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View Report
                      </a>
                      
                      <div className="flex items-center space-x-1">
                        <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                          <Share className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

